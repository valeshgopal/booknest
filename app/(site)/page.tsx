import Link from "next/link";
import { BookCard } from "@/components/book-card";
import { BookCover } from "@/components/book-cover";
import { getGenreSummaries } from "@/lib/books";
import { getBooks, getFeaturedBooks } from "@/lib/catalog";
import { genres } from "@/lib/types";

export const revalidate = 3600;

// Cached for an hour. The catalog is the same for every visitor.
export default async function HomePage() {
  const catalog = await getBooks();
  const spotlight =
    catalog.find((book) => book.slug === "the-remains-of-the-day") ??
    catalog[0];
  const featured = await getFeaturedBooks();
  const genreList = getGenreSummaries(catalog);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
      <section className="grid items-end gap-12 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
            Library
          </p>
          <h1 className="mt-4 max-w-xl font-serif text-[2.7rem] leading-[1.02] tracking-tight text-balance sm:text-6xl">
            Find a book. Keep it <em className="italic">close.</em>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-pretty text-muted">
            A small catalog you can browse by genre, then set onto a collection
            of your own.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/books"
              className="press inline-flex rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Browse the library
            </Link>
            <Link
              href="/collections"
              className="press inline-flex rounded-md border border-line bg-paper-raised px-4 py-2.5 text-sm font-medium hover:border-ink"
            >
              Your collections
            </Link>
          </div>
          <p className="mt-8 text-sm text-muted">
            {catalog.length} books · {genres.length} genres
          </p>
        </div>

        {spotlight ? (
        <div className="flex items-end gap-5 sm:gap-8">
          <Link
            href={`/books/${spotlight.slug}`}
            aria-label={`${spotlight.title} by ${spotlight.author}`}
            className="group block w-36 shrink-0 sm:w-48"
          >
            <BookCover book={spotlight} decorative />
          </Link>
          <div className="min-w-0 pb-1">
            <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
              On the table
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-tight text-balance">
              {spotlight.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{spotlight.author}</p>
            {spotlight.blurb ? (
              <p className="mt-4 hidden text-sm leading-relaxed text-pretty text-ink sm:block">
                {spotlight.blurb}
              </p>
            ) : null}
            <Link
              href={`/books/${spotlight.slug}`}
              className="mt-4 inline-block text-sm font-medium text-accent"
            >
              View this book
            </Link>
          </div>
        </div>
        ) : null}
      </section>

      <section className="border-t border-line py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl tracking-tight">Start here</h2>
            <p className="mt-2 text-muted">Six books worth opening first.</p>
          </div>
          <Link href="/books" className="shrink-0 text-sm font-medium">
            Browse all
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
          {featured.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      </section>

      <section className="border-t border-line py-14">
        <h2 className="font-serif text-3xl tracking-tight">Browse by genre</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {genreList.map((genre) => (
            <li key={genre.slug}>
              <Link
                href={`/genres/${genre.slug}`}
                className="flex items-baseline justify-between gap-4 py-4 hover:text-accent"
              >
                <span className="font-serif text-2xl tracking-tight">
                  {genre.name}
                </span>
                <span className="text-sm text-muted">
                  {genre.count} {genre.count === 1 ? "book" : "books"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-16 rounded-lg bg-moss px-6 py-8 text-paper sm:px-10 sm:py-10">
        <h2 className="max-w-lg font-serif text-3xl tracking-tight text-balance sm:text-4xl">
          Collections that follow you.
        </h2>
        <p className="mt-3 max-w-xl leading-relaxed text-paper">
          Group books into Currently Reading, a gift list, or a shelf with your
          own name. Sign in and they’re there on any device.
        </p>
        <Link
          href="/collections"
          className="press mt-6 inline-flex rounded-md bg-paper px-4 py-2.5 text-sm font-medium text-moss"
        >
          Open collections
        </Link>
      </section>
    </div>
  );
}
