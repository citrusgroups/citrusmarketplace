"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);

    const getOrders = async () => {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Orders load nahi huay");
            return;
        }

        setOrders(data.orders || []);
    };

    useEffect(() => {
        getOrders();
    }, []);

    const updateStatus = async (orderId, status) => {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Status update failed");
            return;
        }

        toast.success("Order status updated");
        getOrders();
    };

    return (
        <section className="w-full">
            <div className="mb-8">
                <h1 className="inter text-[32px] font-semibold text-black">
                    Orders
                </h1>
                <p className="poppins mt-2 text-[14px] text-black/50">
                    Manage customer orders and update delivery status.
                </p>
            </div>

            <div className="overflow-x-auto rounded bg-white shadow-[0_1px_13px_rgba(0,0,0,0.08)]">
                <table className="w-full min-w-[950px]">
                    <thead>
                        <tr>
                            {["Order ID", "Customer", "Total", "Payment", "Status", "Date", "Action"].map((head) => (
                                <th key={head} className="bg-[#F5F5F5] px-6 py-4 text-left poppins font-medium">
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-6 text-center text-black/50">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="border-t">
                                    <td className="px-6 py-4">#{order.id.slice(0, 8)}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{order.firstName || "Customer"}</p>
                                        <p className="text-sm text-black/50">{order.email}</p>
                                    </td>
                                    <td className="px-6 py-4">${order.totalPrice}</td>
                                    <td className="px-6 py-4">{order.paymentMethod || "N/A"}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status || "pending"}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            className="rounded bg-[#F5F5F5] px-3 py-2 outline-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="rounded bg-black px-3 py-2 text-white"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}