"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function AdminOrderDetailPage() {
    const params = useParams();

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);

    useEffect(() => {
        const getOrder = async () => {
            const res = await fetch(
                `/api/admin/orders/${params.id}`
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error);
                return;
            }

            setOrder(data.order);
            setItems(data.items);
        };

        getOrder();
    }, [params.id]);

    const updateStatus = async (status) => {
        const res = await fetch(
            `/api/admin/orders/${params.id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            }
        );

        if (res.ok) {
            setOrder((prev) => ({
                ...prev,
                status,
            }));

            toast.success("Status updated");
        }
    };

    if (!order) {
        return (
            <div className="p-10">
                Loading...
            </div>
        );
    }

    return (
        <section className="w-full">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="inter text-[32px] font-semibold">
                    Order #{order.id.slice(0, 8)}
                </h1>

                <select
                    value={order.status}
                    onChange={(e) =>
                        updateStatus(e.target.value)
                    }
                    className="h-[45px] rounded border px-4"
                >
                    <option value="pending">
                        Pending
                    </option>

                    <option value="processing">
                        Processing
                    </option>

                    <option value="shipped">
                        Shipped
                    </option>

                    <option value="delivered">
                        Delivered
                    </option>

                    <option value="cancelled">
                        Cancelled
                    </option>
                </select>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">
                        Customer Information
                    </h2>

                    <div className="space-y-2">
                        <p>
                            <strong>Name:</strong>{" "}
                            {order.firstName}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {order.email}
                        </p>

                        <p>
                            <strong>Phone:</strong>{" "}
                            {order.phone}
                        </p>

                        <p>
                            <strong>City:</strong>{" "}
                            {order.city}
                        </p>

                        <p>
                            <strong>Address:</strong>{" "}
                            {order.streetAddress}
                        </p>

                        <p>
                            <strong>Apartment:</strong>{" "}
                            {order.apartment}
                        </p>
                    </div>
                </div>

                <div className="rounded bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">
                        Order Summary
                    </h2>

                    <div className="space-y-3">
                        <p>
                            <strong>Payment:</strong>{" "}
                            {order.paymentMethod}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {order.status}
                        </p>

                        <p>
                            <strong>Subtotal:</strong> $
                            {order.subtotal}
                        </p>

                        <p>
                            <strong>Discount:</strong> $
                            {order.discount}
                        </p>

                        <p className="text-lg font-semibold">
                            Total: $
                            {order.totalPrice}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 rounded bg-white p-6 shadow">
                <h2 className="mb-6 text-xl font-semibold">
                    Ordered Products
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="pb-4 text-left">
                                    Product
                                </th>

                                <th className="pb-4 text-left">
                                    Qty
                                </th>

                                <th className="pb-4 text-left">
                                    Price
                                </th>

                                <th className="pb-4 text-left">
                                    Total
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t"
                                >
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="h-12 w-12 rounded object-cover"
                                            />

                                            <span>
                                                {
                                                    item.productName
                                                }
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        {item.quantity}
                                    </td>

                                    <td>
                                        ${item.price}
                                    </td>

                                    <td>
                                        $
                                        {item.price *
                                            item.quantity}
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