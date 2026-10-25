"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { BookCover } from "@/components/book-cover";
import { useCatalog } from "@/components/books-catalog";
import { useCollections } from "@/components/collection-provider";
import { booksForSlugs } from "@/lib/books";

export function CollectionsView() {
  const catalog = useCatalog();
  const {
    ready,
    error: loadError,
    collections,
    createCollection,
  } = useCollections();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const nameId = useId();
  const descriptionId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setError("Name the collection first.");
      return;
    }
    setCreating(true);
    const failure = await createCollection({ name: nextName, description });
    setCreating(false);
    if (failure) {
      setError(failure);
      return;
    }
    setName("");
    setDescription("");
    setError("");
  }

  return (
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div>
        {!ready ? (
          <div className="grid gap-4 sm:grid-cols-2" aria-hidden>
            <div className="h-44 rounded-lg border border-line bg-paper-raised" />
            <div className="h-44 rounded-lg border border-line bg-paper-raised" />
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-lg border border-line px-6 py-14">
            <p className="font-serif text-2xl tracking-tight">
              Your collections didn’t load.
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              {loadError} Refresh the page to try again.
            </p>
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line px-6 py-14">
            <p className="font-serif text-2xl tracking-tight">
              No collections yet.
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Create one and add books from the library. It’s saved to your
              account.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {collections.map((shelf) => {
              const shelfBooks = booksForSlugs(catalog, shelf.bookSlugs);
              return (
                <li key={shelf.id}>
                  <Link
                    href={`/collections/${shelf.id}`}
                    className="press flex h-full flex-col justify-between rounded-lg border border-line bg-paper-raised p-5 hover:border-ink"
                  >
                    <div>
                      <h2 className="font-serif text-2xl tracking-tight">
                        {shelf.name}
                      </h2>
                      {shelf.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {shelf.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-8 flex items-end justify-between gap-3">
                      <div className="flex pl-2" aria-hidden>
                        {shelfBooks.slice(0, 3).map((book, index) => (
                          <div
                            key={book.slug}
                            className="w-11"
                            style={{
                              marginLeft: index === 0 ? 0 : -18,
                              zIndex: 3 - index,
                            }}
                          >
                            <BookCover book={book} compact />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-muted">
                        {shelfBooks.length}{" "}
                        {shelfBooks.length === 1 ? "book" : "books"}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="rounded-lg border border-line bg-paper-raised p-5 lg:sticky lg:top-24">
        <h2 className="font-serif text-2xl tracking-tight">New collection</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A name is enough. You can add books after.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <div>
            <label htmlFor={nameId} className="text-sm font-medium">
              Name
            </label>
            <input
              id={nameId}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
              maxLength={48}
              disabled={!ready}
              className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div>
            <label htmlFor={descriptionId} className="text-sm font-medium">
              Description
            </label>
            <textarea
              id={descriptionId}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={140}
              rows={3}
              disabled={!ready}
              className="mt-1.5 w-full resize-none rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none"
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={!ready || creating}
            className="press w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            {creating ? "Creating…" : "Create collection"}
          </button>
        </form>
      </aside>
    </div>
  );
}
