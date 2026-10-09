import { NextResponse } from "next/server";

const authPages = ["/login", "/signup"];

export function proxy(req) {
  const { pathname } = req.nextUrl;

  const token =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuthPage = authPages.includes(pathname);

  // 1. logged in user login/signup nahi ja sakta
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. allow all public pages (home, about, cart, checkout)
  const publicRoutes = [
    "/",
    "/about",
    "/cart",
    "/checkout",
    "/login",
    "/signup",
    "/contact",
    "/products",
  ];

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/product/") ||
    pathname.startsWith("/category/");

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};