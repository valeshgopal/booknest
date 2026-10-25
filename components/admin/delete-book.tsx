"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteBook } from "@/app/admin/(protected)/books/actions";

export function DeleteBook({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="mt-14 rounded-lg border border-accent/40 p-5 sm:p-6">
      <h2 className="font-serif text-2xl tracking-tight">Delete this book</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        It disappears from the catalog and is removed from every reader’s
        collections. This can’t be undone.
      </p>

      {confirming ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending}
            className="press rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await deleteBook(slug);
                if (result.error) {
                  setError(result.error);
                  return;
                }
                router.push(`/?deleted=${encodeURIComponent(title)}`);
                router.refresh();
              });
            }}
          >
            {pending ? "Deleting…" : `Delete “${title}”`}
          </button>
          <button
            type="button"
            disabled={pending}
            className="press rounded-md border border-line px-4 py-2.5 text-sm font-medium"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="press mt-5 rounded-md border border-accent/50 px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent hover:text-white"
          onClick={() => setConfirming(true)}
        >
          Delete book…
        </button>
      )}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-accent">
          {error}
        </p>
      ) : null}
    </section>
  );
}
