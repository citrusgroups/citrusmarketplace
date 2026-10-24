"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [catalogNotes, setCatalogNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    imageUrl: "",
    isPublished: false,
    description: "",
    price: "",
    oldPrice: "",
    discountPercent: "",
    category: "",
    stock: "",
    badge: "",
    hasVariants: false,
    isFlashSale: false,
    isBestSelling: false,
    isFeatured: false,
  });

  useEffect(() => {
    const getProduct = async () => {
      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Product not found");
        return;
      }

      const p = data.product;

      setCatalogNotes(p.catalogNotes || "");
      setForm({
        name: p.name || "",
        imageUrl: p.images?.[0]?.imageUrl || "",
        isPublished: p.isPublished,
        description: p.description || "",
        price: p.basePrice || "",
        oldPrice: p.oldPrice || "",
        discountPercent: p.discountPercent || "",
        category: p.categoryId || "",
        stock: p.stock || "",
        badge: p.badge || "",
        hasVariants: p.hasVariants || false,
        isFlashSale: p.isFlashSale || false,
        isBestSelling: p.isBestSelling || false,
        isFeatured: p.isFeatured || false,
      });
    };

    if (id) getProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) {
      toast.error("Choose an image under 4 MB.");
      return;
    }
    setUploading(true);
    try {
      const data = new FormData();
      data.set("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: data });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setForm((prev) => ({ ...prev, imageUrl: result.url }));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };
  const updateProduct = async () => {
    setLoading(true);

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Update failed");
      return;
    }

    toast.success("Product updated");
    router.push("/admin/products");
  };
  useEffect(() => {
    const getCategories = async () => {
      const res = await fetch("/api/categories");
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
        Edit Product
      </h1>

      <div className="mt-8 rounded bg-white p-6 shadow-[0_1px_13px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
          />
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Base Price"
            className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
          />
          <input
            name="oldPrice"
            value={form.oldPrice}
            onChange={handleChange}
            placeholder="Old Price"
            className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
          />
          <input
            name="discountPercent"
            value={form.discountPercent}
            onChange={handleChange}
            placeholder="Discount %"
            className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
          >
            <option value="">Select Category</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock"
            disabled={form.hasVariants}
            className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none disabled:opacity-50"
          />
          <input
            name="badge"
            value={form.badge}
            onChange={handleChange}
            placeholder="Badge"
            className="h-[50px] rounded bg-[#F5F5F5] px-4 outline-none"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="min-h-[100px] rounded bg-[#F5F5F5] p-4 outline-none md:col-span-2"
          />
        </div>

        {catalogNotes && (
          <p className="mt-5 rounded border border-orange-200 bg-orange-50 p-4 text-sm leading-7">
            Catalog review: {catalogNotes}
          </p>
        )}
        <label className="mt-5 block text-sm">
          Product image URL
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="mt-2 block w-full rounded border p-3"
          />
        </label>
        <label className="mt-4 block text-sm">
          Or upload a product image
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={uploadImage}
            className="mt-2 block w-full text-sm"
          />
        </label>
        <label className="mt-5 flex items-start gap-3 text-sm leading-7">
          <input
            type="checkbox"
            name="isPublished"
            checked={form.isPublished}
            onChange={handleChange}
            className="mt-2"
          />
          <span>
            Publish on storefront. I have confirmed the product, image, USD
            selling price and available stock.
          </span>
        </label>
        <div className="mt-6 flex flex-wrap gap-5">
          <label>
            <input
              type="checkbox"
              name="hasVariants"
              checked={form.hasVariants}
              disabled
              onChange={handleChange}
            />{" "}
            Has Variants
          </label>
          <label>
            <input
              type="checkbox"
              name="isFlashSale"
              checked={form.isFlashSale}
              onChange={handleChange}
            />{" "}
            Flash Sale
          </label>
          <label>
            <input
              type="checkbox"
              name="isBestSelling"
              checked={form.isBestSelling}
              onChange={handleChange}
            />{" "}
            Best Selling
          </label>
          <label>
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
            />{" "}
            Featured
          </label>
        </div>

        <button
          onClick={updateProduct}
          disabled={loading || uploading}
          className="mt-8 h-[56px] rounded bg-[#F97316] px-8 text-white disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>
      </div>
    </section>
  );
}
