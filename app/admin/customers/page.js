"use client";

import { useEffect, useState } from "react";

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        const getCustomers = async () => {
            const res = await fetch("/api/admin/customers");
            const data = await res.json();

            if (res.ok) {
                setCustomers(data.customers || []);
            }
        };

        getCustomers();
    }, []);

    return (
        <section className="w-full">
            <h1 className="inter text-[32px] font-semibold text-black">
                Customers
            </h1>

            <p className="poppins mt-2 text-[14px] text-black/50">
                View customer order history and spending.
            </p>

            <div className="mt-8 overflow-x-auto rounded bg-white shadow-[0_1px_13px_rgba(0,0,0,0.08)]">
                <table className="w-full min-w-[850px]">
                    <thead>
                        <tr className="bg-[#F5F5F5]">
                            <th className="px-6 py-4 text-left">Customer</th>
                            <th className="px-6 py-4 text-left">Email</th>
                            <th className="px-6 py-4 text-left">Phone</th>
                            <th className="px-6 py-4 text-left">Orders</th>
                            <th className="px-6 py-4 text-left">Spent</th>
                            <th className="px-6 py-4 text-left">Last Order</th>
                        </tr>
                    </thead>

                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.email || customer.userId} className="border-t">
                                <td className="px-6 py-4">{customer.name}</td>
                                <td className="px-6 py-4">{customer.email}</td>
                                <td className="px-6 py-4">{customer.phone}</td>
                                <td className="px-6 py-4">{customer.totalOrders}</td>
                                <td className="px-6 py-4">${customer.totalSpent}</td>
                                <td className="px-6 py-4">
                                    {customer.lastOrderDate
                                        ? new Date(customer.lastOrderDate).toLocaleDateString()
                                        : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}