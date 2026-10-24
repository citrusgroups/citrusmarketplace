"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Dashboard", href: "/admin" },
    { name: "Sign-in Settings", href: "/admin/auth-settings" },
    { name: "Products", href: "/admin/products" },
    { name: "Catalog Import", href: "/admin/catalogs" },
    { name: "Add Categories", href: "/admin/categories" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Customers", href: "/admin/customers" },
    { name: "Coupons", href: "/admin/coupons" },
    { name: "Flash Sale Timer", href: "/admin/settings" },
    { name: "Messages", href: "/admin/messages" },
    { name: "Banners", href: "/admin/banners" },
  ];

  const linkClass = (href) => {
    const active =
      pathname === href || (href !== "/admin" && pathname.startsWith(href));

    return `rounded px-4 py-3 transition-all ${
      active ? "bg-[#F97316] text-white" : "text-white/80 hover:bg-white/10"
    }`;
  };

  return (
    <>
      <div className="sticky top-0 z-50 flex h-[64px] items-center justify-between bg-black px-4 text-white lg:hidden">
        <h2 className="inter text-[22px] font-semibold">Admin</h2>

        <button
          onClick={() => setOpen(true)}
          className="rounded border border-white/20 px-3 py-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <button
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <aside className="relative flex h-full w-[280px] flex-col bg-black text-white">
            <div className="flex items-center justify-between px-6 py-8">
              <h2 className="inter text-[26px] font-semibold">Admin</h2>

              <button onClick={() => setOpen(false)} className="text-[28px]">
                ×
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-6">
              <div className="flex flex-col gap-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={linkClass(link.href)}
                  >
                    {link.name}
                  </Link>
                ))}

                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded px-4 py-3 text-white/80 hover:bg-white/10"
                >
                  Back To Store
                </Link>
              </div>
            </nav>
          </aside>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-[300px] bg-black text-white lg:flex lg:flex-col">
        <div className="px-6 py-8">
          <h2 className="inter text-[28px] font-semibold">Admin</h2>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-6">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/"
              className="mt-4 rounded px-4 py-3 text-white/80 hover:bg-white/10"
            >
              Back To Store
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
