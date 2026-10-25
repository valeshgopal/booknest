import type { Metadata } from "next";
import Link from "next/link";
import { BookCover } from "@/components/book-cover";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types";

export const metadata: Metadata = {
  title: "Books",
};

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; updated?: string; deleted?: string }>;
}) {
  const { added, updated, deleted } = await searchParams;
  const highlighted = added ?? updated;

  // Read fresh, not from the catalog cache, so a new book shows up at once.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("slug, title, author, year, pages, genre, blurb, cover, featured")
    .order("sort_order", { ascending: false });
  const books = (data ?? []) as Book[];
  const changedBook = highlighted
    ? books.find((book) => book.slug === highlighted)
    : undefined;
  const status = changedBook
    ? `${added ? "Added" : "Saved changes to"} “${changedBook.title}”.`
    : deleted
      ? `Deleted “${deleted}”.`
      : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Books</h1>
          <p className="mt-2 text-sm text-muted">
            {books.length} {books.length === 1 ? "book" : "books"} in the
            catalog, newest first.
          </p>
        </div>
        <Link
          href="/books/new"
          className="press rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Add book
        </Link>
      </div>

      {status ? (
        <p
          role="status"
          className="mt-6 rounded-md border border-moss/30 bg-moss/10 px-4 py-3 text-sm"
        >
          {status}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-8 text-sm text-accent">
          Couldn’t load books: {error.message}
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {books.map((book) => (
            <li
              key={book.slug}
              className={`flex items-center gap-4 px-2 py-3 ${book.slug === highlighted ? "bg-moss/5" : ""}`}
            >
              <div className="w-10 shrink-0">
                <BookCover book={book} compact />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{book.title}</p>
                <p className="truncate text-sm text-muted">
                  {[book.author, book.year, book.genre].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className="hidden font-mono text-xs text-muted md:block">
                {book.slug}
              </span>
              {book.featured ? (
                <span className="rounded-sm border border-line px-1.5 py-0.5 text-xs text-muted">
                  Featured
                </span>
              ) : null}
              <Link
                href={`/books/${book.slug}/edit`}
                aria-label={`Edit ${book.title}`}
                className="press shrink-0 rounded-md border border-line px-3 py-1.5 text-sm font-medium hover:border-ink"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
