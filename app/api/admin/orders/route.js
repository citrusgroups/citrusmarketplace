import { db } from "../../../../lib/db";
import { orders } from "../../../../db/schema";

export async function GET() {
    try {
        const data = await db.select().from(orders);

        return Response.json({ orders: data });
    } catch (error) {
        return Response.json(
            { error: error.message || "Failed to fetch orders" },
            { status: 500 }
        );
    }
}