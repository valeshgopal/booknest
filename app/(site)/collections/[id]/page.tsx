import type { Metadata } from "next";
import { CollectionDetail } from "@/components/collection-detail";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Collection",
};

// Authenticated, rendered per request. RLS hides collections owned by other users.
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/collections/${encodeURIComponent(id)}`);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
      <CollectionDetail id={id} />
    </div>
  );
}
