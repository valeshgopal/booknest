"use client";

import { useMemo, useState, type ReactNode } from "react";
import { BookCard } from "@/components/book-card";
import type { Book, Genre } from "@/lib/types";
import { genres } from "@/lib/types";

type Sort = "featured" | "title" | "newest" | "shortest";
type GenreFilter = Genre | "All";

export function Catalog({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<GenreFilter>("All");
  const [sort, setSort] = useState<Sort>("featured");

  const counts = useMemo(() => {
    const tally = new Map<Genre, number>();
    for (const book of books) {
      if (book.genre) {
        tally.set(book.genre, (tally.get(book.genre) ?? 0) + 1);
      }
    }
    return tally;
  }, [books]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = books.filter((book) => {
      const matchesGenre = genre === "All" || book.genre === genre;
      const matchesQuery =
        needle.length === 0 ||
        book.title.toLowerCase().includes(needle) ||
        book.author.toLowerCase().includes(needle);
      return matchesGenre && matchesQuery;
    });

    const next = [...filtered];
    if (sort === "title") {
      next.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "newest") {
      next.sort(
        (a, b) =>
          (b.year ?? -Infinity) - (a.year ?? -Infinity) ||
          a.title.localeCompare(b.title),
      );
    } else if (sort === "shortest") {
      next.sort(
        (a, b) =>
          (a.pages ?? Infinity) - (b.pages ?? Infinity) ||
          a.title.localeCompare(b.title),
      );
    }
    return next;
  }, [books, genre, query, sort]);

  const narrowed = query.trim().length > 0 || genre !== "All";

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="catalog-search" className="sr-only">
            Search titles and authors
          </label>
          <input
            id="catalog-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles and authors"
            autoComplete="off"
            className="w-full rounded-md border border-line bg-paper-raised px-3 py-2.5 pr-16 text-sm outline-none placeholder:text-muted"
          />
          {query ? (
            <button
              type="button"
              className="absolute inset-y-1 right-1 flex items-center rounded-md px-2 text-xs font-medium text-muted hover:text-ink"
              onClick={() => setQuery("")}
            >
              Clear
            </button>
          ) : null}
        </div>
        <label className="sr-only" htmlFor="catalog-sort">
          Sort books
        </label>
        <select
          id="catalog-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as Sort)}
          className="rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none"
        >
          <option value="featured">As shelved</option>
          <option value="title">Title</option>
          <option value="newest">Newest</option>
          <option value="shortest">Shortest</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
        <FilterChip active={genre === "All"} onClick={() => setGenre("All")}>
          All
          <span className="ml-1.5 text-xs opacity-70">{books.length}</span>
        </FilterChip>
        {genres.map((item) => (
          <FilterChip
            key={item}
            active={genre === item}
            onClick={() => setGenre(item)}
          >
            {item}
            <span className="ml-1.5 text-xs opacity-70">{counts.get(item) ?? 0}</span>
          </FilterChip>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {narrowed
          ? `${visible.length} of ${books.length} books`
          : `${visible.length} books`}
      </p>

      {visible.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed border-line px-6 py-14 text-center">
          <p className="font-serif text-2xl tracking-tight">Nothing matches.</p>
          <button
            type="button"
            className="press mt-4 text-sm font-medium text-accent"
            onClick={() => {
              setQuery("");
              setGenre("All");
              setSort("featured");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`press rounded-md border px-3 py-1.5 text-sm ${active ? "border-ink bg-ink text-paper" : "border-line bg-paper-raised text-ink"}`}
    >
      {children}
    </button>
  );
}
