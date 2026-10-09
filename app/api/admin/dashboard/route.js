import { db } from "../../../../lib/db";
import { products, orders, orderItems } from "../../../../db/schema";

export async function GET() {
    try {
        const productsData = await db.select().from(products);
        const ordersData = await db.select().from(orders);
        const orderItemsData = await db.select().from(orderItems);

        const topSellingProducts = Object.values(
            orderItemsData.reduce((acc, item) => {
                if (!acc[item.productId]) {
                    acc[item.productId] = {
                        productId: item.productId,
                        productName: item.productName,
                        image: item.image,
                        totalSold: 0,
                        totalRevenue: 0,
                    };
                }

                acc[item.productId].totalSold += Number(item.quantity || 0);
                acc[item.productId].totalRevenue +=
                    Number(item.price || 0) * Number(item.quantity || 0);

                return acc;
            }, {})
        )
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 5);
        const totalRevenue = ordersData
            .filter((order) => order.status !== "cancelled")
            .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

        const recentOrders = [...ordersData]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )
            .slice(0, 5);
        const lowStockProducts = productsData
            .filter((product) => Number(product.stock || 0) <= 5)
            .slice(0, 5);
        return Response.json({
            totalProducts: productsData.length,
            totalOrders: ordersData.length,
            pendingOrders: ordersData.filter((o) => o.status === "pending").length,
            cancelledOrders: ordersData.filter((o) => o.status === "cancelled").length,
            deliveredOrders: ordersData.filter((o) => o.status === "delivered").length,
            totalRevenue,
            recentOrders,
            lowStockProducts,
            topSellingProducts,
        });
    } catch (error) {
        return Response.json(
            { error: error.message || "Dashboard data failed" },
            { status: 500 }
        );
    }
}