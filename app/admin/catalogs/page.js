"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
const button =
  "rounded bg-orange-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-50 hover:bg-orange-600";
export default function CatalogImports() {
  const [jobs, setJobs] = useState([]),
    [url, setUrl] = useState(""),
    [supplier, setSupplier] = useState(""),
    [autoPublish, setAutoPublish] = useState(true),
    [busy, setBusy] = useState(false),
    [running, setRunning] = useState(null),
    [links, setLinks] = useState([]),
    [notice, setNotice] = useState(""),
    [error, setError] = useState("");
  const fileRef = useRef(null),
    runRef = useRef(null),
    mounted = useRef(false);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/catalogs");
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (mounted.current) setJobs(data.jobs || []);
    } catch (e) {
      if (mounted.current) setError(e.message);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    fetch("/api/admin/catalogs")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Could not load imports.");
        return data;
      })
      .then((data) => {
        if (mounted.current) setJobs(data.jobs || []);
      })
      .catch((error) => {
        if (mounted.current) setError(error.message);
      });
    return () => {
      mounted.current = false;
      runRef.current = null;
    };
  }, [refresh]);
  const run = async (id) => {
    if (runRef.current) return;
    runRef.current = id;
    setRunning(id);
    setError("");
    try {
      for (
        let attempt = 0;
        attempt < 1500 && runRef.current === id;
        attempt++
      ) {
        const r = await fetch(`/api/admin/catalogs/${id}`);
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        if (["completed", "cancelled"].includes(data.job.status)) {
          if (data.job.status === "completed")
            toast.success("Catalog import completed");
          break;
        }
        if (data.job.status === "failed")
          throw new Error(
            data.job.error || "Import failed. Use Retry to resume.",
          );
        const step = await fetch(`/api/admin/catalogs/${id}/process`, {
          method: "POST",
        });
        const result = await step.json();
        if (!step.ok) throw new Error(result.error);
        await refresh();
        if (result.idle)
          await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    } catch (e) {
      if (mounted.current) setError(e.message);
    } finally {
      runRef.current = null;
      if (mounted.current) {
        setRunning(null);
        await refresh();
      }
    }
  };
  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setLinks([]);
    setNotice("");
    try {
      const body = new FormData();
      body.set("supplier", supplier);
      body.set("autoPublish", String(autoPublish));
      if (url.trim()) body.set("url", url.trim());
      else if (fileRef.current.files[0]) {
        const file = fileRef.current.files[0];
        if (file.size > 4 * 1024 * 1024)
          throw new Error(
            "Upload limit is 4 MB. Use a direct file URL for larger catalogs (up to 20 MB).",
          );
        body.set("file", file);
      }
      const r = await fetch("/api/admin/catalogs", { method: "POST", body });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setLinks(data.links || []);
      setNotice(data.message || "");
      await refresh();
      if (data.id) run(data.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const action = async (id, action) => {
    try {
      const r = await fetch(`/api/admin/catalogs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      await refresh();
      if (action === "retry") run(id);
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <section className="min-w-0 max-w-6xl text-[#171717]">
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-orange-600">
            CITRUS PRODUCTS
          </p>
          <h1 className="inter mt-2 text-3xl font-semibold">Catalog import</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
            Add a supplier catalog once. AI extracts office products in small
            batches and saves them to your existing product database.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="self-start rounded border border-black/15 bg-white px-5 py-3 text-sm"
        >
          Review products →
        </Link>
      </div>
      {error && (
        <div
          role="alert"
          className="mb-6 break-words rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <form
          onSubmit={create}
          className="space-y-5 rounded-xl border border-black/10 bg-white p-5 sm:p-7"
        >
          <h2 className="text-lg font-semibold">Choose your source</h2>
          <label className="block text-sm font-medium">
            Supplier / catalog owner
            <input
              required
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Example: Office Express"
              className="mt-2 w-full rounded border border-black/15 px-4 py-3 font-normal"
            />
          </label>
          <label className="block text-sm font-medium">
            Catalog link
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://supplier.com/catalog.pdf"
              className="mt-2 w-full rounded border border-black/15 px-4 py-3 font-normal"
            />
          </label>
          <p className="text-xs text-black/50">
            Or choose a file. If both are entered, the URL is used.
          </p>
          <label className="block text-sm font-medium">
            Upload catalog
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.csv,.xlsx,.docx,.json,.txt,.html,.htm,.png,.jpg,.jpeg,.webp"
              className="mt-2 block w-full rounded border border-dashed border-black/20 p-4 text-xs font-normal file:mr-3 file:rounded file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-orange-700"
            />
          </label>
          <p className="text-xs leading-6 text-black/50">
            PDF, CSV, XLSX, DOCX, JSON, TXT, HTML or catalog images. Upload up
            to 4 MB; direct links up to 20 MB. PDFs up to 1,000 pages.
          </p>
          <label className="flex items-start gap-3 text-sm leading-6">
            <input
              type="checkbox"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
              className="mt-1"
            />
            <span>
              Automatically publish complete office products with a USD price,
              price evidence and a source product image.
            </span>
          </label>
          <button disabled={busy || Boolean(running)} className={button}>
            {busy ? "Reading catalog…" : "Extract & add products"}
          </button>
          {notice && (
            <p role="status" className="text-sm leading-7 text-orange-800">
              {notice}
            </p>
          )}
          {links.length > 0 && (
            <div className="space-y-3 border-t pt-5">
              <h3 className="font-semibold">Catalogs found on this page</h3>
              {links.map((l) => (
                <button
                  type="button"
                  key={l.url}
                  onClick={() => {
                    setUrl(l.url);
                    setNotice(
                      "Catalog selected. Click Extract & add products.",
                    );
                  }}
                  className="block w-full break-all rounded bg-orange-50 p-3 text-left text-sm text-orange-800 hover:bg-orange-100"
                >
                  {l.label}
                  <span className="mt-1 block text-xs opacity-70">{l.url}</span>
                </button>
              ))}
            </div>
          )}
        </form>
        <aside className="space-y-5 rounded-xl border border-orange-200 bg-orange-50 p-6 text-sm leading-7">
          <h2 className="text-lg font-semibold">
            A reliable import, step by step
          </h2>
          <ol className="list-decimal space-y-4 pl-5">
            <li>Read the source and identify office products.</li>
            <li>
              Save each SKU once. Repeated imports skip existing items without
              overwriting your selling prices.
            </li>
            <li>
              Keep missing prices, currencies and images as unpublished products
              for review.
            </li>
            <li>
              Confirm stock yourself. Catalog quantities are never treated as
              your available stock.
            </li>
          </ol>
          <p className="border-t border-orange-200 pt-4">
            Keep this page open while processing. You can pause after the
            current segment and resume from saved progress later.
          </p>
          <p className="text-xs">
            Some interactive flipbooks cannot be read directly. Download the
            supplier’s PDF or spreadsheet and upload that file. An index page
            itself is never treated as a product catalog.
          </p>
          <a
            href="https://www.oexusa.com/catalogs"
            target="_blank"
            rel="noreferrer"
            className="inline-block font-medium text-orange-800 underline"
          >
            Office Express catalog reference ↗
          </a>
        </aside>
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Import history</h2>
        <div className="flex gap-3">
          {running && (
            <button
              onClick={() => {
                runRef.current = null;
                setNotice(
                  "Pausing after the current segment. Saved progress is retained.",
                );
              }}
              className="rounded border bg-white px-4 py-2 text-sm"
            >
              Pause after segment
            </button>
          )}
          <button
            onClick={refresh}
            className="rounded border bg-white px-4 py-2 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {jobs.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-sm text-black/50">
            No catalog imports yet.
          </p>
        ) : (
          jobs.map((job) => (
            <article
              key={job.id}
              className="rounded-xl border border-black/10 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="break-words font-semibold">
                    {job.sourceName}
                  </h3>
                  <p className="mt-1 text-xs text-black/55">
                    {job.supplier} · {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${job.status === "failed" ? "bg-red-50 text-red-700" : job.status === "completed" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}
                >
                  {running === job.id
                    ? "Processing"
                    : job.status === "ready"
                      ? "Ready / paused"
                      : job.status}
                </span>
              </div>
              <progress
                aria-label="Import progress"
                value={job.processedBatches}
                max={job.totalBatches || 1}
                className="mt-5 h-2 w-full accent-orange-500"
              />
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-black/60">
                <span>
                  {job.processedBatches}/{job.totalBatches} segments
                </span>
                <span>{job.productsAdded} added</span>
                <span>{job.duplicatesSkipped} duplicates skipped</span>
                <span>{job.needsReview} initially saved as drafts</span>
              </div>
              {job.error && (
                <p className="mt-3 break-words text-xs text-red-700">
                  {job.error}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                {["ready", "running"].includes(job.status) && (
                  <button
                    disabled={Boolean(running)}
                    onClick={() => run(job.id)}
                    className={button}
                  >
                    Resume import
                  </button>
                )}
                {job.status === "failed" && (
                  <button
                    disabled={Boolean(running)}
                    onClick={() => action(job.id, "retry")}
                    className={button}
                  >
                    Retry failed segment
                  </button>
                )}
                {!["completed", "cancelled"].includes(job.status) && (
                  <button
                    onClick={() => action(job.id, "cancel")}
                    className="rounded border px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                )}
                <Link
                  href="/admin/products"
                  className="rounded border px-4 py-2 text-sm"
                >
                  Review added products
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
