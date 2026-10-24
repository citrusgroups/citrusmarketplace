import { withAdmin } from "@/lib/admin-access";
import { db } from "../../../../lib/db";
import { categories } from "../../../../db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

async function GETHandler() {
  const data = await db.select().from(categories);
  return Response.json({ categories: data });
}

async function POSTHandler(req) {
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
export const GET = withAdmin(GETHandler);
export const POST = withAdmin(POSTHandler);
