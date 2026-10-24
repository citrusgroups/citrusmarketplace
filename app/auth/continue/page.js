import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { loginDestination, safeReturnPath } from "@/lib/auth-settings";
export const dynamic = "force-dynamic";
export default async function ContinueAfterSignIn({ searchParams }) {
  const params = await searchParams;
  // A database failure is handled by the error boundary, not a forced logout redirect.
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session?.user)
    redirect(
      `/login?error=session&callbackURL=${encodeURIComponent(safeReturnPath(params.callbackURL))}`,
    );
  redirect(loginDestination(session.user, params.callbackURL));
}
