import { db } from "../../../lib/db";
import { user } from "../../../auth-schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
    try {
        const body = await req.json();
        const email = body.email?.trim().toLowerCase();

        if (!email) {
            return Response.json({ exists: false }, { status: 400 });
        }

        const foundUser = await db.query.user.findFirst({
            where: (users, { eq }) => eq(users.email, email),
        });

        console.log("CHECK EMAIL:", email);
        console.log("FOUND USER:", foundUser);

        return Response.json({
            exists: !!foundUser,
        });
    } catch (error) {
        console.log("CHECK_USER_ERROR:", error);

        return Response.json(
            { exists: false, error: "Server error" },
            { status: 500 }
        );
    }
}