"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/auth-provider";
import { useCollections } from "@/components/collection-provider";

type MenuPosition = {
  top: number;
  left: number;
  origin: "top left" | "bottom left";
};

export function AddToCollection({
  slug,
  title,
  variant = "primary",
}: {
  slug: string;
  title: string;
  variant?: "primary" | "compact";
}) {
  const pathname = usePathname();
  const { ready: authReady, user } = useAuth();
  const { ready, collections, toggleBook, createCollection } = useCollections();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const nameId = useId();
  const savedCount = collections.filter((shelf) =>
    shelf.bookSlugs.includes(slug),
  ).length;

  useLayoutEffect(() => {
    if (!open) return;

    function place() {
      const button = buttonRef.current;
      const menu = menuRef.current;
      if (!button || !menu) return;
      const rect = button.getBoundingClientRect();
      const width = menu.offsetWidth;
      const height = menu.offsetHeight;
      const margin = 8;
      let left = rect.left;
      if (left + width > window.innerWidth - margin) {
        left = window.innerWidth - width - margin;
      }
      left = Math.max(margin, left);
      let top = rect.bottom + margin;
      let origin: MenuPosition["origin"] = "top left";
      if (top + height > window.innerHeight - margin) {
        top = Math.max(margin, rect.top - height - margin);
        origin = "bottom left";
      }
      setPosition({ top, left, origin });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, collections.length, error, name]);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onPointer(event: PointerEvent) {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  async function submitNewCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setError("Name the collection first.");
      return;
    }
    setCreating(true);
    const failure = await createCollection({ name: nextName, bookSlug: slug });
    setCreating(false);
    if (failure) {
      setError(failure);
      return;
    }
    setName("");
    setError("");
  }

  async function toggle(collectionId: string) {
    const failure = await toggleBook(collectionId, slug);
    if (failure) setError(failure);
  }

  const label =
    variant === "compact"
      ? savedCount > 0
        ? "Saved"
        : "Save"
      : savedCount > 0
        ? `In ${savedCount} ${savedCount === 1 ? "collection" : "collections"}`
        : "Add to collection";

  const buttonClass =
    variant === "compact"
      ? "press rounded-md border border-line bg-paper-raised px-2.5 py-1 text-xs font-medium text-ink"
      : "press inline-flex items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover";

  if (authReady && !user) {
    return (
      <div className={variant === "primary" ? "inline-flex" : ""}>
        <Link
          href={`/login?next=${encodeURIComponent(pathname)}`}
          className={buttonClass}
          aria-label={`Sign in to save ${title} to a collection`}
        >
          {variant === "compact" ? "Save" : "Sign in to save"}
        </Link>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={variant === "primary" ? "inline-flex" : ""}>
      <button
        ref={buttonRef}
        type="button"
        className={buttonClass}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          savedCount > 0
            ? `Manage collections for ${title}`
            : `Save ${title} to a collection`
        }
        disabled={!ready}
        onClick={() => {
          setOpen((current) => !current);
          setPosition(null);
        }}
      >
        {label}
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="dialog"
              aria-label={`Collections for ${title}`}
              tabIndex={-1}
              className="popover-in fixed z-50 w-72 rounded-lg border border-line bg-paper-raised p-3 shadow-[0_18px_40px_-24px_rgba(28,25,21,0.45)]"
              style={{
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                transformOrigin: position?.origin ?? "top left",
                visibility: position ? "visible" : "hidden",
              }}
            >
              <p className="px-2 pb-2 font-serif text-lg leading-tight">
                Save “{title}”
              </p>
              {collections.length === 0 ? (
                <p className="px-2 pb-3 text-sm text-muted">
                  Create a collection below and this book will be the first one
                  in it.
                </p>
              ) : (
                <ul className="max-h-56 overflow-auto">
                  {collections.map((shelf) => {
                    const checked = shelf.bookSlugs.includes(slug);
                    return (
                      <li key={shelf.id}>
                        <button
                          type="button"
                          className="press flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-paper"
                          aria-pressed={checked}
                          onClick={() => toggle(shelf.id)}
                        >
                          <span
                            aria-hidden
                            className={`grid size-4 shrink-0 place-items-center rounded-[3px] border ${checked ? "border-accent bg-accent text-white" : "border-line bg-paper"}`}
                          >
                            {checked ? (
                              <svg
                                viewBox="0 0 12 12"
                                className="size-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M2.5 6.2 4.8 8.5 9.5 3.5" />
                              </svg>
                            ) : null}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate">{shelf.name}</span>
                            <span className="block text-xs text-muted">
                              {shelf.bookSlugs.length}{" "}
                              {shelf.bookSlugs.length === 1 ? "book" : "books"}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <form
                onSubmit={submitNewCollection}
                className="mt-2 border-t border-line pt-3"
              >
                <label htmlFor={nameId} className="px-2 text-xs text-muted">
                  New collection
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    id={nameId}
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (error) setError("");
                    }}
                    maxLength={48}
                    placeholder="Nightstand, gifts…"
                    className="min-w-0 flex-1 rounded-md border border-line bg-paper px-2.5 py-2 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    disabled={creating}
                    className="press rounded-md bg-ink px-3 py-2 text-sm font-medium text-paper"
                  >
                    {creating ? "Adding…" : "Add"}
                  </button>
                </div>
                {error ? (
                  <p role="alert" className="px-2 pt-2 text-xs text-accent">
                    {error}
                  </p>
                ) : null}
              </form>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
