import { db } from "../../../../lib/db";
import { contactMessages } from "../../../../db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
    try {
        const messages = await db
            .select()
            .from(contactMessages)
            .orderBy(desc(contactMessages.createdAt));

        return Response.json({ messages });
    } catch (error) {
        return Response.json(
            { error: error.message || "Messages fetch failed" },
            { status: 500 }
        );
    }
}

export async function PATCH(req) {
    try {
        const body = await req.json();

        await db
            .update(contactMessages)
            .set({ status: body.status || "read" })
            .where(eq(contactMessages.id, body.id));

        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: error.message || "Message update failed" },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json();

        await db
            .delete(contactMessages)
            .where(eq(contactMessages.id, body.id));

        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: error.message || "Message delete failed" },
            { status: 500 }
        );
    }
}