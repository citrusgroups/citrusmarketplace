"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { officeCategories } from "@/lib/office-categories";
export default function OfficeProducts() {
  const [items, setItems] = useState([]),
    [category, setCategory] = useState("all"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const addToCart = useCartStore((s) => s.addToCart);
  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then(async (r) => {
        if (!r.ok)
          throw new Error(
            "Products could not be loaded. Please try again shortly.",
          );
        return r.json();
      })
      .then((data) => {
        if (active) setItems(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const filtered =
    category === "all"
      ? items
      : items.filter(
          (p) => p.categoryId === category || p.categorySlug === category,
        );
  return (
    <section className="mx-auto max-w-[1170px] px-4 py-14 lg:px-0">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-orange-600">
            CURATED FOR YOUR WORKDAY
          </p>
          <h2 className="inter mt-3 text-3xl font-semibold sm:text-4xl">
            The office collection
          </h2>
        </div>
        <Link
          href="/products"
          className="text-sm font-medium underline underline-offset-4"
        >
          View all products →
        </Link>
      </div>
      <div
        className="my-8 flex flex-wrap gap-2"
        role="group"
        aria-label="Product categories"
      >
        {[{ id: "all", name: "All products" }, ...officeCategories].map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`rounded-full border px-4 py-2 text-xs transition ${category === c.id ? "border-orange-500 bg-orange-500 text-white" : "border-black/10 hover:border-orange-500"}`}
          >
            {c.name}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="py-12 text-black/60" role="status">
          Loading office products…
        </p>
      ) : error ? (
        <p
          role="alert"
          className="rounded border border-orange-200 bg-orange-50 p-6"
        >
          {error}
        </p>
      ) : filtered.length === 0 ? (
        <div className="rounded border border-dashed border-black/15 p-10 text-center">
          <h3 className="font-semibold">The next workday starts here.</h3>
          <p className="mt-3 text-sm leading-7 text-black/60">
            Our office collection is being prepared. Contact us for product
            availability or a business sourcing request.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-block text-sm font-medium text-orange-600 underline"
          >
            Ask about office supplies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.slice(0, 16).map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded border border-black/10"
            >
              <Link
                href={`/product/${p.id}`}
                className="block bg-[#F7F7F5] p-5"
              >
                <img
                  src={
                    p.images?.[0]?.imageUrl ||
                    "/images/office-product-fallback.svg"
                  }
                  alt={p.name}
                  className="mx-auto h-44 w-full object-contain"
                />
              </Link>
              <div className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-600">
                  {p.categoryName || "Office essentials"}
                </p>
                <Link
                  href={`/product/${p.id}`}
                  className="mt-2 block min-h-12 text-sm font-medium leading-6"
                >
                  {p.name}
                </Link>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    ${Number(p.basePrice).toFixed(2)}
                  </span>
                  <button
                    disabled={!p.stock}
                    onClick={() => {
                      if (p.hasVariants) {
                        window.location.assign(`/product/${p.id}`);
                        return;
                      }
                      addToCart(p);
                      toast.success("Added to cart");
                    }}
                    className="rounded bg-black px-3 py-2 text-xs text-white disabled:bg-black/20"
                  >
                    {!p.stock
                      ? "Out of stock"
                      : p.hasVariants
                        ? "Choose options"
                        : "Add to cart"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
