"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        const getProducts = async () => {
            const res = await fetch("/api/admin/products");
            const data = await res.json();

            if (res.ok) {
                setProducts(Array.isArray(data) ? data : []);
            }
        };

        getProducts();
    }, []);

    const deleteProduct = async (id) => {
        const confirmDelete = confirm("Are you sure you want to delete this product?");
        if (!confirmDelete) return;

        const res = await fetch(`/api/admin/products/${id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Delete failed");
            return;
        }

        setProducts((prev) => prev.filter((product) => product.id !== id));
    };
    return (
        <section className="w-full">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="inter text-[32px] font-semibold text-black">
                        Products
                    </h1>
                    <p className="poppins mt-2 text-[14px] text-black/50">
                        Manage all store products, stock, badges and sections.
                    </p>
                </div>

                <Link
                    href="/admin/products/add"
                    className="flex h-[48px] items-center justify-center rounded-[4px] bg-[#F97316] px-6 poppins text-[15px] font-medium text-white hover:opacity-85"
                >
                    Add Product
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total Products", value: products.length },
                    { title: "Flash Sale", value: products.filter((p) => p.isFlashSale).length },
                    { title: "Best Selling", value: products.filter((p) => p.isBestSelling).length },
                    { title: "Featured", value: products.filter((p) => p.isFeatured).length },
                ].map((item) => (
                    <div
                        key={item.title}
                        className="rounded-[4px] bg-white p-5 shadow-[0_1px_13px_rgba(0,0,0,0.08)]"
                    >
                        <p className="poppins text-[14px] text-black/50">{item.title}</p>
                        <h2 className="inter mt-3 text-[28px] font-semibold">
                            {item.value}
                        </h2>
                    </div>
                ))}
            </div>

            <div className="mt-8 overflow-x-auto rounded-[4px] bg-white shadow-[0_1px_13px_rgba(0,0,0,0.08)]">
                <table className="w-full min-w-[900px]">
                    <thead>
                        <tr>
                            <th className="bg-[#F5F5F5] px-6 py-4 text-left poppins font-medium">
                                Product
                            </th>
                            <th className="bg-[#F5F5F5] px-6 py-4 text-left poppins font-medium">
                                Price
                            </th>
                            <th className="bg-[#F5F5F5] px-6 py-4 text-left poppins font-medium">
                                Stock
                            </th>
                            <th className="bg-[#F5F5F5] px-6 py-4 text-left poppins font-medium">
                                Section
                            </th>
                            <th className="bg-[#F5F5F5] px-6 py-4 text-center poppins font-medium">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-t">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-12 w-12 rounded object-cover"
                                        />

                                        <span>{product.name}</span>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    ${product.basePrice}
                                </td>

                                <td className="px-6 py-4">
                                    {product.stock || 0}
                                </td>

                                <td className="px-6 py-4">
                                    {product.isFlashSale && (
                                        <span className="mr-2 rounded bg-red-100 px-2 py-1 text-xs text-red-600">
                                            Flash
                                        </span>
                                    )}

                                    {product.isBestSelling && (
                                        <span className="mr-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
                                            Best
                                        </span>
                                    )}

                                    {product.isFeatured && (
                                        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-600">
                                            Featured
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <Link href={`/admin/products/edit/${product.id}`} className="rounded bg-yellow-500 px-3 py-1 text-white">
                                            Edit
                                        </Link>

                                        <button onClick={()=> deleteProduct(product.id)} className="rounded bg-red-500 px-3 py-1 text-white">
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}