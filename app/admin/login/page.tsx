import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getAdminState } from "@/lib/admin";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const nextPath = safeNextPath(next, "/");

  // Any signed-in user moves on; the dashboard tells non-admins they lack access.
  const state = await getAdminState();
  if (state.status !== "signed-out") redirect(nextPath);

  return (
    <div className="mx-auto w-full max-w-md px-5 py-14 sm:py-20">
      <LoginForm
        next={nextPath}
        allowSignUp={false}
        title="Admin sign in"
        intro="Only the BookNest administrator can sign in here."
        linkError={
          error === "link"
            ? "Sign-in didn’t finish. The Google sign-in may have been cancelled. Try again."
            : null
        }
      />
    </div>
  );
}
