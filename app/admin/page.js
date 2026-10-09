"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const getStats = async () => {
            const res = await fetch("/api/admin/dashboard");
            const data = await res.json();

            if (res.ok) {
                setStats(data);
            }
        };

        getStats();
    }, []);

    const cards = [
        { title: "Total Products", value: stats?.totalProducts || 0 },
        { title: "Total Orders", value: stats?.totalOrders || 0 },
        { title: "Pending Orders", value: stats?.pendingOrders || 0 },
        { title: "Cancelled Orders", value: stats?.cancelledOrders || 0 },
        { title: "Delivered Orders", value: stats?.deliveredOrders || 0 },
        { title: "Total Revenue", value: `$${stats?.totalRevenue || 0}` },
    ];

    return (
        <section className="w-full">
            <div className="flex justify-between">
                <h1 className="inter text-[32px] font-semibold text-black">
                    Dashboard
                </h1>


                <Link href="/admin/products/add"
                    className="flex h-[56px] w-[159px] items-center justify-center gap-2 rounded bg-[#F97316] px-8 font-medium text-white transition-all duration-300 hover:bg-[#c73b3b] disabled:opacity-60"
                >
                    Add Product
                </Link>

            </div>
            <p className="poppins mt-2 text-[14px] text-black/50">
                Overview of your store performance.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((item) => (
                    <div
                        key={item.title}
                        className="rounded bg-white p-6 shadow-[0_1px_13px_rgba(0,0,0,0.08)]"
                    >
                        <p className="poppins text-[14px] text-black/50">{item.title}</p>
                        <h2 className="inter mt-3 text-[30px] font-semibold">
                            {item.value}
                        </h2>
                    </div>
                ))}
            </div>
            <div className="mt-10 rounded bg-white p-6 shadow-[0_1px_13px_rgba(0,0,0,0.08)]">
                <h2 className="inter mb-5 text-[24px] font-semibold">
                    Recent Orders
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-3 text-left">Order ID</th>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {stats?.recentOrders?.map((order) => (
                                <tr key={order.id} className="border-b">
                                    <td className="px-4 py-3">
                                        {order.id.slice(0, 8)}...
                                    </td>

                                    <td className="px-4 py-3">
                                        {order.firstName}
                                    </td>

                                    <td className="px-4 py-3">
                                        ${order.totalPrice}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded px-2 py-1 text-xs text-white ${order.status === "pending"
                                                ? "bg-yellow-500"
                                                : order.status === "cancelled"
                                                    ? "bg-red-500"
                                                    : order.status === "delivered"
                                                        ? "bg-green-500"
                                                        : "bg-blue-500"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-10 rounded bg-white p-6 shadow-[0_1px_13px_rgba(0,0,0,0.08)]">
                <h2 className="inter mb-5 text-[24px] font-semibold">
                    Low Stock Products
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">Stock</th>
                                <th className="px-4 py-3 text-left">Price</th>
                            </tr>
                        </thead>

                        <tbody>
                            {stats?.lowStockProducts?.map((product) => (
                                <tr key={product.id} className="border-b">
                                    <td className="px-4 py-3">{product.name}</td>
                                    <td className="px-4 py-3 text-red-500">
                                        {product.stock || 0} left
                                    </td>
                                    <td className="px-4 py-3">${product.basePrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-10 rounded bg-white p-6 shadow-[0_1px_13px_rgba(0,0,0,0.08)]">
                <h2 className="inter mb-5 text-[24px] font-semibold">
                    Top Selling Products
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">Sold</th>
                                <th className="px-4 py-3 text-left">Revenue</th>
                            </tr>
                        </thead>

                        <tbody>
                            {stats?.topSellingProducts?.map((product) => (
                                <tr key={product.productId} className="border-b">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={product.image}
                                                alt={product.productName}
                                                className="h-12 w-12 rounded object-cover"
                                            />
                                            <span>{product.productName}</span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        {product.totalSold}
                                    </td>

                                    <td className="px-4 py-3">
                                        ${product.totalRevenue}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}