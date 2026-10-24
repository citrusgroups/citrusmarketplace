import { db } from "@/lib/db";
import { catalogImportJobs, catalogImportBatches } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAdmin, apiError, badRequest } from "@/lib/admin-access";
export async function GET(req, { params }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const [job] = await db
      .select()
      .from(catalogImportJobs)
      .where(eq(catalogImportJobs.id, id));
    if (!job) throw badRequest("Import not found.", 404);
    const { imageCandidates, ...safe } = job;
    return Response.json({ job: safe });
  } catch (e) {
    return apiError(e);
  }
}
export async function PATCH(req, { params }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const { action } = await req.json();
    if (!["retry", "cancel"].includes(action))
      throw badRequest("Invalid import action.");
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`select id from catalog_import_jobs where id=${id} for update`,
      );
      if (action === "retry") {
        await tx
          .update(catalogImportBatches)
          .set({ status: "pending", lease: null, error: null })
          .where(
            and(
              eq(catalogImportBatches.jobId, id),
              eq(catalogImportBatches.status, "failed"),
            ),
          );
        await tx
          .update(catalogImportJobs)
          .set({ status: "ready", error: null, updatedAt: new Date() })
          .where(eq(catalogImportJobs.id, id));
      } else
        await tx
          .update(catalogImportJobs)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(catalogImportJobs.id, id));
    });
    return Response.json({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
