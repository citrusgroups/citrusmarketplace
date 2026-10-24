import { withAdmin } from "@/lib/admin-access";
import { eq } from "drizzle-orm";
import { db } from "../../../lib/db";
import { coupons } from ".//../../../db/schema";
import { nanoid } from "nanoid";

async function GETHandler() {
  const data = await db.select().from(coupons);
  return Response.json(data);
}

async function POSTHandler(req) {
  try {
    const body = await req.json();

    await db.insert(coupons).values({
      id: nanoid(),
      code: body.code.trim().toUpperCase(),
      discountPercent: Number(body.discountPercent),
      isActive: body.isActive ?? true,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.log("ADD_COUPON_ERROR:", error);
    return Response.json({ error: "Coupon add nahi hua" }, { status: 500 });
  }
}
async function DELETEHandler(req) {
  try {
    const { id } = await req.json();

    await db.delete(coupons).where(eq(coupons.id, id));

    return Response.json({ success: true });
  } catch (error) {
    console.log("DELETE_COUPON_ERROR:", error);

    return Response.json({ error: "Coupon delete nahi hua" }, { status: 500 });
  }
}
export const GET = withAdmin(GETHandler);
export const POST = withAdmin(POSTHandler);
export const DELETE = withAdmin(DELETEHandler);
