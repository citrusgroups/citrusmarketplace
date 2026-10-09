import { db } from "../../../../lib/db";
import { categories } from "../../../../db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(categories);
  return Response.json({ categories: data });
}

export async function POST(req) {
  try {
    const body = await req.json();

    await db.insert(categories).values({
      id: nanoid(),
      name: body.name,
      slug: body.slug,
      icon: body.icon || "",
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}