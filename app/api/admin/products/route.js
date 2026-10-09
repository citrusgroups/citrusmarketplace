import { db } from "../../../../lib/db";
import { products, productImages } from "../../../../db/schema";

export async function GET() {
    try {
        const productsData = await db.select().from(products);
        const imagesData = await db.select().from(productImages);

        const formatted = productsData.map((product) => ({
            ...product,
            image:
                imagesData.find(
                    (img) => img.productId === product.id && img.isPrimary
                )?.imageUrl ||
                imagesData.find((img) => img.productId === product.id)?.imageUrl,
        }));

        return Response.json(formatted);
    } catch (error) {
        console.log("ADMIN_PRODUCTS_ERROR:", error);

        return Response.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}