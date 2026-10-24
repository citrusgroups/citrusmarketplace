import { randomUUID } from "node:crypto";
import { validatePublication } from "@/lib/catalog/normalize";
import { requireAdmin } from "@/lib/admin-access";
import { db } from "../../../../../lib/db";
import {
  products,
  productImages,
  productVariants,
} from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(req, context) {
  try {
    await requireAdmin(req);
    const { id } = await context.params;

    const productRows = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    const product = productRows[0];

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id));
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id));

    return Response.json({ product: { ...product, images, variants } });
  } catch (error) {
    return Response.json(
      { error: error.message || "Failed" },
      { status: error.status || 500 },
    );
  }
}

export async function PUT(req, context) {
  try {
    await requireAdmin(req);
    const { id } = await context.params;
    const body = await req.json();

    const price = Number(body.price || 0),
      stock = Number(body.stock || 0);
    if (
      !body.name?.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    )
      return Response.json(
        {
          error:
            "Enter a product name, valid price and non-negative whole stock quantity.",
        },
        { status: 400 },
      );
    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(products)
        .where(eq(products.id, id));
      if (!existing)
        throw Object.assign(new Error("Product not found."), { status: 404 });
      const published = body.isPublished ?? existing.isPublished;
      const [existingImage] = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, id))
        .limit(1);
      const imageUrl = body.imageUrl?.trim() || existingImage?.imageUrl;
      if (imageUrl && !imageUrl.startsWith("/images/")) {
        try {
          const url = new URL(imageUrl);
          if (!["http:", "https:"].includes(url.protocol)) throw new Error();
        } catch {
          throw Object.assign(new Error("Enter a valid image URL."), {
            status: 400,
          });
        }
      }
      if (published) {
        try {
          validatePublication(
            { basePrice: price, categoryId: body.category },
            imageUrl,
          );
        } catch (e) {
          throw Object.assign(e, { status: 400 });
        }
      }
      await tx
        .update(products)
        .set({
          name: body.name.trim(),
          description: body.description || "",
          basePrice: price,
          oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
          discountPercent: body.discountPercent
            ? Number(body.discountPercent)
            : null,
          categoryId: body.category || "",
          stock: body.hasVariants ? 0 : stock,
          hasVariants: Boolean(body.hasVariants),
          badge: body.badge || null,
          isFlashSale: Boolean(body.isFlashSale),
          isBestSelling: Boolean(body.isBestSelling),
          isFeatured: Boolean(body.isFeatured),
          isPublished: published,
          ...(published && existing.catalogKey
            ? { catalogCurrency: "USD" }
            : {}),
        })
        .where(eq(products.id, id));
      if (
        body.imageUrl?.trim() &&
        body.imageUrl.trim() !== existingImage?.imageUrl
      ) {
        if (existingImage)
          await tx
            .update(productImages)
            .set({ imageUrl: body.imageUrl.trim() })
            .where(eq(productImages.id, existingImage.id));
        else
          await tx
            .insert(productImages)
            .values({
              id: randomUUID(),
              productId: id,
              imageUrl: body.imageUrl.trim(),
              isPrimary: true,
            });
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error.message || "Update failed" },
      { status: error.status || 500 },
    );
  }
}

export async function DELETE(req, context) {
  try {
    await requireAdmin(req);
    const { id } = await context.params;

    await db.delete(products).where(eq(products.id, id));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error.message || "Delete failed" },
      { status: error.status || 500 },
    );
  }
}
