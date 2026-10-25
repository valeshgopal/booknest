export const ADMIN_SUBDOMAIN = "admin";

/** `admin.example.com`, or `admin.localhost:3000` in development. */
export function isAdminHost(host: string | null | undefined) {
  const hostname = host?.split(":")[0] ?? "";
  return hostname.startsWith(`${ADMIN_SUBDOMAIN}.`);
}

/**
 * Origin the browser actually used. In route handlers `request.nextUrl` reports
 * the server's own host (e.g. localhost:3000) even on admin.localhost:3000.
 * Only the server host or its admin subdomain is accepted, so a forged Host
 * header can't redirect elsewhere.
 */
export function requestOrigin(request: {
  headers: Headers;
  nextUrl: { host: string; protocol: string; origin: string };
}) {
  const base = request.nextUrl.host;
  const claimed =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!claimed || (claimed !== base && claimed !== `${ADMIN_SUBDOMAIN}.${base}`)) {
    return request.nextUrl.origin;
  }
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(/:$/, "");
  return `${protocol}://${claimed}`;
}