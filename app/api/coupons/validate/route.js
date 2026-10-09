import { db } from "../../../../lib/db";
import { coupons } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
    try {
        const { code } = await req.json();

        if (!code?.trim()) {
            return Response.json(
                { error: "Coupon code required" },
                { status: 400 }
            );
        }

        const normalizedCode = code.trim().toUpperCase();

        const rows = await db
            .select()
            .from(coupons)
            .where(eq(coupons.code, normalizedCode));

        const coupon = rows[0];

        if (!coupon) {
            return Response.json(
                { error: "Invalid coupon" },
                { status: 400 }
            );
        }

        if (!coupon.isActive) {
            return Response.json(
                { error: "Coupon inactive" },
                { status: 400 }
            );
        }

        if ((coupon.endAt && new Date(coupon.endAt) < new Date()) || (coupon.startAt && new Date(coupon.startAt) > new Date())) {
            return Response.json(
                { error: "Coupon expired" },
                { status: 400 }
            );
        }

        return Response.json({
            success: true,
            discountPercent: coupon.discountPercent,
        });
    } catch (error) {
        console.log("COUPON_VALIDATE_ERROR:", error);

        return Response.json(
            { error: "Failed to validate coupon" },
            { status: 500 }
        );
    }
}