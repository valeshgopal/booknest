"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";

const links = [
  { href: "/books", label: "Library", match: (path: string) => path === "/books" || path.startsWith("/books/") || path.startsWith("/genres/") },
  { href: "/collections", label: "Collections", match: (path: string) => path.startsWith("/collections") },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-40 border-b border-line backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-paper-raised focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Mark />
          <span className="font-serif text-xl tracking-tight">BookNest</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`press rounded-md px-2.5 py-1.5 text-sm font-medium sm:px-3 ${active ? "bg-ink text-paper" : "text-ink hover:bg-paper-raised"}`}
              >
                {link.label}
              </Link>
            );
          })}
          <AccountControl pathname={pathname} />
        </nav>
      </div>
    </header>
  );
}

function AccountControl({ pathname }: { pathname: string }) {
  const { ready, user, signOut } = useAuth();
  const [pending, setPending] = useState(false);

  if (!ready) {
    return <span aria-hidden className="ml-1 h-8 w-16 sm:ml-2" />;
  }

  if (!user) {
    if (pathname === "/login") return null;
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="press ml-1 rounded-md border border-line px-2.5 py-1.5 text-sm font-medium hover:border-ink sm:ml-2 sm:px-3"
      >
        Sign in
      </Link>
    );
  }

  return (
    <UserMenu
      key={pathname}
      name={user.name}
      email={user.email}
      avatarUrl={user.avatarUrl}
      pending={pending}
      onSignOut={async () => {
        setPending(true);
        await signOut();
        setPending(false);
      }}
    />
  );
}

function UserMenu({
  name,
  email,
  avatarUrl,
  pending,
  onSignOut,
}: {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  pending: boolean;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  function items() {
    return Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
  }

  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();

    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      list[(index + 1) % list.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      list[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      list[list.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  const itemClass =
    "flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm outline-none hover:bg-paper focus-visible:bg-paper";

  return (
    <div ref={rootRef} className="relative ml-1 sm:ml-2">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Account menu for ${name}`}
        className="press flex items-center gap-2 rounded-full py-0.5 pr-1 pl-0.5 hover:bg-paper-raised sm:pr-2.5"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Avatar name={name} url={avatarUrl} size={30} />
        <span className="hidden max-w-36 truncate text-sm font-medium sm:block">
          {name}
        </span>
        <svg
          viewBox="0 0 12 12"
          aria-hidden
          className={`hidden size-3 text-muted transition-transform duration-150 sm:block ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKey}
          className="popover-in absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border border-line bg-paper-raised p-1.5 shadow-[0_18px_40px_-24px_rgba(28,25,21,0.45)]"
          style={{ transformOrigin: "top right" }}
        >
          <div className="flex items-center gap-3 px-2.5 pt-2 pb-3">
            <Avatar name={name} url={avatarUrl} size={36} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              {email ? (
                <p className="truncate text-xs text-muted">{email}</p>
              ) : null}
            </div>
          </div>
          <div className="border-t border-line pt-1.5">
            <Link href="/profile" role="menuitem" tabIndex={-1} className={itemClass}>
              Profile
            </Link>
            <Link href="/account" role="menuitem" tabIndex={-1} className={itemClass}>
              Account settings
            </Link>
          </div>
          <div className="mt-1.5 border-t border-line pt-1.5">
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={pending}
              className={`${itemClass} text-muted hover:text-ink focus-visible:text-ink`}
              onClick={onSignOut}
            >
              {pending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden className="shrink-0">
      <rect x="2.5" y="4" width="10" height="20" rx="1.2" fill="#2c4332" />
      <rect x="15.5" y="4" width="10" height="20" rx="1.2" fill="#8f3d2b" />
      <path d="M7.5 4.5v19" stroke="#f3efe6" strokeWidth="0.7" />
      <path d="M20.5 4.5v19" stroke="#f8efe8" strokeWidth="0.7" />
    </svg>
  );
}
