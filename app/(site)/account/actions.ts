"use server";

import { AVATAR_BUCKET } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function deleteAccount(
  confirmation: string,
): Promise<{ error: string } | { ok: true }> {
  if (confirmation.trim() !== "DELETE") {
    return { error: "Type DELETE to confirm." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) {
    return { error: "You’re signed out. Sign in again to delete your account." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Account deletion isn’t set up on this server yet." };
  }

  // Storage files aren't removed by the auth.users cascade, so clear them first.
  const avatars = admin.storage.from(AVATAR_BUCKET);
  const { data: files } = await avatars.list(userId, { limit: 1000 });
  if (files?.length) {
    await avatars.remove(files.map((file) => `${userId}/${file.name}`));
  }

  // Cascades to profiles, collections, and collection_books.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  await supabase.auth.signOut({ scope: "local" });
  return { ok: true };
}
