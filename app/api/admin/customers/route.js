import { db } from "../../../../lib/db";
import { orders } from "../../../../db/schema";

export async function GET() {
    try {
        const ordersData = await db.select().from(orders);

        const customers = Object.values(
            ordersData.reduce((acc, order) => {
                const key = order.email || order.userId;

                if (!acc[key]) {
                    acc[key] = {
                        userId: order.userId,
                        name: order.firstName || "Customer",
                        email: order.email || "",
                        phone: order.phone || "",
                        totalOrders: 0,
                        totalSpent: 0,
                        lastOrderDate: order.createdAt,
                    };
                }

                acc[key].totalOrders += 1;

                if (order.status !== "cancelled") {
                    acc[key].totalSpent += Number(order.totalPrice || 0);
                }

                if (new Date(order.createdAt) > new Date(acc[key].lastOrderDate)) {
                    acc[key].lastOrderDate = order.createdAt;
                }

                return acc;
            }, {})
        );

        return Response.json({ customers });
    } catch (error) {
        return Response.json(
            { error: error.message || "Customers fetch failed" },
            { status: 500 }
        );
    }
}