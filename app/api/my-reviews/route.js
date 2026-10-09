import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../lib/db";
import { productReviews, products } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const reviews = await db
        .select({
            id: productReviews.id,
            rating: productReviews.rating,
            comment: productReviews.comment,
            createdAt: productReviews.createdAt,

            productName: products.name,
        })
        .from(productReviews)
        .leftJoin(
            products,
            eq(productReviews.productId, products.id)
        )
        .where(eq(productReviews.userId, session.user.id));

    return Response.json({ reviews });
}