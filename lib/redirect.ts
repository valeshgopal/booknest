/** Only allow same-site relative paths, so `?next=` can't send users to another origin. */
export function safeNextPath(
  value: string | null | undefined,
  fallback = "/collections",
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return fallback;
  }
  return value;
}
