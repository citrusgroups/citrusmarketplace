# Citrus Products — login/session fix

This patch is based on the successfully pushed `5fce07f` version. Copy only these updated/new files into the existing project. No new packages and no database migration are required.

## Apply the files

Extract `Citrus-Auth-Fix.zip` to `C:\Users\DELL\Downloads\Citrus-Auth-Fix`. Run from any PowerShell folder:

```powershell
robocopy "C:\Users\DELL\Downloads\Citrus-Auth-Fix" "F:\citrus\Citrus-Marketplace-Updated\Citrus-Marketplace" /E /XD node_modules .git .next /XF ".env*" /R:1 /W:1
cd "F:\citrus\Citrus-Marketplace-Updated\Citrus-Marketplace"
```

## Google login configuration (required outside code)

`redirect_uri_mismatch` means Google's configured callback does not exactly match the callback sent by the app. A code patch cannot edit your Google Cloud OAuth client automatically.

1. For local `.env`:

```env
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. For Vercel **Production** environment, set both to the SAME real website origin, without a trailing path:

```env
BETTER_AUTH_URL=https://YOUR-LIVE-DOMAIN
NEXT_PUBLIC_APP_URL=https://YOUR-LIVE-DOMAIN
```

3. Keep `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the same OAuth **Web application** client.
4. Open https://console.cloud.google.com/auth/clients and select that exact OAuth client. In **Authorized redirect URIs**, add:

```text
http://localhost:3000/api/auth/callback/google
https://YOUR-LIVE-DOMAIN/api/auth/callback/google
```

Replace YOUR-LIVE-DOMAIN with your actual hostname. HTTPS, www/non-www, ports and path must match exactly. Add these under **Authorized redirect URIs**, not just JavaScript origins. Do not use the Supabase callback for this app: its Google sign-in is handled by Better Auth.
5. Keep a stable `BETTER_AUTH_SECRET` of at least 32 characters in the server environment. Do not generate a new one on every deployment. Changing it invalidates existing signed cookies.
6. Remove the old `NEXT_PUBLIC_BETTER_AUTH_URL` setting if it points to another domain. The patched client intentionally uses same-origin auth requests.
7. Restart `npm run dev` locally, or redeploy after editing Vercel variables. Use the canonical production URL, not a changing preview URL, for Google sign-in.

After signing in with email/password, **Admin > Sign-in Settings** displays the exact registered callback to copy, along with configuration presence checks. No secrets are displayed. If Google still rejects the request, open its Error details, copy its actual `redirect_uri`, and compare it to the OAuth client used by GOOGLE_CLIENT_ID.

## What changed

- Thirty-day persistent sessions with daily renewal during active use and a two-minute signed cookie cache.
- Five-minute client session refresh while online and refetch on window focus.
- Same-origin client requests so an old public auth URL cannot send cookies to another project.
- Removed the blanket 3-requests-per-10-minutes auth limit. Session checks use their own reasonable limit, while password login/signup retain stricter limits.
- Navbar reacts to session changes; a temporary fetch error does not manually clear its session state.
- Login uses the successful sign-in response, remembers the device and refreshes server navigation.
- Google sign-in returns through a role-aware continuation page; administrator logins can reach /admin.
- The proxy preserves the intended protected destination and no longer blocks /login merely because a stale cookie exists.
- Use the configured canonical production domain consistently; existing site domains are not automatically redirected by this patch.
- A database/session-check failure shows a retry screen rather than falsely treating the user as logged out. A genuinely absent/expired session still requires sign-in.
- Existing admin API routes (including banners, categories, orders, customers and coupon administration) now also verify a real administrator session on the server.
- Checkout distinguishes a confirmed 401 from temporary 429/5xx/network failures instead of redirecting to login for every error.
- The Footer has an **Admin Dashboard** button. It is a navigation link, not a bypass; administrator access is verified server-side, without trusting the cached role.
- Admin **Sign-in Settings** page provides the exact callback URL and presence checks.
- OTP storage no longer includes a plaintext password, and code generation uses cryptographic randomness. Removed session/token console logging from signup. Existing signup endpoints and user/session tables remain in place.

## Verify and push

```powershell
npm run build
git add .
git commit -m "Fix Google login configuration and persistent sessions; add admin footer access"
git push origin main
```

Regression checks:

```powershell
node --experimental-vm-modules --test tests/auth-session.test.mjs
npm run test:catalog
npm run test:payments
```

A PostgreSQL-compatible local test verified the actual Better Auth sign-in handler, persistent cookie lifetime, twelve consecutive session checks, daily renewal, generated Google callback, and explicit logout. Proxy tests cover return paths and stale/secure cookies. Catalog and Stripe regressions were also checked.

Live Google account sign-in and production environment changes still need the real Google Console/Vercel configuration above. The connected Vercel account does not have access to the `citrus-f612` team, so its production variables and runtime logs were not inspected or changed. A successful build is not proof that external OAuth settings or live catalog extraction are correct.
