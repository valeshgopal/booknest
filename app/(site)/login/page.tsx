import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { safeNextPath } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; mode?: string }>;
}) {
  const { next, error, mode } = await searchParams;
  const nextPath = safeNextPath(next);

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect(nextPath);

  return (
    <div className="mx-auto w-full max-w-md px-5 py-14 sm:py-20">
      <LoginForm
        next={nextPath}
        initialMode={mode === "signup" ? "sign-up" : "sign-in"}
        linkError={
          error === "link"
            ? "Sign-in didn’t finish. The Google sign-in may have been cancelled, or an email link expired or was opened in a different browser. Try again."
            : null
        }
      />
    </div>
  );
}
