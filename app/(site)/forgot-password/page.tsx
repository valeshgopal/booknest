import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string; error?: string }>;
}) {
  const { email, next, error } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md px-5 py-14 sm:py-20">
      <ForgotPasswordForm
        next={safeNextPath(next)}
        initialEmail={email?.trim() ?? ""}
        linkError={
          error === "link"
            ? "That reset link expired, was already used, or was opened in a different browser. Request a new one."
            : null
        }
      />
    </div>
  );
}
