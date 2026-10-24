import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import {
  catalogImportJobs as jobs,
  catalogImportBatches as batches,
} from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { requireAdmin, apiError, badRequest } from "@/lib/admin-access";
import { extractCatalogPart } from "@/lib/catalog/extract";
import { persistProducts } from "@/lib/catalog/persist";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(req, { params }) {
  let claimed = null,
    job = null;
  try {
    await requireAdmin(req);
    const { id } = await params;
    claimed = await db.transaction(async (tx) => {
      const [locked] = await tx.execute(
        sql`select id from catalog_import_jobs where id=${id} for update`,
      );
      if (!locked) throw badRequest("Import not found.", 404);
      [job] = await tx.select().from(jobs).where(eq(jobs.id, id));
      if (["cancelled", "completed", "failed"].includes(job.status))
        return null;
      await tx
        .update(batches)
        .set({ status: "pending", lease: null })
        .where(
          and(
            eq(batches.jobId, id),
            eq(batches.status, "running"),
            sql`${batches.startedAt} < now() - interval '5 minutes'`,
          ),
        );
      const [running] = await tx
        .select({ id: batches.id })
        .from(batches)
        .where(and(eq(batches.jobId, id), eq(batches.status, "running")))
        .limit(1);
      if (running) return null;
      const [batch] = await tx
        .select()
        .from(batches)
        .where(and(eq(batches.jobId, id), eq(batches.status, "pending")))
        .orderBy(asc(batches.position))
        .limit(1);
      if (!batch) {
        await tx
          .update(jobs)
          .set({ status: "completed", error: null, updatedAt: new Date() })
          .where(eq(jobs.id, id));
        return null;
      }
      const lease = randomUUID();
      await tx
        .update(batches)
        .set({ status: "running", lease, startedAt: new Date() })
        .where(eq(batches.id, batch.id));
      await tx
        .update(jobs)
        .set({ status: "running", updatedAt: new Date() })
        .where(eq(jobs.id, id));
      return { ...batch, lease };
    });
    if (!claimed) return Response.json({ idle: true });
    const extracted = await extractCatalogPart(claimed.payload);
    const result = await db.transaction(async (tx) => {
      await tx.execute(
        sql`select id from catalog_import_jobs where id=${job.id} for update`,
      );
      const [current] = await tx.select().from(jobs).where(eq(jobs.id, job.id));
      const [batch] = await tx
        .select()
        .from(batches)
        .where(eq(batches.id, claimed.id));
      if (current.status === "cancelled" || batch.lease !== claimed.lease)
        return { cancelled: true };
      const { added, duplicates, review } = await persistProducts(
        tx,
        job,
        claimed.payload,
        extracted,
      );
      await tx
        .update(batches)
        .set({
          status: "completed",
          lease: null,
          payload: { type: "completed" },
        })
        .where(eq(batches.id, claimed.id));
      const processed = current.processedBatches + 1;
      await tx
        .update(jobs)
        .set({
          status: processed >= current.totalBatches ? "completed" : "ready",
          processedBatches: processed,
          productsAdded: current.productsAdded + added,
          duplicatesSkipped: current.duplicatesSkipped + duplicates,
          needsReview: current.needsReview + review,
          error: null,
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, job.id));
      return { added, duplicates, review };
    });
    return Response.json(result);
  } catch (e) {
    if (claimed && job) {
      await db
        .transaction(async (tx) => {
          await tx.execute(
            sql`select id from catalog_import_jobs where id=${job.id} for update`,
          );
          const [current] = await tx
            .select()
            .from(jobs)
            .where(eq(jobs.id, job.id));
          const changed = await tx
            .update(batches)
            .set({ status: "failed", error: e.message, lease: null })
            .where(
              and(eq(batches.id, claimed.id), eq(batches.lease, claimed.lease)),
            )
            .returning({ id: batches.id });
          if (changed.length && current?.status !== "cancelled")
            await tx
              .update(jobs)
              .set({
                status: "failed",
                error: e.message,
                updatedAt: new Date(),
              })
              .where(eq(jobs.id, job.id));
        })
        .catch(() => {});
      return Response.json(
        {
          error: e.message || "Catalog extraction failed. Retry this segment.",
        },
        { status: 502 },
      );
    }
    return apiError(e);
  }
}
