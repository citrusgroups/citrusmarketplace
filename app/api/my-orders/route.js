import { db } from "../../../lib/db";
import { orders } from "../../../db/schema";
import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function GET(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const data = await db
      .select()
      .from(orders)
      .where(
        status
          ? and(eq(orders.userId, session.user.id), eq(orders.status, status))
          : eq(orders.userId, session.user.id)
      );

    return Response.json({ orders: data });
  } catch (error) {
    console.log("MY_ORDERS_ERROR:", error);

    return Response.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}