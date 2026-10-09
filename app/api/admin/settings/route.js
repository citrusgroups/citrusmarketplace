import { db } from "../../../../lib/db";
import { siteSettings } from "../../../../db/schema";
import { eq } from "drizzle-orm";

const SETTINGS_ID = "main";

export async function GET() {
    try {
        const rows = await db.select().from(siteSettings);
        const setting = rows[0];

        if (!setting) {
            await db.insert(siteSettings).values({
                id: SETTINGS_ID,
                flashSaleEnabled: false,
                flashSaleDiscountPercent: 0,
                flashSaleStartTime: null,
                flashSaleEndTime: null,
            });

            return Response.json({
                id: SETTINGS_ID,
                flashSaleEnabled: false,
                flashSaleDiscountPercent: 0,
                flashSaleStartTime: null,
                flashSaleEndTime: null,
            });
        }

        return Response.json(setting);
    } catch (error) {
        return Response.json(
            { error: error.message || "Settings fetch failed" },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();

        const rows = await db.select().from(siteSettings);
        const exists = rows[0];

        const values = {
            flashSaleEnabled: Boolean(body.flashSaleEnabled),
            flashSaleDiscountPercent: Number(body.flashSaleDiscountPercent || 0),
            flashSaleStartTime: body.flashSaleStartTime
                ? new Date(body.flashSaleStartTime)
                : null,
            flashSaleEndTime: body.flashSaleEndTime
                ? new Date(body.flashSaleEndTime)
                : null,
        };

        if (!exists) {
            await db.insert(siteSettings).values({
                id: SETTINGS_ID,
                ...values,
            });
        } else {
            await db
                .update(siteSettings)
                .set(values)
                .where(eq(siteSettings.id, exists.id));
        }

        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: error.message || "Settings update failed" },
            { status: 500 }
        );
    }
}