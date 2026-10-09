"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CategoryPage() {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const getProducts = async () => {
            const res = await fetch("/api/products");
            const data = await res.json();

            if (res.ok) {
                setProducts(
                    Array.isArray(data)
                        ? data.filter((p) => p.categoryId === slug)
                        : []
                );
            }
        };

        getProducts();
    }, [slug]);

    return (
        <main className="w-full bg-white py-[80px]">
            <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
                <h1 className="mb-10 text-[36px] font-semibold">
                    {slug
                        .split("-")
                        .map(
                            (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                </h1>

                <div className="grid grid-cols-1 gap-[30px] sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((item) => (
                        <Link key={item.id} href={`/product/${item.id}`}>
                            <div className="rounded bg-[#F5F5F5] p-5">
                                <img
                                    src={item.images?.[0]?.imageUrl || "/images/Frame 611.png"}
                                    alt={item.name}
                                    className="mx-auto h-[180px] object-contain"
                                />

                                <h3 className="mt-4">{item.name}</h3>

                                <p className="text-[#F97316]">${item.basePrice}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}