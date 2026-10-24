import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(req) {
  const pathname = req.nextUrl.pathname;
  const protectedPage =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/wishlist";
  if (protectedPage && !getSessionCookie(req)) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackURL", pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }
  // A stale cookie must not prevent access to the login page. Real validation stays on the server.
  return NextResponse.next();
}
export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
