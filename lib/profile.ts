export const AVATAR_BUCKET = "avatars";
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
export const DISPLAY_NAME_MAX = 60;

export type ProfileRow = {
  display_name: string | null;
  avatar_url: string | null;
};

type SessionUser = {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

function metadataString(metadata: Record<string, unknown> | undefined, ...keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/**
 * A saved profile row wins, even when its avatar is null (the user removed it).
 * Without a row, use what the sign-in provider gave us, then the email.
 */
export function resolveProfile(user: SessionUser, row: ProfileRow | null) {
  const fallbackName =
    metadataString(user.user_metadata, "full_name", "name") ??
    user.email?.split("@")[0] ??
    "Reader";

  if (row) {
    return {
      name: row.display_name ?? fallbackName,
      avatarUrl: row.avatar_url,
    };
  }
  return {
    name: fallbackName,
    avatarUrl: metadataString(user.user_metadata, "avatar_url", "picture"),
  };
}

/** Storage path for avatars we host, or null for external ones such as Google's. */
export function avatarPathFromUrl(url: string | null) {
  if (!url) return null;
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}/`;
  return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : null;
}
