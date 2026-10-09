import { db } from "../../../../lib/db";
import { user } from "../../../../auth-schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
    try {
        const body = await req.json();

        const email = body.email?.toLowerCase()?.trim();

        if (!email) {
            return Response.json({ error: "Email is required" }, { status: 400 });
        }

        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.email, email));

        return Response.json({
            exists: existingUser.length > 0,
        });
    } catch (error) {
        return Response.json(
            { error: error.message || "Email check failed" },
            { status: 500 }
        );
    }
}