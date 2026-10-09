"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "../../../store/cartStore";
import { useWishlistStore } from "../../../store/wishlistStore";
import { authClient } from "../../../lib/auth-client";

const colors = ["#A0BCE0", "#EA580C"];
const sizes = ["XS", "S", "M", "L", "XL"];

export default function ProductDetails() {
    const { id } = useParams();
    const router = useRouter();

    const addToCart = useCartStore((state) => state.addToCart);
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [activeImage, setActiveImage] = useState("");
    const [activeColor, setActiveColor] = useState(0);
    const [activeSize, setActiveSize] = useState("M");
    const [variantId, setVariantId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [user, setUser] = useState(null);
    const [comment, setComment] = useState("");
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState("");

    const startEditReview = (review) => {
        setEditingReviewId(review.id);
        setEditRating(review.rating);
        setEditComment(review.comment || "");
    };

    const updateReview = async (reviewId) => {
        const res = await fetch(`/api/reviews/${reviewId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                rating: editRating,
                comment: editComment,
            }),
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) {
            toast.error(data.error || "Review update failed");
            return;
        }

        toast.success("Review updated");
        setEditingReviewId(null);
        setEditComment("");
        setEditRating(5);
        getReviews();
    };

    const deleteReview = async (reviewId) => {
        if (!confirm("Delete this review?")) return;

        const res = await fetch(`/api/reviews/${reviewId}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Review delete failed");
            return;
        }

        toast.success("Review deleted");
        getReviews();
    };
    useEffect(() => {
        const getSession = async () => {
            const session = await authClient.getSession();

            console.log("SESSION:", session);
            if (session?.data?.user) {
                setUser(session.data.user);
            }
        };

        getSession();
    }, []);
    const getReviews = async () => {
        const res = await fetch(`/api/reviews?productId=${id}`);
        const data = await res.json();

        if (res.ok) {
            setReviews(data.reviews || []);
        }
    };
    useEffect(() => {
        if (id) getReviews();
    }, [id]);
    const submitReview = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please login first");
            router.push("/login");
            return;
        }

        if (!comment.trim()) {
            toast.error("Review comment required");
            return;
        }

        const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId: product.id,
                userId: user.id,
                rating,
                comment,
            }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
            toast.error(data.error || "Review submit failed");
            return;
        }

        toast.success("Review submitted");
        setRating(5);
        setComment("");
        getReviews();
    };
    useEffect(() => {
        const getProduct = async () => {
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();
            console.log(data);
            if (!res.ok) {
                toast.error(data.error || "Product not found");
                return;
            }

            setProduct(data.product);
            setRelatedProducts(data.relatedProducts || []);
            setActiveImage(
                data.product.images?.[0]?.imageUrl || "/images/Frame 611.png"
            );
        };

        if (id) getProduct();
    }, [id]);

    const wishlist = useWishlistStore((state) => state.wishlist);
    const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

    const isFavourite = wishlist.some((item) => item.id === product?.id);
    if (!product) {
        return (
            <main className="w-full bg-white py-[80px]">
                <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
                    Loading...
                </div>
            </main>
        );
    }

    const gallery = product.images || [];

    const buyNow = () => {
        const variant = product.variants?.find(v => v.id === variantId);
        if (product.hasVariants && !variant) { toast.error("Please select a product option."); return; }
        addToCart({
            ...product,
            variantId: variant?.id,
            basePrice: variant?.price ?? product.basePrice,
            quantity,
        });

        router.push("/checkout");
    };
    const totalReviews = reviews.length;

    const averageRating =
        totalReviews === 0
            ? 0
            : reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
            totalReviews;

    const fullStars = Math.round(averageRating);
    return (
        <>
            <main className="w-full bg-white py-[80px]">
                <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
                    <div className="mb-[80px] flex gap-[12px] poppins text-[14px] leading-[21px]">
                        <Link href="/account" className="text-black/50">Account</Link>
                        <span className="text-black/50">/</span>
                        <span className="text-black/50">Gaming</span>
                        <span className="text-black/50">/</span>
                        <span className="text-black">Havic HV G-92 Gamepad</span>
                    </div>

                    <div className="flex flex-col gap-[70px] lg:flex-row">
                        <div className="flex gap-[30px]">
                            <div className="flex flex-col gap-4">
                                {gallery.map((img, index) => (
                                    <button
                                        key={img.id || index}
                                        onClick={() => setActiveImage(img.imageUrl)}
                                        className="h-[138px] w-[170px] cursor-pointer rounded-[4px] bg-[#F5F5F5]"
                                    >
                                        <img
                                            src={img.imageUrl}
                                            alt={product.name}
                                            className="h-[100px] w-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="flex h-[600px] w-[500px] items-center justify-center rounded-[4px] bg-[#F5F5F5]">
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="h-[315px] w-[446px] object-contain"
                                />
                            </div>
                        </div>
                        <div className="w-full lg:w-[400px]">
                            <h1 className="inter text-[24px] font-semibold leading-[24px] tracking-[0.03em]">
                                {product.name}
                            </h1>
                            <div className="mt-[16px] flex items-center gap-[8px]">
                                <span className="text-[16px] text-[#FFAD33]">
                                    {"★".repeat(fullStars)}
                                    {"☆".repeat(5 - fullStars)}
                                </span>

                                <span className="poppins text-[14px] text-black/50">
                                    ({totalReviews} Reviews)
                                </span>
                                <span className="text-black/50">|</span>
                                <span className="poppins text-[14px] text-[#00FF66]">In Stock</span>
                            </div>

                            <p className="mt-[16px] inter text-[24px] font-normal leading-[24px] tracking-[0.03em]">
                                ${product.basePrice}
                            </p>

                            <p className="mt-[24px] poppins text-[14px] leading-[21px]">
                                {product.description || "No description available."}
                            </p>

                            <div className="mt-[24px] h-[1px] w-full bg-black/50" />
                            <div className="mt-[24px] flex items-center gap-[24px]">
                                <span className="inter text-[20px] font-normal leading-[20px] tracking-[0.03em]">
                                    Colours:
                                </span>

                                <div className="flex gap-[8px]">
                                    {colors.map((color, index) => (
                                        <button
                                            key={color}
                                            onClick={() => setActiveColor(index)}
                                            className={`flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-full border ${activeColor === index ? "border-black" : "border-transparent"
                                                }`}
                                        >
                                            <span
                                                className="h-[14px] w-[14px] rounded-full"
                                                style={{ backgroundColor: color }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-[24px] flex items-center gap-[24px]">
                                <span className="inter text-[20px] font-normal leading-[20px] tracking-[0.03em]">
                                    Size:
                                </span>
                                <div className="flex gap-[16px]">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setActiveSize(size)}
                                            className={`h-[32px] w-[32px] hover:opacity-85 cursor-pointer rounded-[4px] border text-[14px] ${activeSize === size
                                                ? "border-[#F97316] bg-[#F97316] text-white"
                                                : "border-black/50 bg-white text-black"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-[24px] flex items-center gap-[16px]">
                                <div className="flex h-[44px] w-[159px] rounded-[4px] border border-black/50">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="h-full w-[40px] hover:opacity-85 cursor-pointer border-r border-black/50 text-[24px]"
                                    >
                                        −
                                    </button>

                                    <div className="flex flex-1 items-center justify-center poppins text-[20px] font-medium">
                                        {quantity}
                                    </div>

                                    <button
                                        onClick={() => setQuantity((q) => q + 1)}
                                        className="h-full w-[40px] bg-[#F97316] hover:opacity-85 cursor-pointer text-[24px] text-white"
                                    >
                                        +
                                    </button>
                                </div>

                                {product.hasVariants && <label className="block text-sm">Product option<select value={variantId} onChange={e => setVariantId(e.target.value)} className="mb-4 mt-2 w-full rounded border p-3"><option value="">Select an option</option>{product.variants?.map(v => <option key={v.id} value={v.id} disabled={!v.stock}>{[v.colorName, v.size].filter(Boolean).join(" / ") || "Standard"} — ${v.price ?? product.basePrice}</option>)}</select></label>}
                                    <button onClick={buyNow} className="h-[44px] w-[165px] hover:opacity-85 cursor-pointer rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium text-white">
                                    Buy Now
                                </button>

                                <button
                                    onClick={() => toggleWishlist(product)}
                                    className="flex hover:opacity-85 cursor-pointer h-[44px] w-[40px] items-center justify-center rounded-[4px] border border-black/50"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill={isFavourite ? "#F97316" : "none"}
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke={isFavourite ? "#F97316" : "currentColor"}
                                        className="size-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="mt-[40px] h-[180px] w-full rounded-[4px] border border-black/50">
                                <div className="flex h-[90px] items-center gap-[16px] border-b border-black/50 px-[16px]">
                                    <span className="text-[28px]"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_261_4843)">
                                            <path d="M11.6673 31.6667C13.5083 31.6667 15.0007 30.1743 15.0007 28.3333C15.0007 26.4924 13.5083 25 11.6673 25C9.82637 25 8.33398 26.4924 8.33398 28.3333C8.33398 30.1743 9.82637 31.6667 11.6673 31.6667Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M28.3333 31.6667C30.1743 31.6667 31.6667 30.1743 31.6667 28.3333C31.6667 26.4924 30.1743 25 28.3333 25C26.4924 25 25 26.4924 25 28.3333C25 30.1743 26.4924 31.6667 28.3333 31.6667Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M8.33398 28.3335H7.00065C5.89608 28.3335 5.00065 27.4381 5.00065 26.3335V21.6668M3.33398 8.3335H19.6673C20.7719 8.3335 21.6673 9.22893 21.6673 10.3335V28.3335M15.0007 28.3335H25.0007M21.6673 10.0002H28.8683C29.5708 10.0002 30.2218 10.3688 30.5833 10.9712L35.0007 18.3335V26.3335C35.0007 27.4381 34.1052 28.3335 33.0007 28.3335H31.6673M35.0007 18.3335H21.6673" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M8 28H6.66667C5.5621 28 4.66667 27.1046 4.66667 26V21.3333M3 8H19.3333C20.4379 8 21.3333 8.89543 21.3333 10V28M15 28H24.6667M21.3333 9.66667H28.5343C29.2368 9.66667 29.8878 10.0353 30.2493 10.6377L34.6667 18V26C34.6667 27.1046 33.7712 28 32.6667 28H32M34.6667 18H21.3333" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M5 11.8182H11.6667" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M1.81836 15.4545H8.48503" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M5 19.0909H11.6667" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_261_4843">
                                                <rect width="40" height="40" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    </span>
                                    <div>
                                        <h3 className="poppins text-[16px] font-medium">Free Delivery</h3>
                                        <p className="mt-[8px] poppins text-[12px] underline">
                                            Enter your postal code for Delivery Availability
                                        </p>
                                    </div>
                                </div>

                                <div className="flex h-[90px] items-center gap-[16px] px-[16px]">
                                    <span className="text-[28px]"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_261_4865)">
                                            <path d="M33.3327 18.3334C32.9251 15.4004 31.5645 12.6828 29.4604 10.5992C27.3564 8.51557 24.6256 7.18155 21.6888 6.80261C18.752 6.42366 15.7721 7.02082 13.208 8.5021C10.644 9.98337 8.6381 12.2666 7.49935 15M6.66602 8.33335V15H13.3327" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M6.66602 21.6667C7.07361 24.5997 8.43423 27.3173 10.5383 29.4009C12.6423 31.4845 15.3731 32.8185 18.3099 33.1974C21.2467 33.5764 24.2266 32.9792 26.7907 31.4979C29.3547 30.0167 31.3606 27.7335 32.4994 25M33.3327 31.6667V25H26.666" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_261_4865">
                                                <rect width="40" height="40" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    </span>
                                    <div>
                                        <h3 className="poppins text-[16px] font-medium">Return Delivery</h3>
                                        <p className="mt-[8px] poppins text-[12px]">
                                            Free 30 Days Delivery Returns.{" "}
                                            <span className="underline">Details</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="mt-[80px] border-t pt-[40px]">
                    <h2 className="inter text-[28px] font-semibold">Reviews</h2>

                    <form onSubmit={submitReview} className="mt-6 rounded bg-[#F5F5F5] p-6">
                        <label className="block poppins text-[16px] font-medium">
                            Rating
                        </label>

                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="mt-2 h-[45px] rounded border px-4"
                        >
                            <option value={5}>★★★★★ 5</option>
                            <option value={4}>★★★★ 4</option>
                            <option value={3}>★★★ 3</option>
                            <option value={2}>★★ 2</option>
                            <option value={1}>★ 1</option>
                        </select>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write your review..."
                            className="mt-4 min-h-[120px] w-full rounded border p-4 outline-none"
                        />

                        <button className="mt-4 h-[48px] rounded bg-[#F97316] px-6 text-white">
                            Submit Review
                        </button>
                    </form>

                    <div className="mt-8 space-y-4">
                        {reviews.length === 0 ? (
                            <p className="text-black/50">No reviews yet.</p>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="rounded border p-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#FFAD33]">
                                            {"★".repeat(review.rating)}
                                            {"☆".repeat(5 - review.rating)}
                                        </span>

                                        <span className="text-sm text-black/50">
                                            {review.createdAt
                                                ? new Date(review.createdAt).toLocaleDateString()
                                                : ""}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold">
                                        {review.userName || "Customer"}
                                    </h4>

                                    {editingReviewId === review.id ? (
                                        <div className="mt-3">
                                            <select
                                                value={editRating}
                                                onChange={(e) => setEditRating(Number(e.target.value))}
                                                className="h-[40px] rounded border px-3"
                                            >
                                                <option value={5}>★★★★★ 5</option>
                                                <option value={4}>★★★★ 4</option>
                                                <option value={3}>★★★ 3</option>
                                                <option value={2}>★★ 2</option>
                                                <option value={1}>★ 1</option>
                                            </select>

                                            <textarea
                                                value={editComment}
                                                onChange={(e) => setEditComment(e.target.value)}
                                                className="mt-3 min-h-[100px] w-full rounded border p-3"
                                            />

                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => updateReview(review.id)}
                                                    className="rounded bg-[#F97316] px-4 py-2 text-white"
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setEditingReviewId(null)}
                                                    className="rounded border px-4 py-2"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-black/80">{review.comment}</p>
                                    )}
                                    {user?.id === review.userId &&
                                        editingReviewId !== review.id && (
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() => startEditReview(review)}
                                                    className="rounded bg-yellow-500 px-3 py-1 text-white"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => deleteReview(review.id)}
                                                    className="rounded bg-red-500 px-3 py-1 text-white"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                </div>
                            ))
                        )}
                    </div>

                </section>
            </main>
            <section className="w-full max-w-[1440px] mx-auto overflow-hidden bg-white py-20 border-b border-[#ECECEC]">
                <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
                    <div className="mb-[40px] flex items-end justify-between">
                        <div>
                            <div className="mb-[24px] flex items-center gap-[16px]">
                                <span className="h-[40px] w-[20px] rounded-[4px] bg-[#F97316]" />
                                <p className="poppins text-[16px] font-semibold leading-[20px] text-[#F97316]">
                                    Related Item
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-[30px] sm:grid-cols-2 lg:grid-cols-4">
                        {relatedProducts.map((item) => {
                            const isFavourite = wishlist.some((wish) => wish.id === item.id);
                            return (

                                <div
                                    key={item.id}
                                    className="w-full max-w-[270px]"
                                >
                                    <div className="group relative h-[250px] w-[270px] overflow-hidden rounded-[4px] bg-[#F5F5F5]">
                                        {item.discount && (

                                            <span className="absolute left-[12px] top-[12px] rounded-[4px] bg-[#F97316] px-[12px] py-[4px] poppins text-[12px] text-white">
                                                {item.discount}
                                            </span>
                                        )}

                                        <div className="absolute right-[12px] top-[12px] flex flex-col gap-[8px]">

                                            <button onClick={() => toggleWishlist(item)} className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white hover:opacity-85">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill={isFavourite ? "#F97316" : "none"}
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke={isFavourite ? "#F97316" : "currentColor"}
                                                    className="size-6"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                                    />
                                                </svg>
                                            </button>

                                            <Link href={`/product/${item.id}`} className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white hover:opacity-85">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /> </svg>
                                            </Link>

                                        </div>

                                        <div className="absolute left-[40px] top-[35px] flex h-[180px] w-[190px] items-center justify-center">
                                            <img
                                                src={item.images?.[0]?.imageUrl || "/images/Frame 611.png"}
                                                alt={item.name}
                                                className="h-[180px] w-[190px] object-contain"
                                            />
                                        </div>
                                        <button className="absolute bottom-0 left-0 h-[41px] w-full cursor-pointer  translate-y-full bg-black poppins text-[12px] font-medium text-white transition duration-300 group-hover:translate-y-0">
                                            Add To Cart
                                        </button>
                                    </div>

                                    <h3 className="mt-[16px] poppins text-[16px] font-medium leading-[24px] text-black">
                                        {item.name}
                                    </h3>

                                    <div className="mt-[8px] flex gap-[12px] poppins text-[16px] font-medium leading-[24px]">
                                        <span className="text-[#F97316]">${item.basePrice}</span>
                                        {item.oldPrice && (
                                            <span className="text-black/50 line-through">
                                                ${item.oldPrice}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-[8px] flex items-center gap-[8px]">
                                        <span className="text-[14px] text-[#FFAD33]">★★★★★</span>
                                        <span className="poppins text-[14px] font-semibold text-black/50">
                                            {item.reviews}
                                        </span>
                                    </div>
                                </div>
                            );

                        })}
                    </div>
                </div>

            </section >
        </>
    );
}