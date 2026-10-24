"use client";
import Link from "next/link";
export default function ErrorPage({ reset }) {
  return (
    <main className="mx-auto max-w-lg px-5 py-20">
      <h1 className="text-2xl font-semibold">We could not load this page</h1>
      <p className="mt-4 text-sm leading-7 text-black/60">
        A temporary connection or server error may have interrupted the request.
        Try again; you do not need to sign out.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={reset}
          className="rounded bg-orange-500 px-5 py-3 text-white"
        >
          Try again
        </button>
        <Link href="/" className="rounded border px-5 py-3">
          Go home
        </Link>
      </div>
    </main>
  );
}
