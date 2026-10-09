import { db } from "../../../../lib/db";
import { products, productImages, productReviews, productVariants } from "../../../../db/schema";
import { eq, ne } from "drizzle-orm";

export async function GET(req, context) {
    try {
        const { id } = await context.params;

        const productRows = await db
            .select()
            .from(products)
            .where(eq(products.id, id));

        const product = productRows[0];
        const reviews = await db
            .select()
            .from(productReviews)
            .where(eq(productReviews.productId, id));
        const totalReviews = reviews.length;

        const averageRating =
            totalReviews === 0
                ? 0
                : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
        if (!product) {
            return Response.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const variants = await db.select().from(productVariants).where(eq(productVariants.productId, id));
        const images = await db
            .select()
            .from(productImages)
            .where(eq(productImages.productId, id));

        const relatedProductsRaw = await db
            .select()
            .from(products)
            .where(ne(products.id, id))
            .limit(4);

        const relatedProducts = await Promise.all(
            relatedProductsRaw.map(async (product) => {
                const images = await db
                    .select()
                    .from(productImages)
                    .where(eq(productImages.productId, product.id));

                return {
                    ...product,
                    images,
                };
            })
        );

        return Response.json({
            product: {
                ...product,
                images,
                variants,
            },
            relatedProducts,
            averageRating,
            totalReviews,
        });
    } catch (error) {
        console.log("PRODUCT_DETAIL_ERROR:", error);

        return Response.json(
            { error: error.message || "Failed to fetch product" },
            { status: 500 }
        );
    }
}