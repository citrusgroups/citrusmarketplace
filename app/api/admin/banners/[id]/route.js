import { db } from "../../../../../lib/db";
import { heroBanners } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        await db
            .update(heroBanners)
            .set({
                title: body.title,
                heading: body.heading,
                buttonText: body.buttonText,
                buttonLink: body.buttonLink,
                image: body.image,
                sortOrder: Number(body.sortOrder || 0),
                isActive: Boolean(body.isActive),
            })
            .where(eq(heroBanners.id, id));

        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: error.message || "Banner update failed" },
            { status: 500 }
        );
    }
}

export async function DELETE(req, context) {
    try {
        const { id } = await context.params;

        await db.delete(heroBanners).where(eq(heroBanners.id, id));

        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: error.message || "Banner delete failed" },
            { status: 500 }
        );
    }
}