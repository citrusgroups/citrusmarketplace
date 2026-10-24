"use client";
import Link from "next/link";
export default function AdminError({ reset }) {
  return (
    <main className="mx-auto max-w-lg px-5 py-20">
      <h1 className="text-2xl font-semibold">
        Dashboard temporarily unavailable
      </h1>
      <p className="mt-4 text-sm leading-7 text-black/65">
        Your session or dashboard data could not be checked. This can happen
        during a connection problem. Try again before signing in again.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded bg-orange-500 px-5 py-3 text-white"
        >
          Try again
        </button>
        <Link
          href="/login?callbackURL=%2Fadmin"
          className="rounded border px-5 py-3"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
