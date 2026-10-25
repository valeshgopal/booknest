import Image from "next/image";
import type { Book } from "@/lib/types";

export function BookCover({
  book,
  compact = false,
  decorative = false,
}: {
  book: Book;
  compact?: boolean;
  decorative?: boolean;
}) {
  const frameClass = `book-cover relative aspect-[2/3] w-full overflow-hidden ring-1 ring-black/10 ${compact ? "rounded-[2px]" : "rounded-[3px] shadow-[0_16px_30px_-20px_rgba(28,25,21,0.7)]"}`;
  const hidden = decorative || compact || undefined;

  if (!book.cover) {
    return (
      <div aria-hidden={hidden} className={frameClass}>
        <Image
          src="/no-cover.svg"
          alt={hidden ? "" : "No cover available"}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    );
  }

  const titleClass =
    book.title.length > 32
      ? "font-serif text-[1.05rem] leading-[1.15]"
      : book.title.length > 22
        ? "font-serif text-lg leading-[1.15]"
        : "font-serif text-xl leading-[1.15]";

  return (
    <div
      aria-hidden={hidden}
      className={frameClass}
      style={{
        backgroundColor: book.cover.background,
        color: book.cover.foreground,
      }}
    >
      <span
        className={`absolute inset-y-0 left-0 ${compact ? "w-1" : "w-2.5"}`}
        style={{ backgroundColor: book.cover.spine }}
      />
      <span className="absolute inset-0 bg-[linear-gradient(165deg,rgba(255,255,255,0.18),transparent_42%)]" />
      {compact ? null : (
        <div className="relative flex h-full flex-col justify-between p-4 pl-5">
          <p className="text-[0.65rem] tracking-[0.14em] uppercase opacity-80">
            {book.genre ?? ""}
          </p>
          <div>
            <p className={titleClass}>{book.title}</p>
            <p className="mt-2 text-xs tracking-wide opacity-80">{book.author}</p>
          </div>
        </div>
      )}
    </div>
  );
}
