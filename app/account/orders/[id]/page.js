"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id;

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);

    const getOrderDetail = async () => {
        if (!orderId) return;

        const res = await fetch(`/api/my-orders/${orderId}`);
        const data = await res.json();

        if (!res.ok) return;

        setOrder(data.order);
        setItems(data.items || []);
    };

    useEffect(() => {
        getOrderDetail();
    }, []);

    if (!order) {
        return (
            <main className="w-full bg-white py-12 lg:py-[80px]">
                <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
                    <p className="poppins text-black/50">Loading order...</p>
                </div>
            </main>
        );
    }
    return (
        <main className="w-full bg-white py-12 lg:py-[80px]">
            <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        
                        <h1 className="poppins text-[32px] font-semibold">
                            Order Details
                        </h1>
                        <p className="mt-2 poppins text-black/50">
                            Order #{order.id}
                        </p>
                    </div>

                    <Link
                        href="/account"
                        className="rounded border border-black/50 px-5 py-3 poppins hover:bg-black hover:text-white"
                    >
                        Back
                    </Link>
                </div>

                <div className="mb-8 grid gap-6 lg:grid-cols-3">
                    <div className="rounded border border-[#E5E5E5] p-5">
                        <h3 className="poppins font-medium">Status</h3>
                        <span className="mt-3 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                            {order.status}
                        </span>
                    </div>

                    <div className="rounded border border-[#E5E5E5] p-5">
                        <h3 className="poppins font-medium">Date</h3>
                        <p className="mt-3 poppins text-black/60">
                            {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="rounded border border-[#E5E5E5] p-5">
                        <h3 className="poppins font-medium">Total</h3>
                        <p className="mt-3 poppins text-[#F97316]">
                            ${order.totalPrice}
                        </p>
                    </div>
                </div>

                <div className="mb-8 rounded-[4px] border border-[#E5E5E5]">
                    <div className="bg-[#F5F5F5] px-6 py-4">
                        <h2 className="poppins text-[20px] font-medium">
                            Products
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-left poppins font-medium">
                                        Product
                                    </th>
                                    <th className="px-6 py-4 text-left poppins font-medium">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-4 text-left poppins font-medium">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 text-left poppins font-medium">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-t border-[#E5E5E5]">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.productName}
                                                        className="h-[54px] w-[54px] object-contain"
                                                    />
                                                )}

                                                <span className="poppins">
                                                    {item.productName}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 poppins">
                                            {item.quantity}
                                        </td>

                                        <td className="px-6 py-5 poppins">
                                            ${item.price}
                                        </td>

                                        <td className="px-6 py-5 poppins">
                                            ${item.price * item.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded border border-[#E5E5E5] p-6">
                        <h2 className="mb-4 poppins text-[20px] font-medium text-[#F97316]">
                            Billing Details
                        </h2>

                        <div className="space-y-3 poppins text-[16px]">
                            <p><span className="text-black/50">Name:</span> {order.firstName}</p>
                            <p><span className="text-black/50">Email:</span> {order.email}</p>
                            <p><span className="text-black/50">Phone:</span> {order.phone}</p>
                            <p><span className="text-black/50">Address:</span> {order.streetAddress}</p>
                            <p><span className="text-black/50">City:</span> {order.city}</p>
                            <p><span className="text-black/50">Payment:</span> {order.paymentMethod}</p>
                        </div>
                    </div>

                    <div className="rounded border border-[#E5E5E5] p-6">
                        <h2 className="mb-4 poppins text-[20px] font-medium text-[#F97316]">
                            Order Summary
                        </h2>

                        <div className="space-y-4 poppins text-[16px]">
                            <div className="flex justify-between border-b pb-3">
                                <span>Subtotal:</span>
                                <span>${order.subtotal}</span>
                            </div>

                            <div className="flex justify-between border-b pb-3">
                                <span>Discount:</span>
                                <span>-${order.discount || 0}</span>
                            </div>

                            <div className="flex justify-between border-b pb-3">
                                <span>Shipping:</span>
                                <span>Free</span>
                            </div>

                            <div className="flex justify-between font-semibold">
                                <span>Total:</span>
                                <span>${order.totalPrice}</span>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}