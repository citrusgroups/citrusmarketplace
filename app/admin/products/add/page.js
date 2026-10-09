"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AddProductPage() {
    const [loading, setLoading] = useState(false);
    const [hasVariants, setHasVariants] = useState(false);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({})
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        oldPrice: "",
        discountPercent: "",
        category: "",
        stock: "",
        badge: "",
        isFlashSale: false,
        isBestSelling: false,
        isFeatured: false,
    });
    const [simpleImages, setSimpleImages] = useState([]);
    const [variants, setVariants] = useState([
        {
            colorName: "",
            colorCode: "#000000",
            price: "",
            stock: "",
            images: [],
        },
    ]);
    const validate = () => {
        let newErrors = {};

        if (!form.name.trim()) newErrors.name = "Product name is required";
        if (!form.price.trim()) newErrors.price = "Price is required";
        if (!form.category.trim()) newErrors.category = "Category is required";
        if (!form.description.trim()) newErrors.description = "Description is required";

        if (!hasVariants && simpleImages.length === 0) {
            newErrors.images = "Product image is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
        setErrors({
            ...errors,
            [name]: "",
        })
    };

    const uploadImages = async (files) => {
        const uploaded = [];
        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            console.log("UPLOAD RESPONSE:", data);
            if (!res.ok) {
                throw new Error(data.error || "Image upload failed");
            }
            uploaded.push(data.url);
        }
        return uploaded;
    };

    const handleSimpleImages = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const urls = await uploadImages(files);
        setSimpleImages((prev) => [...prev, ...urls]);
    };

    const handleVariantChange = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };

    const handleVariantImages = async (index, files) => {
        const selectedFiles = Array.from(files || []);
        if (selectedFiles.length === 0) return;

        const urls = await uploadImages(selectedFiles);

        setVariants((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                images: [...(updated[index].images || []), ...urls],
            };
            return updated;
        });
    };

    const addVariant = () => {
        setVariants([
            ...variants,
            {
                colorName: "",
                colorCode: "#000000",
                price: "",
                stock: "",
                images: [],
            },
        ]);
    };
const router = useRouter()
    const submitProduct = async () => {
        try {
            if (!validate()) return;
            setLoading(true);
            const payload = {
                ...form,
                hasVariants,
                images: hasVariants ? [] : simpleImages,
                variants: hasVariants ? variants : [],
            };
            const res = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Product save failed");
                return;
            }
            toast.success("Product added successfully");
            router.push("/admin/products")
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const getCategories = async () => {
            const res = await fetch("/api/admin/categories");
            const data = await res.json();

            if (res.ok) {
                setCategories(data.categories || []);
            }
        };

        getCategories();
    }, []);
    return (
        <section className="w-full">
            <h1 className="inter text-[32px] font-semibold text-black">
                Add Product
            </h1>

            <div className="mt-8 rounded bg-white p-6 shadow-[0_1px_13px_rgba(0,0,0,0.08)]">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div ><input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" className="h-[50px] w-full rounded bg-[#F5F5F5] px-4 outline-none" />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>
                    <div><input name="price" value={form.price} onChange={handleChange} placeholder="Base Price" className="h-[50px] w-full rounded bg-[#F5F5F5] px-4 outline-none" />
                        {errors.price && (
                            <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                        )}
                    </div>
                    <div><input name="oldPrice" value={form.oldPrice} onChange={handleChange} placeholder="Old Price" className="h-[50px] w-full rounded bg-[#F5F5F5] px-4 outline-none" /></div>
                    <div><input name="discountPercent" value={form.discountPercent} onChange={handleChange} placeholder="Discount %" className="h-[50px] w-full rounded bg-[#F5F5F5] px-4 outline-none" /></div>
                    <div>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="h-[50px] w-full rounded bg-[#F5F5F5] px-4 outline-none"
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                        )}
                    </div>
                    <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" disabled={hasVariants} className="h-[50px] w-full rounded bg-[#F5F5F5] px-4 outline-none disabled:opacity-50" />
                    <input name="badge" value={form.badge} onChange={handleChange} placeholder="Badge e.g NEW" className="h-[50px] w-full rounded bg-[#F5F5F5] px-4 outline-none" />
                    <div>
                        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="min-h-[100px] w-full rounded bg-[#F5F5F5] p-4 outline-none md:col-span-2" />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-5">
                    <label><input type="checkbox" name="isFlashSale" checked={form.isFlashSale} onChange={handleChange} /> Flash Sale</label>
                    <label><input type="checkbox" name="isBestSelling" checked={form.isBestSelling} onChange={handleChange} /> Best Selling</label>
                    <label><input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} /> Featured</label>
                    <label><input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} /> Has Color Variants</label>
                </div>

                {!hasVariants && (
                    <div className="mt-8">
                        <h2 className="mb-3 text-[20px] font-medium">Product Images</h2>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleSimpleImages}
                        />
                        {errors.images && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.images}
                            </p>
                        )}
                    </div>
                )}

                {hasVariants && (
                    <div className="mt-8 space-y-6">
                        <h2 className="text-[20px] font-medium">Color Variants</h2>

                        {variants.map((variant, index) => (
                            <div key={index} className="rounded border p-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <input placeholder="Color Name" value={variant.colorName} onChange={(e) => handleVariantChange(index, "colorName", e.target.value)} className="h-[45px] rounded bg-[#F5F5F5] px-4 outline-none" />

                                    <input type="color" value={variant.colorCode} onChange={(e) => handleVariantChange(index, "colorCode", e.target.value)} className="h-[45px]" />

                                    <input placeholder="Variant Price" value={variant.price} onChange={(e) => handleVariantChange(index, "price", e.target.value)} className="h-[45px] rounded bg-[#F5F5F5] px-4 outline-none" />

                                    <input placeholder="Stock" value={variant.stock} onChange={(e) => handleVariantChange(index, "stock", e.target.value)} className="h-[45px] rounded bg-[#F5F5F5] px-4 outline-none" />
                                </div>

                                <div className="mt-4">
                                    <input type="file" multiple onChange={(e) => handleVariantImages(index, e.target.files)} />
                                </div>
                            </div>
                        ))}

                        <button onClick={addVariant} className="h-[45px] rounded bg-black px-5 text-white">
                            Add Variant
                        </button>
                    </div>
                )}

                <button
                    onClick={submitProduct}
                    disabled={loading}
                    className="mt-8 h-[56px] rounded bg-[#F97316] px-8 text-white disabled:opacity-60"
                >
                    {loading ? "Saving..." : "Save Product"}
                </button>
            </div>
        </section>
    );
}