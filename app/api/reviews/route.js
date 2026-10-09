import { db } from "../../../lib/db";
import { productReviews } from "../../../db/schema";
import { nanoid } from "nanoid";
import { eq, desc,and } from "drizzle-orm";
import { user } from "../../../auth-schema";
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        let query = db
            .select({
                id: productReviews.id,
                productId: productReviews.productId,
                userId: productReviews.userId,
                rating: productReviews.rating,
                comment: productReviews.comment,
                createdAt: productReviews.createdAt,
                userName: user.name,
                userEmail: user.email,
            })
            .from(productReviews)
            .leftJoin(user, eq(productReviews.userId, user.id))
            .orderBy(desc(productReviews.createdAt));

        if (productId) {
            query = query.where(eq(productReviews.productId, productId));
        }

        const reviews = await query;

        return Response.json({ reviews });
    } catch (error) {
        return Response.json(
            { error: error.message || "Reviews fetch failed" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        const existingReview = await db
            .select()
            .from(productReviews)
            .where(
                and(
                    eq(productReviews.productId, body.productId),
                    eq(productReviews.userId, body.userId)
                )
            );

        if (existingReview.length > 0) {
            return Response.json(
                { error: "You have already reviewed this product." },
                { status: 400 }
            );
        }

        await db.insert(productReviews).values({
            id: nanoid(),
            productId: body.productId,
            userId: body.userId,
            rating: Number(body.rating),
            comment: body.comment || "",
        });

        return Response.json({ success: true });
    } catch (error) {
        console.log("ADD_REVIEW_ERROR:", error);

        return Response.json(
            { error: error.message || "Review add failed" },
            { status: 500 }
        );
    }
}