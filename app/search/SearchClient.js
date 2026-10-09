"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

export default function SearchClient() {
    const searchParams = useSearchParams();
    const q = searchParams.get("q") || "";

    const [products, setProducts] = useState([]);
    const addToCart = useCartStore((state) => state.addToCart);
    const wishlist = useWishlistStore((state) => state.wishlist);
    const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

    useEffect(() => {
        const getProducts = async () => {
            const res = await fetch(`/api/products?search=${encodeURIComponent(q)}`);
            const data = await res.json();

            if (res.ok) setProducts(Array.isArray(data) ? data : []);
        };

        if (q) getProducts();
    }, [q]);

    return (
        <main className="mx-auto max-w-[1170px] px-4 py-20">
            <h1 className="text-[28px] font-semibold sm:text-[32px]">
                Search results for "{q}"
            </h1>

            {products.length === 0 ? (
                <p className="mt-10 text-black/50">No products found.</p>
            ) : (
                <div className="mt-10 grid grid-cols-1 gap-[30px] sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((item) => {
                        const isFavourite = wishlist.some((wish) => wish.id === item.id);
                        const stars = Math.round(item.averageRating || 0);

                        return (
                            <div key={item.id} className="w-full max-w-[270px]">
                                <div className="group relative h-[250px] w-full overflow-hidden rounded-[4px] bg-[#F5F5F5] sm:w-[270px]">
                                    {item.discountPercent && (
                                        <span className="absolute left-[12px] top-[12px] z-20 rounded-[4px] bg-[#F97316] px-[12px] py-[4px] text-[12px] text-white">
                                            -{item.discountPercent}%
                                        </span>
                                    )}

                                    <div className="absolute right-[12px] top-[12px] z-10 flex flex-col gap-[8px]">
                                        <button onClick={() => toggleWishlist(item)} className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white hover:opacity-85">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill={isFavourite ? "#F97316" : "none"}
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke={isFavourite ? "#F97316" : "currentColor"}
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                                />
                                            </svg>
                                        </button>

                                        <Link href={`/product/${item.id}`} className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white hover:opacity-85">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /> </svg>
                                        </Link>
                                    </div>

                                    <div className="absolute left-1/2 top-[35px] flex h-[180px] w-[190px] -translate-x-1/2 items-center justify-center">
                                        <img
                                            src={item.images?.[0]?.imageUrl || "/images/placeholder.png"}
                                            alt={item.name}
                                            className="h-[180px] w-[190px] object-contain"
                                        />
                                    </div>

                                    <button
                                        onClick={() => addToCart(item)}
                                        className="absolute bottom-0 left-0 h-[41px] w-full translate-y-full bg-black text-white transition duration-300 group-hover:translate-y-0"
                                    >
                                        Add To Cart
                                    </button>
                                </div>

                                <h3 className="mt-[16px] text-[16px] font-medium">
                                    {item.name}
                                </h3>

                                <div className="mt-[8px] flex gap-[12px]">
                                    <span className="text-[#F97316]">${item.basePrice}</span>

                                    {item.oldPrice && (
                                        <span className="text-black/50 line-through">
                                            ${item.oldPrice}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-[8px] flex items-center gap-[8px]">
                                    <span className="text-[#FFAD33]">
                                        {"★".repeat(stars)}
                                        {"☆".repeat(5 - stars)}
                                    </span>
                                    <span className="text-black/50">
                                        ({item.totalReviews || 0})
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}