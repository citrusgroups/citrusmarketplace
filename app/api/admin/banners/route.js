import { db } from "../../../../lib/db";
import { heroBanners } from "../../../../db/schema";
import { nanoid } from "nanoid";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const banners = await db
            .select()
            .from(heroBanners)
            .orderBy(desc(heroBanners.createdAt));

        return Response.json({ banners });
    } catch (error) {
        return Response.json(
            { error: error.message || "Banners fetch failed" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        if (!body.title || !body.heading || !body.image) {
            return Response.json(
                { error: "Title, heading and image required" },
                { status: 400 }
            );
        }

        await db.insert(heroBanners).values({
            id: nanoid(),
            title: body.title,
            heading: body.heading,
            buttonText: body.buttonText || "Shop Now",
            buttonLink: body.buttonLink || "/",
            image: body.image,
            sortOrder: Number(body.sortOrder || 0),
            isActive: Boolean(body.isActive),
        });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: error.message || "Banner add failed" },
            { status: 500 }
        );
    }
}