import { AuthProvider } from "@/components/auth-provider";
import { NotFoundMessage } from "@/components/not-found-message";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// URLs that match no route render outside the (site) layout, so bring the chrome here.
export default function NotFound() {
  return (
    <AuthProvider>
      <SiteHeader />
      <main id="main" className="flex-1">
        <NotFoundMessage />
      </main>
      <SiteFooter />
    </AuthProvider>
  );
}
