import { eq } from "drizzle-orm";
import { db } from "../../../lib/db";
import { coupons } from ".//../../../db/schema";
import { nanoid } from "nanoid";

export async function GET() {
  const data = await db.select().from(coupons);
  return Response.json(data);
}

export async function POST(req) {
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
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    await db.delete(coupons).where(eq(coupons.id, id));

    return Response.json({ success: true });
  } catch (error) {
    console.log("DELETE_COUPON_ERROR:", error);

    return Response.json(
      { error: "Coupon delete nahi hua" },
      { status: 500 }
    );
  }
}