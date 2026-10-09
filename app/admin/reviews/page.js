"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const getReviews = async () => {
        const res = await fetch("/api/reviews");
        const data = await res.json();

        if (res.ok) setReviews(data.reviews || []);
    };
    useEffect(() => {
        getReviews();
    }, []);
    const deleteReview = async (id) => {
        if (!confirm("Delete this review?")) return;
        const res = await fetch(`/api/admin/reviews/${id}`, {
            method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
            toast.error(data.error || "Delete failed");
            return;
        }
        toast.success("Review deleted");
        getReviews();
    };
    return (
        <section>
            <h1 className="inter text-[32px] font-semibold">Reviews</h1>
            <div className="mt-8 overflow-x-auto rounded bg-white p-6 shadow">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="pb-3">Product ID</th>
                            <th className="pb-3">User ID</th>
                            <th className="pb-3">Rating</th>
                            <th className="pb-3">Comment</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review.id} className="border-b">
                                <td className="py-4">{review.productId}</td>
                                <td className="py-4">{review.userId}</td>
                                <td className="py-4 text-[#FFAD33]">
                                    {"★".repeat(review.rating)}
                                </td>
                                <td className="py-4">{review.comment}</td>
                                <td className="py-4">
                                    {review.createdAt
                                        ? new Date(review.createdAt).toLocaleDateString()
                                        : "-"}
                                </td>
                                <td className="py-4">
                                    <button
                                        onClick={() => deleteReview(review.id)}
                                        className="rounded bg-red-500 px-3 py-2 text-white"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}