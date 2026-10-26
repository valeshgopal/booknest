import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConfirmEmail } from "@/components/confirm-email";
import { safeNextPath } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Confirm your email",
};

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string; sent?: string }>;
}) {
  const { email, next, sent } = await searchParams;
  const nextPath = safeNextPath(next);

  // A session only exists once the email is confirmed, so there's nothing left to do here.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect(nextPath);

  const address = email?.trim();
  if (!address) {
    redirect(`/login?mode=signup&next=${encodeURIComponent(nextPath)}`);
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-14 sm:py-20">
      <ConfirmEmail email={address} next={nextPath} justSent={sent === "1"} />
    </div>
  );
}
