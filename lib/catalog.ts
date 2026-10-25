import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";
import type { Book, Cover, Genre } from "@/lib/types";

/** Invalidated by the admin dashboard after it adds a book. */
export const BOOKS_CACHE_TAG = "books";

type BookRow = {
  slug: string;
  title: string;
  author: string;
  year: number | null;
  pages: number | null;
  genre: Genre | null;
  blurb: string | null;
  cover: Cover | null;
  featured: boolean;
  sort_order: number;
};

// No cookies here on purpose: the public catalog must stay cacheable across users.
function createSupabase() {
  const { url, key } = supabaseEnv();

  return createClient(url, key, {
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          next: { revalidate: 3600, tags: [BOOKS_CACHE_TAG] },
        }),
    },
  });
}

function toBook(row: BookRow): Book {
  return {
    slug: row.slug,
    title: row.title,
    author: row.author,
    year: row.year,
    pages: row.pages,
    genre: row.genre,
    blurb: row.blurb,
    cover: row.cover,
    featured: row.featured,
  };
}

/** Shared catalog read. Cached for an hour, and deduped within a single request. */
export const getBooks = cache(async (): Promise<Book[]> => {
  const supabase = createSupabase();
  const { data, error } = await supabase
    .from("books")
    .select(
      "slug, title, author, year, pages, genre, blurb, cover, featured, sort_order",
    )
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Could not load books: ${error.message}`);
  }

  return ((data ?? []) as BookRow[]).map(toBook);
});

export async function getBook(slug: string): Promise<Book | undefined> {
  const books = await getBooks();
  return books.find((book) => book.slug === slug);
}

export async function getFeaturedBooks(): Promise<Book[]> {
  const books = await getBooks();
  return books.filter((book) => book.featured);
}
