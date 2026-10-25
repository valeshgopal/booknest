"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import type { Shelf } from "@/lib/types";

type CreateInput = {
  name: string;
  description?: string;
  bookSlug?: string;
};

/** Mutations resolve to an error message, or null when they succeed. */
type CollectionsContextValue = {
  ready: boolean;
  signedIn: boolean;
  error: string | null;
  collections: Shelf[];
  createCollection: (input: CreateInput) => Promise<string | null>;
  deleteCollection: (id: string) => Promise<string | null>;
  toggleBook: (collectionId: string, slug: string) => Promise<string | null>;
  removeBook: (collectionId: string, slug: string) => Promise<string | null>;
};

type CollectionRow = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  collection_books: { book_slug: string }[];
};

type LoadedState = {
  userId: string | null;
  collections: Shelf[];
  error: string | null;
};

const CollectionsContext = createContext<CollectionsContextValue | null>(null);

function toShelf(row: CollectionRow): Shelf {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    bookSlugs: row.collection_books.map((item) => item.book_slug),
  };
}

async function fetchCollections() {
  const { data, error } = await createClient()
    .from("collections")
    .select("id, name, description, created_at, collection_books(book_slug)")
    .order("created_at", { ascending: false })
    .order("added_at", { referencedTable: "collection_books", ascending: true });

  if (error) return { collections: [], error: error.message };
  return {
    collections: ((data ?? []) as CollectionRow[]).map(toShelf),
    error: null,
  };
}

/** The signed-in user's collections, read and written through RLS-protected tables. */
export function CollectionProvider({ children }: { children: ReactNode }) {
  const { ready: authReady, user } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState<LoadedState | null>(null);

  const reload = useCallback(async (forUserId: string) => {
    const result = await fetchCollections();
    setState((current) =>
      current && current.userId !== forUserId
        ? current
        : { userId: forUserId, ...result },
    );
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!userId) {
      setState({ userId: null, collections: [], error: null });
      return;
    }
    let cancelled = false;
    fetchCollections().then((result) => {
      if (!cancelled) setState({ userId, ...result });
    });
    return () => {
      cancelled = true;
    };
  }, [authReady, userId]);

  const ready = authReady && state !== null && state.userId === userId;

  const value = useMemo<CollectionsContextValue>(() => {
    const collections = ready && state ? state.collections : [];

    function update(change: (current: Shelf[]) => Shelf[]) {
      setState((current) =>
        current ? { ...current, collections: change(current.collections) } : current,
      );
    }

    function recover(message: string) {
      if (userId) void reload(userId);
      return message;
    }

    return {
      ready,
      signedIn: Boolean(userId),
      error: ready && state ? state.error : null,
      collections,
      createCollection: async ({ name, description = "", bookSlug }) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("collections")
          .insert({ name: name.trim(), description: description.trim() })
          .select("id, name, description, created_at")
          .single();
        if (error || !data) {
          return error?.message ?? "Could not create the collection.";
        }

        let bookSlugs: string[] = [];
        if (bookSlug) {
          const { error: addError } = await supabase
            .from("collection_books")
            .insert({ collection_id: data.id, book_slug: bookSlug });
          if (addError) return recover(addError.message);
          bookSlugs = [bookSlug];
        }

        update((current) => [
          { ...toShelf({ ...data, collection_books: [] }), bookSlugs },
          ...current,
        ]);
        return null;
      },
      deleteCollection: async (id) => {
        update((current) => current.filter((shelf) => shelf.id !== id));
        const { error } = await createClient()
          .from("collections")
          .delete()
          .eq("id", id);
        return error ? recover(error.message) : null;
      },
      toggleBook: async (collectionId, slug) => {
        const shelf = collections.find((item) => item.id === collectionId);
        if (!shelf) return "That collection no longer exists.";
        const hasBook = shelf.bookSlugs.includes(slug);

        update((current) =>
          current.map((item) =>
            item.id !== collectionId
              ? item
              : {
                  ...item,
                  bookSlugs: hasBook
                    ? item.bookSlugs.filter((existing) => existing !== slug)
                    : [...item.bookSlugs, slug],
                },
          ),
        );

        const table = createClient().from("collection_books");
        const { error } = hasBook
          ? await table
              .delete()
              .eq("collection_id", collectionId)
              .eq("book_slug", slug)
          : await table.insert({ collection_id: collectionId, book_slug: slug });
        return error ? recover(error.message) : null;
      },
      removeBook: async (collectionId, slug) => {
        update((current) =>
          current.map((item) =>
            item.id === collectionId
              ? {
                  ...item,
                  bookSlugs: item.bookSlugs.filter((existing) => existing !== slug),
                }
              : item,
          ),
        );
        const { error } = await createClient()
          .from("collection_books")
          .delete()
          .eq("collection_id", collectionId)
          .eq("book_slug", slug);
        return error ? recover(error.message) : null;
      },
    };
  }, [ready, state, userId, reload]);

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error("useCollections must be used within CollectionProvider");
  }
  return context;
}
