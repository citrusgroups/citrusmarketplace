import { db } from "../../../../lib/db";
import { orders, orderItems } from "../../../../db/schema";
import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function GET(req, context) {
    try {
        const { id } = await context.params;

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orderRows = await db
            .select()
            .from(orders)
            .where(
                and(
                    eq(orders.id, id),
                    eq(orders.userId, session.user.id)
                )
            );

        const order = orderRows[0];

        if (!order) {
            return Response.json({ error: "Order not found" }, { status: 404 });
        }

        const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));

        return Response.json({ order, items });
    } catch (error) {
        console.log("ORDER_DETAIL_ERROR:", error);

        return Response.json(
            { error: error.message || "Failed to fetch order detail" },
            { status: 500 }
        );
    }
}