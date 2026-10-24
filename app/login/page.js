"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { safeReturnPath, loginDestination } from "@/lib/auth-settings";
function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [errors, setErrors] = useState({}),
    [loading, setLoading] = useState(false),
    [googleLoading, setGoogleLoading] = useState(false),
    [notice, setNotice] = useState("");
  const params = useSearchParams();
  const requested = params.get("callbackURL");
  const callback = requested ? safeReturnPath(requested) : null;
  const googleError = params.has("error")
    ? "Google sign-in could not be completed. Check the registered callback URL or use email and password."
    : "";
  useEffect(() => {
    let active = true;
    authClient
      .getSession()
      .then((result) => {
        if (active && !result.error && result.data?.user) {
          router.replace(loginDestination(result.data.user, callback));
          router.refresh();
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [router, callback]);
  const handleLogin = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required";
    if (!password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    setNotice("");
    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        rememberMe: true,
      });
      if (result.error)
        throw new Error(
          result.error.message || "Sign-in failed. Please try again.",
        );
      // The sign-in response already contains the user. A transient follow-up request must not undo login.
      const user = result.data?.user;
      if (!user)
        throw new Error("Could not confirm sign-in. Please try again.");
      router.replace(loginDestination(user, callback));
      router.refresh();
      toast.success("Signed in successfully");
    } catch (error) {
      setNotice(error.message || "Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogle = async () => {
    setGoogleLoading(true);
    setNotice("");
    try {
      const destination = callback
        ? `/auth/continue?callbackURL=${encodeURIComponent(safeReturnPath(callback))}`
        : "/auth/continue";
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: destination,
        errorCallbackURL: "/login?error=google",
      });
      if (result?.error)
        throw new Error(
          result.error.message ||
            "Google sign-in is unavailable. Check Google OAuth settings.",
        );
    } catch (error) {
      setNotice(error.message);
      setGoogleLoading(false);
    }
  };
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-[1170px] items-center gap-12 px-5 py-16 lg:grid-cols-2">
      <div className="hidden overflow-hidden rounded-xl bg-orange-50 lg:block">
        <img
          src="/images/office-essentials-hero.png"
          alt="Office supplies from Citrus Products"
          className="h-[560px] w-full object-cover object-right"
        />
      </div>
      <div className="mx-auto w-full max-w-md">
        <p className="text-xs font-semibold tracking-widest text-orange-600">
          WELCOME BACK
        </p>
        <h1 className="inter mt-4 text-3xl font-semibold leading-tight">
          Sign in to Citrus Products
        </h1>
        <p className="mt-4 text-sm leading-7 text-black/60">
          Manage your orders or access your workspace.
        </p>
        {(notice || googleError) && (
          <p
            role="alert"
            className="mt-6 rounded border border-orange-200 bg-orange-50 p-4 text-sm leading-6"
          >
            {notice || googleError}
          </p>
        )}
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className="mt-2 w-full rounded border border-black/20 px-4 py-3"
            />
            {errors.email && (
              <span className="mt-2 block text-xs text-red-600">
                {errors.email}
              </span>
            )}
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className="mt-2 w-full rounded border border-black/20 px-4 py-3"
            />
            {errors.password && (
              <span className="mt-2 block text-xs text-red-600">
                {errors.password}
              </span>
            )}
          </label>
          <p className="text-xs text-black/50">
            Your sign-in is remembered on this device. Sign out when using a
            shared computer.
          </p>
          <button
            disabled={loading || googleLoading}
            className="w-full rounded bg-orange-500 px-6 py-3.5 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <button
            type="button"
            disabled={loading || googleLoading}
            onClick={handleGoogle}
            className="w-full rounded border border-black/20 px-6 py-3.5 font-medium disabled:opacity-50"
          >
            {googleLoading ? "Opening Google…" : "Continue with Google"}
          </button>
        </form>
        <p className="mt-7 text-sm text-black/65">
          New to Citrus?{" "}
          <Link
            href="/signup"
            className="font-medium text-orange-600 underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="px-5 py-20 text-center">Loading sign-in…</main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
