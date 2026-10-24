import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";
const noCache = { "Cache-Control": "private, no-store, max-age=0" };
export async function GET(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user)
      return Response.json({ user: null }, { status: 401, headers: noCache });
    return Response.json({ user: session.user }, { headers: noCache });
  } catch {
    return Response.json(
      { error: "Session check temporarily unavailable. Please retry." },
      { status: 503, headers: noCache },
    );
  }
}
