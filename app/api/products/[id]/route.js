import { db } from "../../../../lib/db";
import {
  products,
  productImages,
  productReviews,
  productVariants,
  categories,
} from "../../../../db/schema";
import { eq, ne, and, inArray } from "drizzle-orm";

import { officeCategoryIds } from "@/lib/office-categories";

export async function GET(req, context) {
  try {
    const { id } = await context.params;

    const productRows = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.isPublished, true)));

    const officeCats = await db
      .select()
      .from(categories)
      .where(inArray(categories.slug, officeCategoryIds));
    const allowed = officeCats.flatMap((c) => [c.id, c.slug]);
    const product = productRows.find((p) => allowed.includes(p.categoryId));
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
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id));
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id));

    const relatedProductsRaw = await db
      .select()
      .from(products)
      .where(
        and(
          ne(products.id, id),
          eq(products.isPublished, true),
          inArray(products.categoryId, allowed),
        ),
      )
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
      }),
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
      { status: 500 },
    );
  }
}
