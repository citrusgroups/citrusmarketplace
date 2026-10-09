"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);

    const [form, setForm] = useState({
        code: "",
        discountPercent: "",
        startAt: "",
        endAt: "",
        isActive: true,
    });

    const getCoupons = async () => {
        const res = await fetch("/api/coupons");
        const data = await res.json();

        setCoupons(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        getCoupons();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const getCouponStatus = (coupon) => {
        const now = new Date();

        if (!coupon.isActive) return "Disabled";
        if (coupon.startAt && now < new Date(coupon.startAt)) return "Upcoming";
        if (coupon.endAt && now > new Date(coupon.endAt)) return "Expired";

        return "Active";
    };

    const addCoupon = async (e) => {
        e.preventDefault();

        if (
            form.startAt &&
            form.endAt &&
            new Date(form.endAt) <= new Date(form.startAt)
        ) {
            toast.error("End date start date se baad honi chahiye");
            return;
        }

        if (
            Number(form.discountPercent) <= 0 ||
            Number(form.discountPercent) > 100
        ) {
            toast.error("Discount 1 se 100 ke darmiyan hona chahiye");
            return;
        }

        const payload = {
            ...form,
            code: form.code.trim().toUpperCase(),
        };

        const res = await fetch("/api/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Coupon add nahi hua");
            return;
        }

        toast.success("Coupon added");

        setForm({
            code: "",
            discountPercent: "",
            startAt: "",
            endAt: "",
            isActive: true,
        });

        getCoupons();
    };

    const deleteCoupon = async (id) => {
        const confirmed = confirm("Delete this coupon?");

        if (!confirmed) return;

        const res = await fetch("/api/coupons", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Coupon delete failed");
            return;
        }

        toast.success("Coupon deleted");
        getCoupons();
    };

    return (
        <div>
            <h1 className="inter text-[36px] font-semibold">Coupons</h1>

            <form
                onSubmit={addCoupon}
                className="mt-8 grid gap-5 rounded bg-white p-6 shadow md:grid-cols-4"
            >
                <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="Coupon Code"
                    className="h-[50px] rounded border px-4 outline-none"
                    required
                />

                <input
                    name="discountPercent"
                    type="number"
                    value={form.discountPercent}
                    onChange={handleChange}
                    placeholder="Discount %"
                    className="h-[50px] rounded border px-4 outline-none"
                    required
                />

                <input
                    name="startAt"
                    type="datetime-local"
                    value={form.startAt}
                    onChange={handleChange}
                    className="h-[50px] rounded border px-4 outline-none"
                />

                <input
                    name="endAt"
                    type="datetime-local"
                    value={form.endAt}
                    onChange={handleChange}
                    className="h-[50px] rounded border px-4 outline-none"
                />

                <label className="flex items-center gap-2">
                    <input
                        name="isActive"
                        type="checkbox"
                        checked={form.isActive}
                        onChange={handleChange}
                    />
                    Active
                </label>

                <button className="h-[50px] rounded bg-[#F97316] text-white md:col-span-4">
                    Add Coupon
                </button>
            </form>

            <div className="mt-8 overflow-x-auto rounded bg-white p-5 shadow">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="pb-3">Code</th>
                            <th className="pb-3">Discount</th>
                            <th className="pb-3">Active</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">Start Date</th>
                            <th className="pb-3">End Date</th>
                            <th className="pb-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {coupons.map((item) => {
                            const status = getCouponStatus(item);

                            return (
                                <tr key={item.id} className="border-b">
                                    <td className="py-4">{item.code}</td>

                                    <td className="py-4">
                                        {item.discountPercent}%
                                    </td>

                                    <td className="py-4">
                                        {item.isActive ? "Yes" : "No"}
                                    </td>

                                    <td className="py-4">
                                        <span
                                            className={`rounded px-2 py-1 text-xs text-white ${status === "Active"
                                                    ? "bg-green-500"
                                                    : status === "Upcoming"
                                                        ? "bg-blue-500"
                                                        : status === "Expired"
                                                            ? "bg-red-500"
                                                            : "bg-gray-500"
                                                }`}
                                        >
                                            {status}
                                        </span>
                                    </td>

                                    <td className="py-4">
                                        {item.startAt
                                            ? new Date(item.startAt).toLocaleString()
                                            : "-"}
                                    </td>

                                    <td className="py-4">
                                        {item.endAt
                                            ? new Date(item.endAt).toLocaleString()
                                            : "-"}
                                    </td>

                                    <td className="py-4">
                                        <button
                                            onClick={() => deleteCoupon(item.id)}
                                            className="rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}