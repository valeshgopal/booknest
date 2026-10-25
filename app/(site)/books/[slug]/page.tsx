import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCollection } from "@/components/add-to-collection";
import { BookCard } from "@/components/book-card";
import { BookCover } from "@/components/book-cover";
import { genreToSlug, getRelatedBooks } from "@/lib/books";
import { getBook, getBooks } from "@/lib/catalog";

export const revalidate = 3600;

// Prerender every book currently in Supabase. A newly added slug is rendered on demand.
export async function generateStaticParams() {
  const books = await getBooks();
  return books.map((book) => ({ slug: book.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) return { title: "Book" };
  return {
    title: book.title,
    description: book.blurb ?? `${book.title} by ${book.author}.`,
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) notFound();
  const catalog = await getBooks();
  const related = getRelatedBooks(catalog, book);
  const facts = [
    book.year ? String(book.year) : null,
    book.pages ? `${book.pages} pages` : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
      <Link href="/books" className="text-sm text-muted hover:text-ink">
        Library
      </Link>
      <article className="mt-8 grid items-start gap-10 md:grid-cols-[240px_minmax(0,1fr)] md:gap-14">
        <div className="mx-auto w-52 md:mx-0 md:w-full">
          <BookCover book={book} decorative />
        </div>
        <div>
          {book.genre ? (
            <Link
              href={`/genres/${genreToSlug(book.genre)}`}
              className="mb-3 inline-block text-xs font-medium tracking-[0.16em] text-accent uppercase"
            >
              {book.genre}
            </Link>
          ) : null}
          <h1 className="font-serif text-4xl tracking-tight text-balance sm:text-5xl">
            {book.title}
          </h1>
          <p className="mt-3 text-lg text-muted">{book.author}</p>
          {facts.length > 0 ? (
            <p className="mt-4 text-sm text-muted">{facts.join(" · ")}</p>
          ) : null}
          {book.blurb ? (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty">
              {book.blurb}
            </p>
          ) : null}
          <div className="mt-8">
            <AddToCollection slug={book.slug} title={book.title} />
          </div>
        </div>
      </article>

      <section className="mt-16 border-t border-line pt-10">
        <h2 className="font-serif text-3xl tracking-tight">Nearby on the shelf</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
          {related.map((item) => (
            <BookCard key={item.slug} book={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
