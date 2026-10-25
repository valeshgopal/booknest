import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type AdminState =
  | { status: "signed-out" }
  | { status: "forbidden"; email: string | null }
  | { status: "admin"; email: string };

/**
 * RLS lets a user read only their own row in public.admins, so a row coming
 * back means the verified email in their JWT is on the allow-list. The same
 * check guards inserts into public.books.
 */
export const getAdminState = cache(async (): Promise<AdminState> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return { status: "signed-out" };

  const email = typeof claims.email === "string" ? claims.email.toLowerCase() : null;
  if (!email) return { status: "forbidden", email: null };

  const { data: row } = await supabase
    .from("admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  return row ? { status: "admin", email } : { status: "forbidden", email };
});
