import Link from "next/link";
import { AddToCollection } from "@/components/add-to-collection";
import { BookCover } from "@/components/book-cover";
import type { Book } from "@/lib/types";

export function BookCard({ book }: { book: Book }) {
  return (
    <article className="flex flex-col">
      <Link href={`/books/${book.slug}`} className="group block">
        <BookCover book={book} decorative />
        <h3 className="mt-3 font-serif text-lg leading-snug tracking-tight">
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{book.author}</p>
      </Link>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-sm text-muted">{book.year ?? ""}</p>
        <AddToCollection slug={book.slug} title={book.title} variant="compact" />
      </div>
    </article>
  );
}
