import { db } from "../../../lib/db";
import { products, productImages, productVariants } from "../../../db/schema";
import { nanoid } from "nanoid";
import { eq, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-access";
import { officeCategoryIds } from "@/lib/office-categories";
import { categories } from "@/db/schema";
import { productReviews } from "../../../db/schema";
export async function POST(req) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    if (!officeCategoryIds.includes(body.category))
      return Response.json(
        { error: "Choose an office product category." },
        { status: 400 },
      );
    const productId = nanoid();

    await db.insert(products).values({
      id: productId,
      isPublished: body.isPublished !== false,
      name: body.name,
      description: body.description || "",
      basePrice: Number(body.price),
      oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
      discountPercent: body.discountPercent
        ? Number(body.discountPercent)
        : null,
      categoryId: body.category || "",
      ratingCount: 0,
      stock: body.hasVariants ? 0 : Number(body.stock || 0),
      hasVariants: Boolean(body.hasVariants),
      badge: body.badge || null,
      isFlashSale: Boolean(body.isFlashSale),
      isBestSelling: Boolean(body.isBestSelling),
      isFeatured: Boolean(body.isFeatured),
    });

    if (!body.hasVariants) {
      for (const [index, img] of (body.images || []).entries()) {
        await db.insert(productImages).values({
          id: nanoid(),
          productId,
          variantId: null,
          imageUrl: img,
          color: null,
          isPrimary: index === 0,
        });
      }
    }

    if (body.hasVariants) {
      for (const variant of body.variants || []) {
        const variantId = nanoid();

        await db.insert(productVariants).values({
          id: variantId,
          productId,
          colorName: variant.colorName || "",
          color: variant.colorCode || "",
          size: null,
          price: variant.price ? Number(variant.price) : Number(body.price),
          stock: Number(variant.stock || 0),
        });

        for (const [index, img] of (variant.images || []).entries()) {
          await db.insert(productImages).values({
            id: nanoid(),
            productId,
            variantId,
            imageUrl: img,
            color: variant.colorCode || "",
            isPrimary: index === 0,
          });
        }
      }
    }

    return Response.json({
      success: true,
      productId,
    });
  } catch (error) {
    console.log("ADD_PRODUCT_ERROR:", error);

    return Response.json(
      { error: error.message || "Product save nahi hua" },
      { status: error.status || 500 },
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase()?.trim();

    let productsData = await db
      .select()
      .from(products)
      .where(eq(products.isPublished, true));
    const officeCats = await db
      .select()
      .from(categories)
      .where(inArray(categories.slug, officeCategoryIds));
    const lookup = new Map(
      officeCats.flatMap((c) => [
        [c.id, c],
        [c.slug, c],
      ]),
    );
    productsData = productsData
      .filter((p) => lookup.has(p.categoryId))
      .map((p) => ({
        ...p,
        categorySlug: lookup.get(p.categoryId).slug,
        categoryName: lookup.get(p.categoryId).name,
      }));

    if (search) {
      productsData = productsData.filter(
        (product) =>
          product.name?.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search) ||
          product.categoryId?.toLowerCase().includes(search),
      );
    }

    const imagesData = await db.select().from(productImages);
    const variantsData = await db.select().from(productVariants);
    const reviewsData = await db.select().from(productReviews);

    const formatted = productsData.map((product) => {
      const productReviewsData = reviewsData.filter(
        (review) => review.productId === product.id,
      );

      const totalReviews = productReviewsData.length;

      const averageRating =
        totalReviews === 0
          ? 0
          : productReviewsData.reduce(
              (sum, review) => sum + Number(review.rating || 0),
              0,
            ) / totalReviews;

      return {
        ...product,
        images: imagesData.filter((img) => img.productId === product.id),
        variants: variantsData
          .filter((variant) => variant.productId === product.id)
          .map((variant) => ({
            ...variant,
            images: imagesData.filter((img) => img.variantId === variant.id),
          })),
        totalReviews,
        averageRating,
      };
    });

    return Response.json(formatted);
  } catch (error) {
    console.log("GET_PRODUCTS_ERROR:", error);

    return Response.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 },
    );
  }
}
