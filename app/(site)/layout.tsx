import { AuthProvider } from "@/components/auth-provider";
import { BooksCatalogProvider } from "@/components/books-catalog";
import { CollectionProvider } from "@/components/collection-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getBooks } from "@/lib/catalog";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const books = await getBooks();

  return (
    <BooksCatalogProvider books={books}>
      <AuthProvider>
        <CollectionProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </CollectionProvider>
      </AuthProvider>
    </BooksCatalogProvider>
  );
}
