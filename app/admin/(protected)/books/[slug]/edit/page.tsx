import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookForm } from "@/components/admin/book-form";
import { DeleteBook } from "@/components/admin/delete-book";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types";

export const metadata: Metadata = {
  title: "Edit book",
};

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fresh read, so the form never starts from a cached copy.
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("slug, title, author, year, pages, genre, blurb, cover, featured")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) notFound();
  const book = data as Book;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
      <Link href="/" className="text-sm text-muted hover:text-ink">
        All books
      </Link>
      <h1 className="mt-4 font-serif text-4xl tracking-tight">Edit book</h1>
      <p className="mt-2 text-sm text-muted">
        Title, author, and slug are required. Clear an optional field to
        remove it.
      </p>
      <BookForm key={book.slug} book={book} />
      <DeleteBook slug={book.slug} title={book.title} />
    </div>
  );
}
