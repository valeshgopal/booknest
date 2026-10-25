import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>BookNest</p>
        <p>Collections are saved to your BookNest account.</p>
        <Link href="/books" className="font-medium text-ink">
          Browse the library
        </Link>
      </div>
    </footer>
  );
}
