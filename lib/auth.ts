import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Server-side gate for protected pages. getClaims() verifies the JWT; getSession() would not. */
export async function requireUser(returnTo: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return data.claims;
}
