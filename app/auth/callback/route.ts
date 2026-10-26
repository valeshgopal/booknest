import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { requestOrigin } from "@/lib/admin-host";
import { RECOVERY_COOKIE, RECOVERY_WINDOW_SECONDS } from "@/lib/auth-links";
import { safeNextPath } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";

// Landing point for Google sign-in, email confirmation, and password reset
// links. Handles the PKCE `code` (OAuth and default emails) and the
// `token_hash` used by custom email templates. A cancelled Google consent
// arrives with neither.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = requestOrigin(request);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));
  const recovery = searchParams.get("flow") === "recovery" || type === "recovery";

  const supabase = await createClient();
  let userId: string | undefined;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) userId = data.user?.id;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) userId = data.user?.id;
  }

  if (!userId) {
    const failUrl = new URL(recovery ? "/forgot-password" : "/login", origin);
    failUrl.searchParams.set("error", "link");
    failUrl.searchParams.set("next", next);
    return NextResponse.redirect(failUrl);
  }

  if (recovery) {
    const resetUrl = new URL("/reset-password", origin);
    resetUrl.searchParams.set("next", next);
    const response = NextResponse.redirect(resetUrl);
    response.cookies.set(RECOVERY_COOKIE, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: RECOVERY_WINDOW_SECONDS,
    });
    return response;
  }

  const destination = new URL(next, origin);
  const confirmedSignup =
    searchParams.get("flow") === "signup" || type === "signup" || type === "email";
  if (confirmedSignup) destination.searchParams.set("confirmed", "1");
  return NextResponse.redirect(destination);
}
