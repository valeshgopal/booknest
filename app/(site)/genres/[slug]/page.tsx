import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCard } from "@/components/book-card";
import {
  genreToSlug,
  getBooksByGenre,
  getGenreSummaries,
  slugToGenre,
} from "@/lib/books";
import { getBooks } from "@/lib/catalog";
import { genres } from "@/lib/types";

export const revalidate = 3600;

// One cached page per genre. The list itself is fixed; the books come from Supabase.
export function generateStaticParams() {
  return genres.map((genre) => ({ slug: genreToSlug(genre) }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const genre = slugToGenre(slug);
  if (!genre) return { title: "Genre" };
  return {
    title: genre,
    description: `Books filed under ${genre}.`,
  };
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const genre = slugToGenre(slug);
  if (!genre) notFound();
  const catalog = await getBooks();
  const list = getBooksByGenre(catalog, genre);
  const others = getGenreSummaries(catalog).filter((item) => item.slug !== slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
      <Link href="/books" className="text-sm text-muted hover:text-ink">
        Library
      </Link>
      <header className="mt-6 max-w-2xl">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          {genre}
        </h1>
        <p className="mt-3 text-lg text-muted">
          {list.length} {list.length === 1 ? "book" : "books"}
        </p>
      </header>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((book) => (
          <BookCard key={book.slug} book={book} />
        ))}
      </div>
      <nav aria-label="Other genres" className="mt-16 border-t border-line pt-8">
        <h2 className="text-sm font-medium text-muted">Other genres</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {others.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/genres/${genreToSlug(item.name)}`}
                className="press inline-flex rounded-md border border-line bg-paper-raised px-3 py-1.5 text-sm hover:border-ink"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
