import { headers } from "next/headers";
import { authOrigin } from "@/lib/auth-settings";
export const dynamic = "force-dynamic";
export default async function AuthSettings() {
  const h = await headers();
  const origin = authOrigin();
  const observedHost = h.get("host") || "unknown";
  const callback = origin
    ? `${origin}/api/auth/callback/google`
    : "Set BETTER_AUTH_URL to your website origin first.";
  const google = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  const secret = Boolean(
    process.env.BETTER_AUTH_SECRET &&
    process.env.BETTER_AUTH_SECRET.length >= 32,
  );
  return (
    <section className="max-w-3xl">
      <h1 className="text-3xl font-semibold">Sign-in settings</h1>
      <p className="mt-4 text-sm leading-7 text-black/60">
        Copy this exact callback into the Google OAuth Web application client
        used by this website. This page never displays keys or secrets.
      </p>
      <dl className="mt-7 space-y-5 rounded-xl bg-white p-6">
        {[
          ["Configured website origin", origin || "Not configured"],
          ["Current request host", observedHost],
          [
            "Google OAuth credentials",
            google
              ? "Configured"
              : "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET",
          ],
          [
            "Persistent signing secret",
            secret
              ? "Configured (keep the same value across deployments)"
              : "Set a stable BETTER_AUTH_SECRET of at least 32 characters",
          ],
          ["Session lifetime", "30 days, renewed daily during active use"],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase text-black/50">
              {label}
            </dt>
            <dd className="mt-2 break-all text-sm">{value}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-8 text-lg font-semibold">Authorized redirect URI</h2>
      <p className="mt-3 select-all break-all rounded border border-orange-200 bg-orange-50 p-4 font-mono text-sm">
        {callback}
      </p>
      <a
        href="https://console.cloud.google.com/auth/clients"
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-block text-sm text-orange-700 underline"
      >
        Open Google OAuth clients ↗
      </a>
      <p className="mt-5 text-sm leading-7 text-black/60">
        Keep BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL on the same canonical
        domain. Google requires exact matching of HTTPS, hostname, port and
        callback path.
      </p>
    </section>
  );
}
