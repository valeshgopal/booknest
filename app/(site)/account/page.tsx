import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DeleteAccount } from "@/components/delete-account";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account settings",
};

const providerLabels: Record<string, string> = {
  email: "Email and password",
  google: "Google",
};

export default async function AccountPage() {
  const supabase = await createClient();
  // getUser() checks with the Auth server and includes linked sign-in methods.
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login?next=%2Faccount");

  const providers = Array.from(
    new Set((user.identities ?? []).map((identity) => identity.provider)),
  ).map((provider) => providerLabels[provider] ?? provider);

  const joined = new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
    new Date(user.created_at),
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <header>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          Account settings
        </h1>
      </header>

      <dl className="mt-10 divide-y divide-line border-y border-line text-sm">
        <div className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between">
          <dt className="text-muted">Email</dt>
          <dd className="font-medium">{user.email ?? "None"}</dd>
        </div>
        <div className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between">
          <dt className="text-muted">Sign-in methods</dt>
          <dd className="font-medium">{providers.join(", ") || "None"}</dd>
        </div>
        <div className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between">
          <dt className="text-muted">Member since</dt>
          <dd className="font-medium">{joined}</dd>
        </div>
      </dl>

      <DeleteAccount />
    </div>
  );
}
