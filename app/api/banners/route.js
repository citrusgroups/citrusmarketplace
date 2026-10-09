import { db } from "../../../lib/db";
import { heroBanners } from "../../../db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
    try {
        const banners = await db
            .select()
            .from(heroBanners)
            .where(eq(heroBanners.isActive, true))
            .orderBy(asc(heroBanners.sortOrder));

        return Response.json({ banners });
    } catch (error) {
        return Response.json(
            { error: error.message || "Banners fetch failed" },
            { status: 500 }
        );
    }
}