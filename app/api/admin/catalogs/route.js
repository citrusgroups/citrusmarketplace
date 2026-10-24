import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { catalogImportJobs, catalogImportBatches } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { requireAdmin, apiError, badRequest } from "@/lib/admin-access";
import { readRemote, prepareSource } from "@/lib/catalog/source";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function GET(req) {
  try {
    await requireAdmin(req);
    const jobs = await db
      .select({
        id: catalogImportJobs.id,
        sourceName: catalogImportJobs.sourceName,
        supplier: catalogImportJobs.supplier,
        status: catalogImportJobs.status,
        totalBatches: catalogImportJobs.totalBatches,
        processedBatches: catalogImportJobs.processedBatches,
        productsAdded: catalogImportJobs.productsAdded,
        duplicatesSkipped: catalogImportJobs.duplicatesSkipped,
        needsReview: catalogImportJobs.needsReview,
        error: catalogImportJobs.error,
        createdAt: catalogImportJobs.createdAt,
      })
      .from(catalogImportJobs)
      .orderBy(desc(catalogImportJobs.createdAt))
      .limit(25);
    return Response.json({ jobs });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(req) {
  try {
    const user = await requireAdmin(req);
    if (Number(req.headers.get("content-length") || 0) > 4.2 * 1024 * 1024)
      throw badRequest(
        "Upload limit is 4 MB. For a larger catalog, use a direct download link (up to 20 MB).",
        413,
      );
    const form = await req.formData();
    const file = form.get("file"),
      url = String(form.get("url") || "").trim();
    const supplier = String(form.get("supplier") || "")
      .trim()
      .slice(0, 180);
    if (!supplier)
      throw badRequest(
        "Enter the supplier or catalog owner name for duplicate matching.",
      );
    if (!url && !file?.size)
      throw badRequest("Choose a catalog file or enter its URL.");
    // Serialize catalog creation on a database advisory lock: prevents parallel creates bypassing limits.
    let prepared, name;
    try {
      if (url) {
        prepared = await readRemote(url);
        name =
          new URL(prepared.sourceUrl).pathname.split("/").pop() ||
          "Web catalog";
      } else {
        if (file.size > 4 * 1024 * 1024)
          throw new Error(
            "File limit is 4 MB. Use a direct URL for larger files (up to 20 MB).",
          );
        name = file.name;
        prepared = await prepareSource({
          bytes: Buffer.from(await file.arrayBuffer()),
          mime: file.type,
          name,
        });
      }
    } catch (e) {
      throw badRequest(e.message);
    }
    if (!prepared.parts.length)
      return Response.json({
        links: prepared.links,
        message: prepared.message,
      });
    if (!(
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    ))
      throw badRequest(
        "Add GEMINI_API_KEY to the server environment before starting an import.",
        503,
      );
    const id = randomUUID();
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext('citrus-catalog-create'))`,
      );
      const [active] = await tx.execute(
        sql`select count(*)::int as count from catalog_import_jobs where status in ('ready','running')`,
      );
      if (active.count >= 5)
        throw badRequest(
          "Finish or cancel an existing import first. A maximum of five imports may be active.",
          409,
        );
      await tx.insert(catalogImportJobs).values({
        id,
        userId: user.id,
        supplier,
        sourceName: name,
        sourceUrl: prepared.sourceUrl || null,
        autoPublish: form.get("autoPublish") === "true",
        totalBatches: prepared.parts.length,
        imageCandidates: prepared.imageCandidates,
      });
      for (let i = 0; i < prepared.parts.length; i++)
        await tx.insert(catalogImportBatches).values({
          id: randomUUID(),
          jobId: id,
          position: i,
          payload: prepared.parts[i],
        });
    });
    return Response.json({
      id,
      message: `Catalog saved. ${prepared.parts.length} segments are ready to process.`,
    });
  } catch (e) {
    return apiError(e);
  }
}
