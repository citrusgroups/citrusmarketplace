import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { products, productImages, categories } from "../../db/schema.js";
import { normalizeItem } from "./normalize.js";
export async function persistProducts(tx, job, part, extracted) {
  let added = 0,
    duplicates = 0,
    review = 0;
  for (const raw of extracted.products) {
    if (part.type === "text" && raw.priceEvidence) {
      const clean = (value) => String(value).replace(/\s+/g, " ").trim();
      const quoted = clean(raw.priceEvidence);
      const amounts = Array.from(
        quoted.matchAll(/\d[\d,]*(?:\.\d{1,2})?/g),
        (m) => Number(m[0].replaceAll(",", "")),
      );
      if (
        !clean(part.text).includes(quoted) ||
        !amounts.some((amount) => Math.abs(amount - raw.price) < 0.005)
      )
        raw.priceEvidence = null;
    }
    // Only image URLs already present in a fetched text source are accepted.
    if (!job.imageCandidates?.includes(raw.imageUrl)) raw.imageUrl = null;
    const p = normalizeItem(raw, job.supplier, job.autoPublish);
    if (!p) continue;
    const [category] = await tx
      .select()
      .from(categories)
      .where(eq(categories.slug, p.category))
      .limit(1);
    if (!category)
      throw new Error("Office categories are missing. Run the SQL migration.");
    const id = randomUUID();
    const rows = await tx
      .insert(products)
      .values({
        id,
        name: p.name,
        description: p.description,
        basePrice: p.price || 0,
        categoryId: category.slug,
        stock: 0,
        isPublished: p.isPublished,
        catalogKey: p.catalogKey,
        catalogSku: p.sku,
        catalogSource: job.supplier,
        catalogPage: part.page || null,
        catalogCurrency: p.currency,
        catalogNotes: [
          ...p.issues,
          p.priceEvidence ? `Source price: ${p.priceEvidence}` : "",
          extracted.notes,
        ]
          .filter(Boolean)
          .join("; "),
      })
      .onConflictDoNothing({ target: products.catalogKey })
      .returning({ id: products.id });
    if (!rows.length) {
      duplicates++;
      continue;
    }
    if (p.imageUrl)
      await tx.insert(productImages).values({
        id: randomUUID(),
        productId: id,
        imageUrl: p.imageUrl,
        isPrimary: true,
      });
    added++;
    if (!p.isPublished) review++;
  }
  return { added, duplicates, review };
}
