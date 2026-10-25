"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition, type ReactNode } from "react";
import { createBook, updateBook } from "@/app/admin/(protected)/books/actions";
import { BookCover } from "@/components/book-cover";
import {
  BOOK_LIMITS,
  bookToInput,
  slugify,
  validateBook,
  type BookErrors,
  type BookInput,
} from "@/lib/book-input";
import { genres, type Book, type Cover, type Genre } from "@/lib/types";

const DEFAULT_COVER: Cover = {
  background: "#2c4332",
  foreground: "#f3efe6",
  spine: "#b7c47a",
};

const inputClass =
  "mt-1.5 w-full rounded-md border bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-ink aria-[invalid=true]:border-accent";

const EMPTY: BookInput = {
  title: "",
  author: "",
  slug: "",
  year: "",
  pages: "",
  genre: "",
  blurb: "",
  featured: false,
  cover: null,
};

/** Without `book` it adds a new one. With `book` it edits that book in place. */
export function BookForm({ book }: { book?: Book }) {
  const editing = Boolean(book);
  const [values, setValues] = useState<BookInput>(() =>
    book ? bookToInput(book) : EMPTY,
  );
  // An existing slug is part of a live address, so the title never rewrites it.
  const [slugEdited, setSlugEdited] = useState(editing);
  const [errors, setErrors] = useState<BookErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof BookInput>(key: K, value: BookInput[K]) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "title" && !slugEdited) next.slug = slugify(value as string);
      return next;
    });
    if (errors[key] || (key === "title" && errors.slug)) {
      setErrors((current) => ({ ...current, [key]: undefined, ...(key === "title" ? { slug: undefined } : {}) }));
    }
  }

  function submit() {
    setMessage(null);
    const checked = validateBook(values);
    if ("errors" in checked) {
      setErrors(checked.errors);
      setMessage("Fix the highlighted fields.");
      focusFirstError(checked.errors);
      return;
    }
    startTransition(async () => {
      const result = book
        ? await updateBook(book.slug, values)
        : await createBook(values);
      if (result.slug) {
        router.push(
          `/?${book ? "updated" : "added"}=${encodeURIComponent(result.slug)}`,
        );
        router.refresh();
        return;
      }
      setErrors(result.errors);
      setMessage(result.message ?? null);
      focusFirstError(result.errors);
    });
  }

  const preview = {
    slug: values.slug || "preview",
    title: values.title.trim() || "Untitled",
    author: values.author.trim() || "Author",
    year: null,
    pages: null,
    genre: (values.genre || null) as Genre | null,
    blurb: null,
    cover: values.cover,
    featured: false,
  };

  return (
    <form
      noValidate
      className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="space-y-6">
        <Field name="title" label="Title" required error={errors.title}>
          {(props) => (
            <input
              {...props}
              value={values.title}
              maxLength={BOOK_LIMITS.title}
              onChange={(event) => set("title", event.target.value)}
              className={inputClass}
            />
          )}
        </Field>

        <Field name="author" label="Author" required error={errors.author}>
          {(props) => (
            <input
              {...props}
              value={values.author}
              maxLength={BOOK_LIMITS.author}
              onChange={(event) => set("author", event.target.value)}
              className={inputClass}
            />
          )}
        </Field>

        <Field
          name="slug"
          label="Slug"
          required
          error={errors.slug}
          hint={
            book && values.slug !== book.slug
              ? `Changing the slug moves the book from /books/${book.slug} to /books/${values.slug || "…"}. Old links to it will stop working.`
              : `Used in the book’s address: /books/${values.slug || "your-slug"}.${book ? "" : " Filled in from the title."}`
          }
        >
          {(props) => (
            <input
              {...props}
              value={values.slug}
              maxLength={BOOK_LIMITS.slug}
              spellCheck={false}
              autoCapitalize="off"
              onChange={(event) => {
                setSlugEdited(true);
                set("slug", event.target.value.toLowerCase());
              }}
              className={`${inputClass} font-mono`}
            />
          )}
        </Field>

        <div className="grid gap-6 sm:grid-cols-3">
          <Field name="year" label="Year" error={errors.year} hint="Use a negative number for BCE.">
            {(props) => (
              <input
                {...props}
                inputMode="numeric"
                value={values.year}
                onChange={(event) => set("year", event.target.value)}
                className={inputClass}
              />
            )}
          </Field>
          <Field name="pages" label="Pages" error={errors.pages}>
            {(props) => (
              <input
                {...props}
                inputMode="numeric"
                value={values.pages}
                onChange={(event) => set("pages", event.target.value)}
                className={inputClass}
              />
            )}
          </Field>
          <Field name="genre" label="Genre" error={errors.genre}>
            {(props) => (
              <select
                {...props}
                value={values.genre}
                onChange={(event) => set("genre", event.target.value)}
                className={inputClass}
              >
                <option value="">No genre</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <Field
          name="blurb"
          label="Blurb"
          error={errors.blurb}
          hint={`${values.blurb.length} / ${BOOK_LIMITS.blurb} characters.`}
        >
          {(props) => (
            <textarea
              {...props}
              rows={4}
              value={values.blurb}
              maxLength={BOOK_LIMITS.blurb}
              onChange={(event) => set("blurb", event.target.value)}
              className={`${inputClass} resize-y`}
            />
          )}
        </Field>

        <fieldset aria-describedby={errors.cover ? "cover-error" : undefined}>
          <legend className="flex items-center gap-2 text-sm font-medium">
            Cover <Badge required={false} />
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice
              checked={values.cover === null}
              onSelect={() => set("cover", null)}
              label="No cover"
              description="Shows the “No cover available” image."
            />
            <Choice
              checked={values.cover !== null}
              onSelect={() => set("cover", values.cover ?? DEFAULT_COVER)}
              label="Designed cover"
              description="A colored cover with the title and author."
            />
          </div>
          {values.cover ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {(["background", "foreground", "spine"] as const).map((part) => (
                <ColorInput
                  key={part}
                  label={part === "foreground" ? "Text" : part === "spine" ? "Spine" : "Background"}
                  value={values.cover?.[part] ?? DEFAULT_COVER[part]}
                  onChange={(color) =>
                    set("cover", { ...(values.cover ?? DEFAULT_COVER), [part]: color })
                  }
                />
              ))}
            </div>
          ) : null}
          {errors.cover ? (
            <p id="cover-error" className="mt-2 text-sm text-accent">
              {errors.cover}
            </p>
          ) : null}
        </fieldset>

        <label className="flex items-start gap-3 rounded-md border border-line bg-paper-raised p-3">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(event) => set("featured", event.target.checked)}
            className="mt-0.5 size-4 accent-[var(--accent)]"
          />
          <span>
            <span className="flex items-center gap-2 text-sm font-medium">
              Feature on the home page <Badge required={false} />
            </span>
            <span className="mt-0.5 block text-sm text-muted">
              Featured books appear in the home page shelf.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <button
            type="submit"
            disabled={pending}
            className="press rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {pending
              ? book
                ? "Saving…"
                : "Adding book…"
              : book
                ? "Save changes"
                : "Add book"}
          </button>
          <p aria-live="polite" className="text-sm text-accent">
            {message}
          </p>
        </div>
      </div>

      <aside className="lg:sticky lg:top-8">
        <p className="text-sm font-medium">Preview</p>
        <div className="mt-3 w-40 lg:w-full">
          <BookCover book={preview} />
        </div>
        <p className="mt-3 font-serif text-lg leading-tight">{preview.title}</p>
        <p className="text-sm text-muted">{preview.author}</p>
      </aside>
    </form>
  );
}

function focusFirstError(errors: BookErrors) {
  const first = (Object.keys(errors) as (keyof BookErrors)[]).find((key) => errors[key]);
  if (first) document.getElementById(`book-${first}`)?.focus();
}

function Badge({ required }: { required: boolean }) {
  return required ? (
    <span className="rounded-sm bg-accent/10 px-1.5 py-0.5 text-[0.7rem] font-medium text-accent">
      Required
    </span>
  ) : (
    <span className="rounded-sm bg-line/60 px-1.5 py-0.5 text-[0.7rem] font-medium text-muted">
      Optional
    </span>
  );
}

type ControlProps = {
  id: string;
  name: string;
  required?: boolean;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
};

function Field({
  name,
  label,
  required = false,
  error,
  hint,
  children,
}: {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: (props: ControlProps) => ReactNode;
}) {
  const id = `book-${name}`;
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
        {label} <Badge required={required} />
      </label>
      {children({
        id,
        name,
        required: required || undefined,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy || undefined,
      })}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-accent">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Choice({
  checked,
  onSelect,
  label,
  description,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  description: string;
}) {
  return (
    <label
      className={`flex min-w-52 flex-1 cursor-pointer items-start gap-3 rounded-md border p-3 ${checked ? "border-ink bg-paper-raised" : "border-line"}`}
    >
      <input
        type="radio"
        name="cover-mode"
        checked={checked}
        onChange={onSelect}
        className="mt-0.5 accent-[var(--accent)]"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted">{description}</span>
      </span>
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm text-muted">
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2 rounded-md border border-line bg-paper-raised px-2 py-1.5">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span className="font-mono text-sm">{value}</span>
      </div>
    </div>
  );
}
