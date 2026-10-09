import { db } from "../../../lib/db";
import { contactMessages } from "../../../db/schema";
import { nanoid } from "nanoid";

export async function POST(req) {
    try {
        const body = await req.json();

        if (!body.name || !body.email || !body.phone || !body.message) {
            return Response.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        await db.insert(contactMessages).values({
            id: nanoid(),
            name: body.name.trim(),
            email: body.email.trim().toLowerCase(),
            phone: body.phone.trim(),
            message: body.message.trim(),
        });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json(
            { error: error.message || "Message send failed" },
            { status: 500 }
        );
    }
}