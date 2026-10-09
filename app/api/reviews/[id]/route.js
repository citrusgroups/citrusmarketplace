import { db } from "../../../../lib/db";
import { productReviews } from "../../../../db/schema";
import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function DELETE(req, context) {
    try {
        const { id } = await context.params;
        await db
            .delete(productReviews)
            .where(eq(productReviews.id, id));
        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: error.message || "Review delete failed" },
            { status: 500 }
        );
    }
}



export async function PUT(req, context) {
    try {
        const { id } = await context.params;

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        await db
            .update(productReviews)
            .set({
                rating: Number(body.rating),
                comment: body.comment || "",
            })
            .where(
                and(
                    eq(productReviews.id, id),
                    eq(productReviews.userId, session.user.id)
                )
            );

        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: error.message || "Review update failed" },
            { status: 500 }
        );
    }
}

