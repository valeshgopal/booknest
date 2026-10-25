import Link from "next/link";

export function NotFoundMessage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6">
      <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
        404
      </p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">
        That page is not on the shelf.
      </h1>
      <Link
        href="/books"
        className="press mt-8 inline-flex rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper"
      >
        Back to the library
      </Link>
    </div>
  );
}
