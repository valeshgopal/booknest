import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { RECOVERY_COOKIE, forgotPasswordPath } from "@/lib/auth-links";
import { safeNextPath } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose a new password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(next);

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const recoveryFor = (await cookies()).get(RECOVERY_COOKIE)?.value;
  if (!userId || recoveryFor !== userId) {
    redirect(`${forgotPasswordPath(nextPath)}&error=link`);
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-14 sm:py-20">
      <ResetPasswordForm
        next={nextPath}
        email={typeof data.claims.email === "string" ? data.claims.email : null}
      />
    </div>
  );
}
