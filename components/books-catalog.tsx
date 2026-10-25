"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Book } from "@/lib/types";

const BooksCatalogContext = createContext<Book[] | null>(null);

export function BooksCatalogProvider({
  books,
  children,
}: {
  books: Book[];
  children: ReactNode;
}) {
  return (
    <BooksCatalogContext.Provider value={books}>
      {children}
    </BooksCatalogContext.Provider>
  );
}

export function useCatalog(): Book[] {
  const books = useContext(BooksCatalogContext);
  if (!books) {
    throw new Error("useCatalog must be used within BooksCatalogProvider");
  }
  return books;
}
