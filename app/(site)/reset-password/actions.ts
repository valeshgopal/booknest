"use server";

import { cookies } from "next/headers";
import { MIN_PASSWORD_LENGTH, RECOVERY_COOKIE } from "@/lib/auth-links";
import { createClient } from "@/lib/supabase/server";

export async function resetPassword(
  password: string,
  confirmPassword: string,
): Promise<{ error: string; expired?: boolean } | { ok: true }> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters for the password.` };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don’t match." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const cookieStore = await cookies();
  // A plain signed-in session isn't enough; it must come from a reset link for this user.
  const userId = data?.claims?.sub;
  if (!userId || cookieStore.get(RECOVERY_COOKIE)?.value !== userId) {
    return { error: "This reset link has expired. Request a new one.", expired: true };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") {
      return { error: "Choose a password different from your current one." };
    }
    return { error: error.message };
  }

  cookieStore.delete(RECOVERY_COOKIE);
  return { ok: true };
}
