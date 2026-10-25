import type { Metadata } from "next";
import { CollectionsView } from "@/components/collections-view";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Collections",
  description: "Your book collections.",
};

// Authenticated and per-user, so rendered on each request. Rows come from
// Supabase on the client, filtered by RLS to the signed-in user.
export default async function CollectionsPage() {
  await requireUser("/collections");

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          Collections
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-pretty text-muted">
          Make as many collections as you like, then fill them from the
          library. They’re saved to your account.
        </p>
      </header>
      <CollectionsView />
    </div>
  );
}
