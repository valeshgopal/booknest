import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// On the main host, only auth-aware routes, so catalog pages stay cacheable and
// never carry Set-Cookie. On the admin host, every page.
export const config = {
  matcher: [
    "/collections/:path*",
    "/profile/:path*",
    "/account/:path*",
    "/login",
    {
      source: "/((?!_next/|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)",
      has: [{ type: "host", value: "admin\\..+" }],
    },
  ],
};
