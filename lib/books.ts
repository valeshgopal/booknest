import type { Book, Genre } from "@/lib/types";
import { genres } from "@/lib/types";

export function genreToSlug(genre: Genre): string {
  return genre.toLowerCase().replace(/ /g, "-");
}

export function slugToGenre(slug: string): Genre | undefined {
  return genres.find((genre) => genreToSlug(genre) === slug);
}

export function getGenreSummaries(catalog: Book[]) {
  return genres.map((genre) => ({
    name: genre,
    slug: genreToSlug(genre),
    count: catalog.filter((book) => book.genre === genre).length,
  }));
}

export function getBooksByGenre(catalog: Book[], genre: Genre): Book[] {
  return catalog.filter((book) => book.genre === genre);
}

export function getRelatedBooks(
  catalog: Book[],
  book: Book,
  count = 3,
): Book[] {
  const sameGenre = book.genre
    ? catalog.filter(
        (item) => item.genre === book.genre && item.slug !== book.slug,
      )
    : [];
  if (sameGenre.length >= count) {
    return sameGenre.slice(0, count);
  }
  const others = catalog.filter(
    (item) =>
      item.slug !== book.slug &&
      (book.genre === null || item.genre !== book.genre),
  );
  return [...sameGenre, ...others].slice(0, count);
}

export function booksForSlugs(catalog: Book[], slugs: string[]): Book[] {
  const bySlug = new Map(catalog.map((book) => [book.slug, book]));
  return slugs.flatMap((slug) => {
    const book = bySlug.get(slug);
    return book ? [book] : [];
  });
}
