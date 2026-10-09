"use client";

import { useEffect, useState } from "react";

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const getReviews = async () => {
            const res = await fetch("/api/my-reviews");
            const data = await res.json();

            if (res.ok) {
                setReviews(data.reviews || []);
            }
        };

        getReviews();
    }, []);

    return (
        <section>
            <h1 className="text-[32px] font-semibold">
                My Reviews
            </h1>

            <div className="mt-8 space-y-4">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="rounded border p-5"
                    >
                        <h3 className="font-semibold">
                            {review.productName}
                        </h3>

                        <p className="text-[#FFAD33]">
                            {"★".repeat(review.rating)}
                        </p>

                        <p className="mt-2">
                            {review.comment}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}