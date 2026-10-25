"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookCover } from "@/components/book-cover";
import { useCatalog } from "@/components/books-catalog";
import { useCollections } from "@/components/collection-provider";
import { booksForSlugs } from "@/lib/books";

export function CollectionDetail({ id }: { id: string }) {
  const router = useRouter();
  const catalog = useCatalog();
  const { ready, collections, removeBook, deleteCollection } = useCollections();
  const [confirming, setConfirming] = useState(false);
  const shelf = collections.find((item) => item.id === id);

  if (!ready) {
    return (
      <div aria-hidden>
        <div className="h-8 w-40 rounded-md bg-line" />
        <div className="mt-6 h-12 w-2/3 rounded-md bg-line" />
        <div className="mt-10 h-24 rounded-lg bg-line" />
      </div>
    );
  }

  if (!shelf) {
    return (
      <div className="max-w-lg">
        <h1 className="font-serif text-4xl tracking-tight">
          Collection not found.
        </h1>
        <p className="mt-4 text-muted">
          It may have been deleted, or it belongs to a different account.
        </p>
        <Link
          href="/collections"
          className="press mt-6 inline-flex rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper"
        >
          All collections
        </Link>
      </div>
    );
  }

  const shelfBooks = booksForSlugs(catalog, shelf.bookSlugs);

  return (
    <div>
      <Link href="/collections" className="text-sm text-muted hover:text-ink">
        All collections
      </Link>
      <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl tracking-tight text-balance sm:text-5xl">
            {shelf.name}
          </h1>
          {shelf.description ? (
            <p className="mt-3 text-lg text-muted">{shelf.description}</p>
          ) : null}
          <p className="mt-3 text-sm text-muted">
            {shelfBooks.length} {shelfBooks.length === 1 ? "book" : "books"}
          </p>
        </div>
        {confirming ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="press rounded-md bg-ink px-3 py-2 text-sm font-medium text-paper"
              onClick={() => {
                void deleteCollection(shelf.id);
                router.push("/collections");
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className="press rounded-md border border-line px-3 py-2 text-sm font-medium"
              onClick={() => setConfirming(false)}
            >
              Keep
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="press self-start rounded-md border border-line px-3 py-2 text-sm font-medium text-muted hover:text-ink"
            onClick={() => setConfirming(true)}
          >
            Delete collection
          </button>
        )}
      </header>

      {shelfBooks.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed border-line px-6 py-14">
          <p className="font-serif text-2xl tracking-tight">
            Nothing saved here yet.
          </p>
          <Link
            href="/books"
            className="press mt-4 inline-flex text-sm font-medium text-accent"
          >
            Browse the library
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {shelfBooks.map((book) => (
            <li key={book.slug} className="flex items-center gap-4 py-4">
              <Link
                href={`/books/${book.slug}`}
                aria-label={book.title}
                className="w-12 shrink-0 sm:w-14"
              >
                <BookCover book={book} compact />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/books/${book.slug}`}
                  className="font-serif text-xl tracking-tight hover:text-accent"
                >
                  {book.title}
                </Link>
                <p className="mt-0.5 truncate text-sm text-muted">
                  {book.year ? `${book.author} · ${book.year}` : book.author}
                </p>
              </div>
              <button
                type="button"
                className="press shrink-0 rounded-md px-2 py-1 text-sm text-muted hover:text-ink"
                onClick={() => void removeBook(shelf.id, book.slug)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
