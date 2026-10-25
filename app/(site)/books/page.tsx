import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";
import { getBooks } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Library",
  description: "Search and filter the BookNest catalog.",
};

export const revalidate = 3600;

// The catalog is cached for an hour. Search and filters still run in the browser.
export default async function BooksPage() {
  const books = await getBooks();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          The library
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-pretty text-muted">
          Search by title or author, or stay inside a genre. Sign in to save
          books into your collections.
        </p>
      </header>
      <Catalog books={books} />
    </div>
  );
}
