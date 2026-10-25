"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminState } from "@/lib/admin";
import { validateBook, type BookErrors, type BookInput } from "@/lib/book-input";
import { BOOKS_CACHE_TAG } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";

// The form navigates on the client after success. A server-side redirect() to
// "/" can be rendered without the admin-host rewrite and land on the public site.

export type BookActionResult = {
  errors: BookErrors;
  message?: string;
  slug?: string;
};

const NOT_ADMIN = "Only the administrator can change books.";

function refreshCatalog() {
  revalidateTag(BOOKS_CACHE_TAG);
  revalidatePath("/", "layout");
}

function writeError(error: { code?: string; message: string }): BookActionResult {
  if (error.code === "23505") {
    return {
      errors: { slug: "Another book already uses this slug." },
      message: "Fix the highlighted fields.",
    };
  }
  if (error.code === "42501") return { errors: {}, message: NOT_ADMIN };
  return { errors: {}, message: error.message };
}

// Writes use the admin's own session, so RLS checks the allow-list again.

export async function createBook(input: BookInput): Promise<BookActionResult> {
  if ((await getAdminState()).status !== "admin") return { errors: {}, message: NOT_ADMIN };

  const result = validateBook(input);
  if ("errors" in result) return { errors: result.errors, message: "Fix the highlighted fields." };

  const supabase = await createClient();
  const { error } = await supabase.from("books").insert(result.book);
  if (error) return writeError(error);

  refreshCatalog();
  return { errors: {}, slug: result.book.slug };
}

export async function updateBook(
  originalSlug: string,
  input: BookInput,
): Promise<BookActionResult> {
  if ((await getAdminState()).status !== "admin") return { errors: {}, message: NOT_ADMIN };

  const result = validateBook(input);
  if ("errors" in result) return { errors: result.errors, message: "Fix the highlighted fields." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .update(result.book)
    .eq("slug", originalSlug)
    .select("slug");
  if (error) return writeError(error);
  if (!data?.length) {
    return { errors: {}, message: "This book no longer exists, or this account can’t edit it." };
  }

  refreshCatalog();
  return { errors: {}, slug: result.book.slug };
}

export async function deleteBook(slug: string): Promise<{ error?: string }> {
  if ((await getAdminState()).status !== "admin") return { error: NOT_ADMIN };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .delete()
    .eq("slug", slug)
    .select("slug");
  if (error) return { error: error.code === "42501" ? NOT_ADMIN : error.message };
  if (!data?.length) {
    return { error: "This book no longer exists, or this account can’t delete it." };
  }

  refreshCatalog();
  return {};
}
