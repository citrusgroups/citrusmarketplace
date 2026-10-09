import { db } from "../../../lib/db";
import { user } from "../../../auth-schema";
import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function PATCH(req) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        await db
            .update(user)
            .set({
                name: body.name,
                updatedAt: new Date(),
            })
            .where(eq(user.id, session.user.id));

        return Response.json({ success: true });
    } catch (error) {
        console.log("PROFILE_UPDATE_ERROR:", error);
        return Response.json({ error: "Profile update failed" }, { status: 500 });
    }
}
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const currentUser = await db.query.user.findFirst({
            where: eq(user.id, session.user.id),
        });

        return Response.json({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            address: currentUser.address || "",
        });
    } catch (error) {
        console.log("GET_PROFILE_ERROR:", error);

        return Response.json(
            { error: "Failed to get profile" },
            { status: 500 }
        );
    }
}