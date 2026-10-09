import { db } from "../../../../../lib/db";
import { orders, orderItems } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(req, context) {
    try {
        const { id } = await context.params;
        const orderRows = await db
            .select()
            .from(orders)
            .where(eq(orders.id, id));
        const order = orderRows[0];
        if (!order) {
            return Response.json({ error: "Order not found" }, { status: 404 });
        }
        const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, id));
        return Response.json({
            order,
            items,
        });
    } catch (error) {
        console.log("ADMIN_ORDER_DETAIL_ERROR:", error);
        return Response.json(
            { error: error.message || "Failed to fetch order" },
            { status: 500 }
        );
    }
}

export async function PATCH(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        await db
            .update(orders)
            .set({
                status: body.status,
            })
            .where(eq(orders.id, id));
        return Response.json({ success: true });
    } catch (error) {
        console.log("ADMIN_ORDER_STATUS_ERROR:", error);
        return Response.json(
            { error: error.message || "Failed to update order" },
            { status: 500 }
        );
    }
}