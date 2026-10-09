"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlistStore } from "../../store/wishlistStore";
import { useCartStore } from "../../store/cartStore";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const getProducts = async () => {
            const res = await fetch("/api/products");
            const data = await res.json();

            if (res.ok) {
                setProducts(Array.isArray(data) ? data : [])
            }
        };

        getProducts();
    }, []);

    const wishlist = useWishlistStore((state) => state.wishlist);
    const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);


    const addToCart = useCartStore(
        (state) => state.addToCart
    );

    return (
        <main className="w-full bg-white py-[80px]">
            <div className="mx-auto max-w-[1170px]">
                <h1 className="mb-10 text-[36px] font-semibold">
                    All Products
                </h1>

                <div className="grid grid-cols-4 gap-[30px]">
                    {products?.map((item) => {
                        const isFavourite = wishlist.some((wish) => wish.id === item.id);
                        return (
                            <div
                                key={item.id}

                            >
                                <div className="w-full max-w-[270px]">
                                    <div className="group relative h-[250px] w-[270px] overflow-hidden rounded-[4px] bg-[#F5F5F5]">

                                        {item.discountPercent && (
                                            <span className="absolute left-[12px] top-[12px] rounded-[4px] bg-[#F97316] px-[12px] py-[4px] poppins text-[12px] text-white">
                                                -{item.discountPercent}%
                                            </span>
                                        )}

                                        {item.badge === "NEW" && (
                                            <span className="absolute left-[12px] top-[12px] rounded-[4px] bg-[#00FF66] px-[12px] py-[4px] poppins text-[12px] text-white">
                                                NEW
                                            </span>
                                        )}

                                        <div className="absolute right-[12px] top-[12px] flex flex-col gap-[8px]">

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

                                        <div className="absolute left-[40px] top-[35px] flex h-[180px] w-[190px] items-center justify-center">
                                            <img
                                                src={item.images?.[0]?.imageUrl}
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

                                    <h3 className="mt-[16px] poppins text-[16px] font-medium">
                                        {item.name}
                                    </h3>

                                    <div className="mt-[8px] flex gap-[12px]">
                                        <span className="text-[#F97316]">
                                            ${item.basePrice}
                                        </span>

                                        {item.oldPrice && (
                                            <span className="text-black/50 line-through">
                                                ${item.oldPrice}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-[8px] flex items-center gap-[8px]">
                                        <span className="text-[20px] text-[#FFAD33]">
                                            {"★".repeat(Math.round(item.averageRating || 0))}
                                            {"☆".repeat(5 - Math.round(item.averageRating || 0))}
                                        </span>
                                        <span className="poppins text-[14px] font-semibold text-black/50">
                                            {item.totalReviews || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    );
}