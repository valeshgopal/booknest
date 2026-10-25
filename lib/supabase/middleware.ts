import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminHost } from "@/lib/admin-host";
import { supabaseEnv } from "@/lib/supabase/env";

const CACHE_HEADERS = ["cache-control", "expires", "pragma"];
const SITE_PROTECTED = ["/collections", "/profile", "/account"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * The admin subdomain serves the routes under app/admin. `/auth/*` is shared
 * so OAuth and email links can land on either host.
 */
function adminRewrite(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/auth/") || matches(pathname, ["/admin"])) {
    return null;
  }
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
  return url;
}

export async function updateSession(request: NextRequest) {
  const { url, key } = supabaseEnv();
  const admin = isAdminHost(request.headers.get("host"));
  const rewriteTo = admin ? adminRewrite(request) : null;
  const pass = () =>
    rewriteTo
      ? NextResponse.rewrite(rewriteTo, { request })
      : NextResponse.next({ request });

  let response = pass();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = pass();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([name, value]) =>
          response.headers.set(name, value),
        );
      },
    },
  });

  // Must run before any early return so an expiring token is refreshed.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  const needsSignIn = admin
    ? !(pathname === "/login" || pathname.startsWith("/auth/"))
    : matches(pathname, SITE_PROTECTED);

  if (!signedIn && needsSignIn) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(loginUrl);
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    for (const header of CACHE_HEADERS) {
      const value = response.headers.get(header);
      if (value) redirect.headers.set(header, value);
    }
    return redirect;
  }

  return response;
}
