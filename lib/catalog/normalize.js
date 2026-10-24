import { createHash } from "node:crypto";
export const categoryIds = [
  "office-supplies",
  "paper-notebooks",
  "writing-instruments",
  "filing-organization",
  "desk-accessories",
  "office-furniture",
  "printer-supplies",
  "breakroom-cleaning",
];
export function normalizeItem(raw, supplier, autoPublish = false) {
  if (!raw.isOffice || typeof raw.name !== "string" || !raw.name.trim())
    return null;
  const price =
    typeof raw.price === "number" &&
    Number.isFinite(raw.price) &&
    raw.price > 0 &&
    raw.price <= 1000000
      ? Math.round(raw.price * 100) / 100
      : null;
  const currency = String(raw.currency || "").toUpperCase();
  const category = categoryIds.includes(raw.category)
    ? raw.category
    : "office-supplies";
  const sku = String(raw.sku || "")
    .trim()
    .slice(0, 160);
  const name = raw.name.trim().slice(0, 500);
  const key = createHash("sha256")
    .update(
      `${supplier.toLowerCase().trim()}|${(sku || name).toLowerCase().replace(/\s+/g, " ")}`,
    )
    .digest("hex");
  const issues = [];
  if (!price) issues.push("Price missing or invalid");
  if (currency !== "USD") issues.push("USD price needs confirmation");
  if (!raw.priceEvidence?.trim()) issues.push("Price evidence missing");
  if (!raw.imageUrl) issues.push("Product image needs review");
  return {
    name,
    description: String(raw.description || "").slice(0, 6000),
    sku,
    category,
    price,
    currency,
    imageUrl: raw.imageUrl || null,
    priceEvidence: raw.priceEvidence || "",
    catalogKey: key,
    issues,
    isPublished: Boolean(autoPublish && !issues.length),
    stock: 0,
  };
}
export function validatePublication(product, imageUrl) {
  if (
    !Number.isFinite(Number(product.basePrice)) ||
    Number(product.basePrice) <= 0
  )
    throw new Error("Set a valid selling price before publishing.");
  if (!categoryIds.includes(product.categoryId))
    throw new Error("Select an office category before publishing.");
  if (!imageUrl) throw new Error("Add a product image before publishing.");
}
