import { db } from "../../../../../lib/db";
import { categories, products } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req, context) {
  try {
    const { id } = await context.params;

    const categoryRows = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    const category = categoryRows[0];

    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    const usedProducts = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, category.slug));

    if (usedProducts.length > 0) {
      return Response.json(
        { error: "Is category ke products mojood hain. Pehle products ki category change/delete karo." },
        { status: 400 }
      );
    }

    await db.delete(categories).where(eq(categories.id, id));

    return Response.json({ success: true });
  } catch (error) {
    console.log("DELETE_CATEGORY_ERROR:", error);
    return Response.json(
      { error: error.message || "Category delete failed" },
      { status: 500 }
    );
  }
}