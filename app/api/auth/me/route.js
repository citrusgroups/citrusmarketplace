import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return Response.json({ user: null }, { status: 401 });
    }

    return Response.json({
        user: session.user,
    });
}