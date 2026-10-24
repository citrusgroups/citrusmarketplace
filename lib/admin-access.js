import { auth } from "@/lib/auth";
export async function requireAdmin(req) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    throw Object.assign(new Error("Please sign in."), { status: 401 });
  if (session.user.role !== "admin")
    throw Object.assign(new Error("Administrator access required."), {
      status: 403,
    });
  return session.user;
}
export function apiError(error) {
  const message = error.message || "Request failed.";
  if (/catalog_import|is_published|catalog_key|office_enabled/.test(message))
    return Response.json(
      {
        error:
          "Run database/01-citrus-products.sql in Supabase SQL Editor first.",
      },
      { status: 503 },
    );
  return Response.json(
    {
      error: error.status
        ? message
        : "The request could not be completed. Check server configuration and try again.",
    },
    { status: error.status || 500 },
  );
}
export function badRequest(message, status = 400) {
  return Object.assign(new Error(message), { status });
}
