"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { resolveProfile, type ProfileRow } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";

type SessionUser = {
  id: string;
  email: string | null;
  metadata: Record<string, unknown>;
};

type AuthUser = {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
};

type AuthContextValue = {
  ready: boolean;
  user: AuthUser | null;
  signOut: () => Promise<void>;
  applyProfile: (row: ProfileRow) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Signed-in state for the UI only. Access to data is enforced by RLS and by
 * server-side getClaims() checks on protected routes.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<{
    known: boolean;
    user: SessionUser | null;
  }>({ known: false, user: null });
  const [profile, setProfile] = useState<{
    userId: string;
    row: ProfileRow | null;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    // Supabase calls must not be awaited inside this callback, so the profile
    // is fetched by the effect below.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      const nextUser = next?.user
        ? {
            id: next.user.id,
            email: next.user.email ?? null,
            metadata: next.user.user_metadata ?? {},
          }
        : null;
      setSession((current) =>
        current.known &&
        current.user?.id === nextUser?.id &&
        current.user?.email === nextUser?.email
          ? current
          : { known: true, user: nextUser },
      );
    });
    return () => subscription.unsubscribe();
  }, []);

  const userId = session.user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    createClient()
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile({ userId, row: data ?? null });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const applyProfile = useCallback(
    (row: ProfileRow) => {
      if (userId) setProfile({ userId, row });
    },
    [userId],
  );

  const value = useMemo<AuthContextValue>(() => {
    const sessionUser = session.user;
    const profileLoaded = Boolean(sessionUser && profile?.userId === sessionUser.id);
    const resolved = sessionUser
      ? resolveProfile(
          { email: sessionUser.email, user_metadata: sessionUser.metadata },
          profileLoaded ? (profile?.row ?? null) : null,
        )
      : null;

    return {
      ready: session.known && (!sessionUser || profileLoaded),
      user:
        sessionUser && resolved
          ? {
              id: sessionUser.id,
              email: sessionUser.email,
              name: resolved.name,
              avatarUrl: resolved.avatarUrl,
            }
          : null,
      signOut: async () => {
        await createClient().auth.signOut();
        router.push("/");
        router.refresh();
      },
      applyProfile,
    };
  }, [session, profile, router, applyProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
