"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [form, setForm] = useState({
        flashSaleEnabled: false,
        flashSaleDiscountPercent: "",
        flashSaleStartTime: "",
        flashSaleEndTime: "",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getSettings = async () => {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();

            if (res.ok) {
                setForm({
                    flashSaleEnabled: data.flashSaleEnabled || false,
                    flashSaleDiscountPercent: data.flashSaleDiscountPercent || "",
                    flashSaleStartTime: data.flashSaleStartTime
                        ? data.flashSaleStartTime.slice(0, 16)
                        : "",
                    flashSaleEndTime: data.flashSaleEndTime
                        ? data.flashSaleEndTime.slice(0, 16)
                        : "",
                });
            }
        };

        getSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const saveSettings = async () => {
        setLoading(true);

        const res = await fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            toast.error(data.error || "Settings save failed");
            return;
        }

        toast.success("Settings saved");
    };

    return (
        <section className="w-full">
            <h1 className="inter text-[32px] font-semibold text-black">
                Settings
            </h1>

            <div className="mt-8 rounded bg-white p-6 shadow-[0_1px_13px_rgba(0,0,0,0.08)]">
                <h2 className="mb-6 text-[22px] font-semibold">
                    Flash Sale Settings
                </h2>

                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        name="flashSaleEnabled"
                        checked={form.flashSaleEnabled}
                        onChange={handleChange}
                    />
                    Enable Flash Sale
                </label>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                    <input
                        type="number"
                        name="flashSaleDiscountPercent"
                        value={form.flashSaleDiscountPercent}
                        onChange={handleChange}
                        placeholder="Discount %"
                        className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
                    />

                    <input
                        type="datetime-local"
                        name="flashSaleStartTime"
                        value={form.flashSaleStartTime}
                        onChange={handleChange}
                        className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
                    />

                    <input
                        type="datetime-local"
                        name="flashSaleEndTime"
                        value={form.flashSaleEndTime}
                        onChange={handleChange}
                        className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
                    />
                </div>

                <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="mt-8 h-[52px] rounded bg-[#F97316] px-8 text-white disabled:opacity-60"
                >
                    {loading ? "Saving..." : "Save Settings"}
                </button>
            </div>
        </section>
    );
}
