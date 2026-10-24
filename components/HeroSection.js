"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { officeCategories } from "@/lib/office-categories";
const fallback = {
  id: "office-essentials",
  title: "THE EVERYDAY WORKPLACE, ELEVATED",
  heading: "Office essentials. Fresh possibilities.",
  buttonText: "Shop office products",
  buttonLink: "/products",
  image: "/images/office-essentials-hero.png",
};
export default function HeroSection() {
  const [banner, setBanner] = useState(fallback);
  useEffect(() => {
    let active = true;
    fetch("/api/banners")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active) {
          const office = data?.banners?.find((b) =>
            b.id.startsWith("citrus-office-"),
          );
          if (office) setBanner(office);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1170px] gap-7 px-4 py-8 lg:px-0">
        <aside className="hidden w-[205px] shrink-0 border-r border-black/10 pt-4 md:block">
          <h2 className="mb-5 text-xs font-semibold tracking-widest text-orange-600">
            SHOP BY CATEGORY
          </h2>
          <ul className="space-y-4 pr-4 text-sm">
            {officeCategories.map((c) => (
              <li key={c.id}>
                <Link
                  className="hover:text-orange-600"
                  href={`/category/${c.slug}`}
                >
                  {c.name} <span aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div className="relative min-w-0 flex-1 overflow-hidden rounded bg-[#FAF3E7]">
          <Image
            src={banner.image}
            alt="Paper, notebooks, folders and desk accessories for your workplace"
            fill
            priority
            sizes="(max-width:768px) 100vw, 900px"
            className="object-cover object-[65%_center] md:object-center"
            unoptimized={banner.image.startsWith("http")}
          />
          <div className="relative z-10 flex min-h-[430px] flex-col justify-center bg-gradient-to-r from-[#faf3e7] via-[#faf3e7]/90 to-transparent p-6 sm:w-3/4 sm:p-10 lg:min-h-[420px] lg:w-2/3">
            <p className="text-xs font-semibold tracking-[0.14em] text-orange-700">
              {banner.title}
            </p>
            <h1 className="inter mt-5 max-w-sm text-4xl font-semibold leading-[1.15] sm:text-5xl">
              {banner.heading}
            </h1>
            <p className="mt-5 max-w-xs text-sm leading-7 text-black/65">
              Paper, stationery and workspace essentials, thoughtfully brought
              together by Citrus Products.
            </p>
            <Link
              href={banner.buttonLink || "/products"}
              className="mt-7 w-fit rounded bg-orange-500 px-6 py-3.5 text-sm font-medium text-white hover:bg-orange-600"
            >
              {banner.buttonText} →
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1170px] grid-cols-1 gap-4 border-b border-black/10 px-4 pb-8 text-sm sm:grid-cols-3 lg:px-0">
        {[
          "Office-focused selection",
          "Clear product information",
          "Personal business support",
        ].map((t) => (
          <p key={t} className="flex gap-2">
            <span className="text-orange-600">✓</span>
            {t}
          </p>
        ))}
      </div>
    </section>
  );
}
