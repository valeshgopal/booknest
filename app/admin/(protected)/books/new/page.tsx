import type { Metadata } from "next";
import Link from "next/link";
import { BookForm } from "@/components/admin/book-form";

export const metadata: Metadata = {
  title: "Add book",
};

export default function NewBookPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
      <Link href="/" className="text-sm text-muted hover:text-ink">
        All books
      </Link>
      <h1 className="mt-4 font-serif text-4xl tracking-tight">Add a book</h1>
      <p className="mt-2 text-sm text-muted">
        Title, author, and slug are required. Everything else is optional and
        can be left blank.
      </p>
      <BookForm />
    </div>
  );
}
