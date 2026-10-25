import { genres, type Book, type Cover, type Genre } from "@/lib/types";

export type BookInput = {
  title: string;
  author: string;
  slug: string;
  year: string;
  pages: string;
  genre: string;
  blurb: string;
  featured: boolean;
  cover: Cover | null;
};

export type BookErrors = Partial<Record<keyof BookInput, string>>;

export type BookInsert = {
  slug: string;
  title: string;
  author: string;
  year: number | null;
  pages: number | null;
  genre: Genre | null;
  blurb: string | null;
  cover: Cover | null;
  featured: boolean;
};

export const BOOK_LIMITS = {
  title: 200,
  author: 200,
  slug: 120,
  blurb: 2000,
  minYear: -3000,
  maxPages: 100000,
};

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export function bookToInput(book: Book): BookInput {
  return {
    title: book.title,
    author: book.author,
    slug: book.slug,
    year: book.year === null ? "" : String(book.year),
    pages: book.pages === null ? "" : String(book.pages),
    genre: book.genre ?? "",
    blurb: book.blurb ?? "",
    featured: book.featured,
    cover: book.cover,
  };
}

export function slugify(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, BOOK_LIMITS.slug)
    .replace(/-+$/g, "");
}

function optionalInteger(
  value: string,
): { value: number | null } | { error: string } {
  const trimmed = value.trim();
  if (!trimmed) return { value: null };
  if (!/^-?\d+$/.test(trimmed)) return { error: "Use a whole number." };
  return { value: Number(trimmed) };
}

/** Shared by the form and the server action, so both enforce the same rules. */
export function validateBook(
  input: BookInput,
): { errors: BookErrors } | { book: BookInsert } {
  const errors: BookErrors = {};
  const title = input.title.trim();
  const author = input.author.trim();
  const slug = input.slug.trim();
  const blurb = input.blurb.trim();

  if (!title) errors.title = "Enter the title.";
  else if (title.length > BOOK_LIMITS.title) errors.title = `Keep it under ${BOOK_LIMITS.title} characters.`;

  if (!author) errors.author = "Enter the author.";
  else if (author.length > BOOK_LIMITS.author) errors.author = `Keep it under ${BOOK_LIMITS.author} characters.`;

  if (!slug) errors.slug = "Enter a slug.";
  else if (slug.length > BOOK_LIMITS.slug) errors.slug = `Keep it under ${BOOK_LIMITS.slug} characters.`;
  else if (!SLUG_PATTERN.test(slug)) errors.slug = "Use lowercase letters, numbers, and single hyphens.";

  const maxYear = new Date().getFullYear() + 1;
  const year = optionalInteger(input.year);
  if ("error" in year) errors.year = year.error;
  else if (year.value !== null && (year.value < BOOK_LIMITS.minYear || year.value > maxYear)) {
    errors.year = `Use a year between ${BOOK_LIMITS.minYear} and ${maxYear}.`;
  }

  const pages = optionalInteger(input.pages);
  if ("error" in pages) errors.pages = pages.error;
  else if (pages.value !== null && (pages.value < 1 || pages.value > BOOK_LIMITS.maxPages)) {
    errors.pages = "Use a page count of at least 1.";
  }

  let genre: Genre | null = null;
  if (input.genre) {
    if ((genres as readonly string[]).includes(input.genre)) genre = input.genre as Genre;
    else errors.genre = "Pick a genre from the list.";
  }

  if (blurb.length > BOOK_LIMITS.blurb) errors.blurb = `Keep it under ${BOOK_LIMITS.blurb} characters.`;

  if (
    input.cover &&
    ![input.cover.background, input.cover.foreground, input.cover.spine].every((color) =>
      COLOR_PATTERN.test(color),
    )
  ) {
    errors.cover = "Cover colors must be hex values like #2c4332.";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    book: {
      slug,
      title,
      author,
      year: "value" in year ? year.value : null,
      pages: "value" in pages ? pages.value : null,
      genre,
      blurb: blurb || null,
      cover: input.cover
        ? {
            background: input.cover.background.toLowerCase(),
            foreground: input.cover.foreground.toLowerCase(),
            spine: input.cover.spine.toLowerCase(),
          }
        : null,
      featured: input.featured,
    },
  };
}
