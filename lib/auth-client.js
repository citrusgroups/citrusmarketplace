import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

// Same-origin requests: do not send session cookies to a stale NEXT_PUBLIC_BETTER_AUTH_URL.
export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
  sessionOptions: {
    refetchInterval: 300,
    refetchOnWindowFocus: true,
    refetchWhenOffline: false,
  },
});
