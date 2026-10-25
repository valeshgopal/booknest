import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminSignOut } from "@/components/admin/admin-sign-out";
import { isAdminHost } from "@/lib/admin-host";
import { getAdminState } from "@/lib/admin";

export const metadata: Metadata = {
  title: {
    default: "BookNest Admin",
    template: "%s · BookNest Admin",
  },
  robots: { index: false, follow: false },
};

// Only reachable on the admin subdomain. On the main host, /admin is a 404.
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = (await headers()).get("host");
  if (!isAdminHost(host)) notFound();

  const state = await getAdminState();

  return (
    <>
      <header className="border-b border-line bg-paper-raised">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-serif text-xl tracking-tight">BookNest</span>
            <span className="rounded-sm bg-ink px-1.5 py-0.5 text-[0.65rem] font-medium tracking-[0.14em] text-paper uppercase">
              Admin
            </span>
          </Link>
          {state.status === "signed-out" ? null : (
            <div className="flex items-center gap-3">
              {state.email ? (
                <span className="hidden truncate text-sm text-muted sm:block">
                  {state.email}
                </span>
              ) : null}
              <AdminSignOut />
            </div>
          )}
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
