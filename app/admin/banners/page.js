"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminBannersPage() {
    const [banners, setBanners] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        heading: "",
        buttonText: "Shop Now",
        buttonLink: "/",
        image: "",
        sortOrder: "",
        isActive: true,
    });

    const getBanners = async () => {
        const res = await fetch("/api/admin/banners");
        const data = await res.json();

        if (res.ok) setBanners(data.banners || []);
    };

    useEffect(() => {
        getBanners();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const uploadImage = async (file) => {
        if (!file) return;

        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        setUploading(false);

        if (!res.ok) {
            toast.error(data.error || "Image upload failed");
            return;
        }

        setForm((prev) => ({
            ...prev,
            image: data.url,
        }));

        toast.success("Image uploaded");
    };

    const addBanner = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/admin/banners", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Banner add failed");
            return;
        }

        toast.success("Banner added");

        setForm({
            title: "",
            heading: "",
            buttonText: "Shop Now",
            buttonLink: "/",
            image: "",
            sortOrder: "",
            isActive: true,
        });

        getBanners();
    };

    const deleteBanner = async (id) => {
        if (!confirm("Delete this banner?")) return;

        const res = await fetch(`/api/admin/banners/${id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Delete failed");
            return;
        }

        toast.success("Banner deleted");
        getBanners();
    };

    return (
        <section className="w-full">
            <h1 className="inter text-[28px] font-semibold sm:text-[32px]">
                Hero Banners
            </h1>

            <form
                onSubmit={addBanner}
                className="mt-8 rounded bg-white p-4 shadow sm:p-6"
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Banner Title"
                        className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
                    />

                    <input
                        name="heading"
                        value={form.heading}
                        onChange={handleChange}
                        placeholder="Banner Heading"
                        className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
                    />

                    <input
                        name="buttonText"
                        value={form.buttonText}
                        onChange={handleChange}
                        placeholder="Button Text"
                        className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
                    />

                    <input
                        name="buttonLink"
                        value={form.buttonLink}
                        onChange={handleChange}
                        placeholder="Button Link"
                        className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
                    />

                    <input
                        name="sortOrder"
                        type="number"
                        value={form.sortOrder}
                        onChange={handleChange}
                        placeholder="Sort Order"
                        className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
                    />

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadImage(e.target.files?.[0])}
                        className="h-[50px] rounded bg-[#F5F5F5] px-4 py-3 outline-none"
                    />
                </div>

                {form.image && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <img
                            src={form.image}
                            alt="banner"
                            className="h-24 w-40 rounded object-contain bg-black"
                        />
                        <span className="break-all text-sm text-black/50">
                            {form.image}
                        </span>
                    </div>
                )}

                <label className="mt-5 flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                    />
                    Active
                </label>

                <button
                    disabled={uploading}
                    className="mt-5 h-[48px] w-full rounded bg-[#F97316] px-6 text-white disabled:opacity-60 sm:w-auto"
                >
                    {uploading ? "Uploading..." : "Add Banner"}
                </button>
            </form>

            <div className="mt-8 grid gap-4">
                {banners.map((banner) => (
                    <div
                        key={banner.id}
                        className="rounded bg-white p-4 shadow sm:p-5"
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="h-24 w-full rounded bg-black object-contain sm:w-40"
                                />

                                <div>
                                    <h3 className="font-semibold">{banner.title}</h3>
                                    <p className="text-black/60">{banner.heading}</p>
                                    <p className="text-sm text-black/40">
                                        Order: {banner.sortOrder} |{" "}
                                        {banner.isActive ? "Active" : "Inactive"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => deleteBanner(banner.id)}
                                className="h-[40px] rounded bg-red-500 px-4 text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}