import { db } from "../../../../../lib/db";
import { products, productImages, productVariants } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(req, context) {
    try {
        const { id } = await context.params;

        const productRows = await db.select().from(products).where(eq(products.id, id));
        const product = productRows[0];

        if (!product) {
            return Response.json({ error: "Product not found" }, { status: 404 });
        }

        const images = await db.select().from(productImages).where(eq(productImages.productId, id));
        const variants = await db.select().from(productVariants).where(eq(productVariants.productId, id));

        return Response.json({ product: { ...product, images, variants } });
    } catch (error) {
        return Response.json({ error: error.message || "Failed" }, { status: 500 });
    }
}

export async function PUT(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        await db.update(products).set({
            name: body.name,
            description: body.description || "",
            basePrice: Number(body.price || 0),
            oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
            discountPercent: body.discountPercent ? Number(body.discountPercent) : null,
            categoryId: body.category || "",
            stock: body.hasVariants ? 0 : Number(body.stock || 0),
            hasVariants: Boolean(body.hasVariants),
            badge: body.badge || null,
            isFlashSale: Boolean(body.isFlashSale),
            isBestSelling: Boolean(body.isBestSelling),
            isFeatured: Boolean(body.isFeatured),
        }).where(eq(products.id, id));

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message || "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    try {
        const { id } = await context.params;

        await db.delete(products).where(eq(products.id, id));

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message || "Delete failed" }, { status: 500 });
    }
}