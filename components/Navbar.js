"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";


const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/products" },
    { name: "Amazon Services", href: "/services" },
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/about" },
    { name: "Sign Up", href: "/signup" },
];
export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/signup"
    useEffect(() => {
        const handleClick = () => setShowAccountMenu(false);
        if (showAccountMenu) {
            document.addEventListener("click", handleClick);
        }
        return () => document.removeEventListener("click", handleClick);
    }, [showAccountMenu]);
    const router = useRouter();
    const [search, setSearch] = useState("");
    const handleSearch = (e) => {
        e.preventDefault();

        if (!search.trim()) return;

        router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    };
    const handleLogout = async () => {
        await authClient.signOut();
        router.replace("/login");
        router.refresh();
    };
    const cart = useCartStore(
        (state) => state.cart
    );
    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );
    const wishlist = useWishlistStore((state) => state.wishlist);
    useEffect(() => {
        const getSession = async () => {
            const { data } = await authClient.getSession();

            if (data?.user) {
                setUser(data.user);
            }
        };

        getSession();
    }, []);
    return (
        <nav className="w-full mx-auto  border-b border-black/30 bg-white sticky top-0 z-50">
            <div className="mx-auto flex min-h-[60px] w-full max-w-[1170px] items-center justify-between gap-3 py-2 px-4 lg:px-0">
                <h1 className="inter text-[24px] font-bold leading-[24px] tracking-[0.03em] text-black">
                    <Link href="/" aria-label="Citrus Marketplace home" className="flex flex-col items-center"><img src="/images/citrus-marketplace-logo.png" alt="Citrus Marketplace" width="2146" height="733" className="h-auto w-[150px] object-contain" /></Link>
                </h1>
                <ul className="hidden items-center gap-5 poppins lg:flex">
                    {navLinks.map(link => <li key={link.href}><Link href={link.href} className={`text-sm whitespace-nowrap hover:text-orange-600 ${pathname === link.href ? "border-b border-orange-500" : ""}`}>{link.name}</Link></li>)}
                </ul>
                <div className="flex items-center gap-[24px]">
                    <div className="relative hidden h-[38px] w-[243px] items-center rounded-[4px] bg-[#F5F5F5] sm:flex">
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="What are you looking for?"
                                className="h-full w-full rounded-[4px] bg-transparent py-[7px] pl-[20px] pr-[44px] poppins text-[12px] font-normal leading-[18px] text-black outline-none placeholder:text-[#7D8184]"
                            />
                            <button
                                type="button"
                                aria-label="Search"
                                className="absolute cursor-pointer right-[12px] top-1/2 flex h-[32px] w-[32px] -translate-y-1/2 items-center justify-center"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="7" stroke="black" strokeWidth="1.5" />
                                    <path d="M16.5 16.5L21 21" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                            </form>
                    </div>
                    {!isAuthPage && (
                        <div className="hidden items-center gap-[16px] sm:flex">
                            <Link href="/wishlist" className="relative flex h-[32px] w-[32px] items-center justify-center">
                                <span className="absolute -right-[2px] -top-[2px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#F97316] poppins text-[10px] text-white">
                                    {wishlist.length}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                            </Link>
                            <Link href="/cart" className="relative flex h-[32px] w-[32px] items-center justify-center">
                                <span className="absolute -right-[2px] -top-[2px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#F97316] poppins text-[10px] text-white">
                                    {cartCount}
                                </span>
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
                                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                    />
                                </svg>
                            </Link>
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAccountMenu(!showAccountMenu);
                                    }}
                                    className={`flex h-[32px] w-[32px] items-center justify-center rounded-full transition-all ${showAccountMenu ? "bg-[#F97316]" : ""
                                        }`}
                                >
                                    <svg
                                        width="32"
                                        height="32"
                                        viewBox="0 0 32 32"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M24 27V24.3333C24 22.9188 23.5224 21.5623 22.6722 20.5621C21.8221 19.5619 20.669 19 19.4667 19H11.5333C10.331 19 9.17795 19.5619 8.32778 20.5621C7.47762 21.5623 7 22.9188 7 24.3333V27"
                                            stroke={showAccountMenu ? "white" : "black"}
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M16.5 14C18.9853 14 21 11.9853 21 9.5C21 7.01472 18.9853 5 16.5 5C14.0147 5 12 7.01472 12 9.5C12 11.9853 14.0147 14 16.5 14Z"
                                            stroke={showAccountMenu ? "white" : "black"}
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>


                                {user && showAccountMenu && (
                                    <div className="absolute right-0 top-[45px] z-50 w-[225px] rounded-[4px] bg-[linear-gradient(180deg,#BCA6C9_0%,#2B2139_100%)] p-[20px] text-white backdrop-blur-[20px]">

                                        <div className="flex flex-col gap-[20px]">

                                            <Link href="/account" className="flex cursor-pointer hover:opacity-85 items-center gap-[10px]">
                                                <span> <svg
                                                    width="32"
                                                    height="32"
                                                    viewBox="0 0 32 32"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M24 27V24.3333C24 22.9188 23.5224 21.5623 22.6722 20.5621C21.8221 19.5619 20.669 19 19.4667 19H11.5333C10.331 19 9.17795 19.5619 8.32778 20.5621C7.47762 21.5623 7 22.9188 7 24.3333V27"
                                                        stroke="white"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M16.5 14C18.9853 14 21 11.9853 21 9.5C21 7.01472 18.9853 5 16.5 5C14.0147 5 12 7.01472 12 9.5C12 11.9853 14.0147 14 16.5 14Z"
                                                        stroke="white"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg></span>
                                                <span className="poppins text-[14px] leading-[21px]">
                                                    Manage My Account
                                                </span>
                                            </Link>

                                            <Link href="/account?tab=orders" className="flex items-center gap-[16px] cursor-pointer hover:opacity-85">
                                                <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M3 6.3V20.5C3 20.7652 3.10536 21.0196 3.29289 21.2071C3.48043 21.3946 3.73478 21.5 4 21.5H20C20.2652 21.5 20.5196 21.3946 20.7071 21.2071C20.8946 21.0196 21 20.7652 21 20.5V6.3H3Z" stroke="#FAFAFA" strokeWidth="1.5" strokeLinejoin="round" />
                                                    <path d="M21 6.3L18.1665 2.5H5.8335L3 6.3M15.7775 9.6C15.7775 11.699 14.0865 13.4 12 13.4C9.9135 13.4 8.222 11.699 8.222 9.6" stroke="#FAFAFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                </span>
                                                <span className="poppins text-[14px] leading-[21px]">
                                                    My Order
                                                </span>
                                            </Link>

                                            <Link href="/account?tab=cancellations" className="flex items-center gap-[16px] cursor-pointer hover:opacity-85">
                                                <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                                </span>
                                                <span className="poppins text-[14px] leading-[21px]">
                                                    My Cancellations
                                                </span>
                                            </Link>

                                            <Link href="/account?tab=reviews" className="flex items-center gap-[16px] cursor-pointer hover:opacity-85">
                                                <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                                </svg>
                                                </span>
                                                <span className="poppins text-[14px] leading-[21px]">
                                                    My Reviews
                                                </span>
                                            </Link>

                                            <button onClick={handleLogout} className="flex items-center gap-[16px] cursor-pointer hover:opacity-85">
                                                <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                                                </svg>
                                                </span>
                                                <span className="poppins text-[14px] leading-[21px]">
                                                    Logout
                                                </span>
                                            </button>

                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    <button
                        onClick={() => setOpen(!open)}
                        className="flex h-[32px] w-[32px] flex-col items-center justify-center gap-[5px] lg:hidden">
                        <span className="h-[2px] w-[22px] bg-black" />
                        <span className="h-[2px] w-[22px] bg-black" />
                        <span className="h-[2px] w-[22px] bg-black" />
                    </button>
                </div>
            </div>
            {open && (
                <>

                    <div className="border-t border-black/10 bg-white px-4 py-4 lg:hidden">
                        <ul className="flex flex-col gap-4 poppins">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className="block text-[16px] leading-[24px] text-black"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <button onClick={handleLogout} className="flex items-center gap-[16px] mt-4 cursor-pointer hover:opacity-85">
                            <span className="poppins text-[18px] leading-[21px]">
                                Logout
                            </span>
                        </button>
                        <div className="relative mt-4 h-[38px] w-full rounded-[4px] bg-[#F5F5F5]">
                            <input
                                type="text"
                                placeholder="What are you looking for?"
                                className="h-full w-full bg-transparent pl-[20px] pr-[44px] poppins text-[12px] outline-none"
                            />

                            <svg
                                className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle cx="11" cy="11" r="7" stroke="black" strokeWidth="2" />
                                <path
                                    d="M16.5 16.5L21 21"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>

                </>
            )}
        </nav >
    );
}