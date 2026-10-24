import { officeCategories } from "@/lib/office-categories";
export async function GET() {
  return Response.json({
    categories: officeCategories.map((c) => ({
      ...c,
      icon: "/images/office-product-fallback.svg",
    })),
  });
}
