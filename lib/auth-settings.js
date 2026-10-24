// Single source for the server origin, session policy and login return paths.
export function authOrigin(env = process.env) {
  const raw = (env.BETTER_AUTH_URL || env.NEXT_PUBLIC_APP_URL || "").trim();
  if (!raw) return undefined; // Better Auth infers the request origin when no origin is configured.
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(
      "BETTER_AUTH_URL must be a full URL such as https://your-domain.com",
    );
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.pathname !== "/" && url.pathname !== "")
  )
    throw new Error(
      "Set BETTER_AUTH_URL to the website origin only, without /api/auth or another path.",
    );
  if (url.search || url.hash)
    throw new Error("BETTER_AUTH_URL cannot contain a query or fragment.");
  return url.origin;
}
export function trustedAuthOrigins(env = process.env) {
  const primary = authOrigin(env);
  // Additional exact domains can be used for intentional local/custom-domain access.
  const extra = String(env.AUTH_TRUSTED_ORIGINS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((value) => authOrigin({ BETTER_AUTH_URL: value }));
  return [
    ...new Set(
      [
        primary,
        ...extra,
        ...(env.NODE_ENV !== "production"
          ? ["http://localhost:3000", "http://127.0.0.1:3000"]
          : []),
      ].filter(Boolean),
    ),
  ];
}
export const sessionPolicy = {
  expiresIn: 60 * 60 * 24 * 30,
  updateAge: 60 * 60 * 24,
  cookieCache: { enabled: true, maxAge: 120 },
};
export const authRateLimit = {
  enabled: true,
  window: 60,
  max: 100,
  customRules: {
    "/get-session": { window: 60, max: 120 },
    "/sign-in/email": { window: 60, max: 5 },
    "/sign-in/social": { window: 60, max: 10 },
    "/sign-up/email": { window: 60, max: 3 },
  },
};
export function safeReturnPath(value, fallback = "/") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(value)
  )
    return fallback;
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (decoded.startsWith("//") || /[\\\u0000-\u001f]/.test(decoded))
    return fallback;
  const path = value.split(/[?#]/)[0];
  if (path === "/login" || path === "/signup" || path.startsWith("/api/"))
    return fallback;
  return value;
}
export function loginDestination(user, requested) {
  const destination = safeReturnPath(
    requested,
    user?.role === "admin" ? "/admin" : "/",
  );
  if (
    (destination === "/admin" || destination.startsWith("/admin/")) &&
    user?.role !== "admin"
  )
    return "/";
  return destination;
}
