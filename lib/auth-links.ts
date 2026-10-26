export const MIN_PASSWORD_LENGTH = 6;

/** Supabase rejects a second auth email to the same address within 60 seconds. */
export const EMAIL_COOLDOWN_SECONDS = 60;

/** Set by /auth/callback after a reset link, holding the user id it was issued for. */
export const RECOVERY_COOKIE = "booknest-recovery";
export const RECOVERY_WINDOW_SECONDS = 15 * 60;

export function isEmailRateLimit(error: { code?: string; status?: number }) {
  return error.code === "over_email_send_rate_limit" || error.status === 429;
}

/** `flow=signup` tells /auth/callback to flag the redirect as a fresh confirmation. */
export function signupCallbackUrl(origin: string, next: string) {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", next);
  url.searchParams.set("flow", "signup");
  return url.toString();
}

/** `flow=recovery` tells /auth/callback to continue to /reset-password. */
export function recoveryCallbackUrl(origin: string, next: string) {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", next);
  url.searchParams.set("flow", "recovery");
  return url.toString();
}

/** `sent` means an email just went out, so resend starts on cooldown. */
export function confirmEmailPath(email: string, next: string, sent: boolean) {
  const params = new URLSearchParams({ email, next });
  if (sent) params.set("sent", "1");
  return `/signup/confirm?${params}`;
}

export function forgotPasswordPath(next: string, email?: string) {
  const params = new URLSearchParams({ next });
  if (email) params.set("email", email);
  return `/forgot-password?${params}`;
}
