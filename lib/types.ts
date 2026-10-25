export const genres = [
  "Fiction",
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Memoir",
  "History",
  "Classics",
] as const;

export type Genre = (typeof genres)[number];

export type Cover = {
  background: string;
  foreground: string;
  spine: string;
};

export type Book = {
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

export type Shelf = {
  id: string;
  name: string;
  description: string;
  bookSlugs: string[];
  createdAt: string;
};
