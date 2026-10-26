"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";

const VISIBLE_MS = 6000;

type Notice = "confirmed" | "reset";
const NOTICE_PARAMS: Notice[] = ["confirmed", "reset"];

/**
 * Shown once after an email confirmation link signs the user in, or after a
 * password reset. Reads the URL on mount, so the cached catalog pages don't
 * need to opt into dynamic search params.
 */
export function ConfirmedNotice() {
  const { user } = useAuth();
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const found = NOTICE_PARAMS.find((name) => url.searchParams.get(name) === "1");
    if (!found) return;
    url.searchParams.delete(found);
    window.history.replaceState(window.history.state, "", url);
    setNotice(found);
    const timer = setTimeout(() => setNotice(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  // A hand-typed ?confirmed=1 without a session shows nothing.
  if (!notice || !user) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
      <div
        role="status"
        className="popover-in pointer-events-auto flex items-center gap-3 rounded-lg border border-moss/30 bg-paper-raised px-4 py-3 text-sm shadow-[0_18px_40px_-24px_rgba(28,25,21,0.45)]"
      >
        <span aria-hidden className="grid size-6 place-items-center rounded-full bg-moss text-paper">
          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2.5 6.2 4.8 8.5 9.5 3.5" />
          </svg>
        </span>
        <span>
          {notice === "reset"
            ? "Password updated. You’re signed in."
            : `Email confirmed. You’re signed in as ${user.email ?? user.name}.`}
        </span>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setNotice(null)}
          className="press -mr-1 rounded-md px-1.5 py-0.5 text-muted hover:text-ink"
        >
          ×
        </button>
      </div>
    </div>
  );
}
