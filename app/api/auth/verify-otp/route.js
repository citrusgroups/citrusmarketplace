import { db } from "../../../../lib/db";
import { verification, user } from "../../../../auth-schema";
import { eq } from "drizzle-orm";
import { auth } from "../../../..//lib/auth";
import { headers } from "next/headers";

export async function POST(req) {
    try {
        const { email, otp, name, password } = await req.json();

        if (!email || !otp || !name || !password) {
            return Response.json(
                { error: "Email, OTP, name and password required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const rows = await db
            .select()
            .from(verification)
            .where(eq(verification.identifier, normalizedEmail));

        const record = rows[0];

        if (!record) {
            return Response.json(
                { error: "OTP not found. Please resend OTP." },
                { status: 400 }
            );
        }

        if (new Date(record.expiresAt) < new Date()) {
            await db.delete(verification).where(eq(verification.identifier, normalizedEmail));

            return Response.json(
                { error: "OTP expired. Please resend OTP." },
                { status: 400 }
            );
        }

        const saved = JSON.parse(record.value || "{}");

        if (saved.otp !== otp) {
            return Response.json(
                { error: "Invalid OTP" },
                { status: 400 }
            );
        }

    const signupRes = await auth.api.signUpEmail({
    body: {
        name: name.trim(),
        email: normalizedEmail,
        password,
    },
    headers: await headers(),
});

await db
    .update(user)
    .set({
        emailVerified: true,
    })
    .where(eq(user.email, normalizedEmail));
        await db.delete(verification).where(eq(verification.identifier, normalizedEmail));

        return Response.json({
            success: true,
            user: signupRes?.user || null,
        });
    } catch (error) {
        console.log("VERIFY_OTP_ERROR:", error);

        return Response.json(
            { error: error?.message || "OTP verify failed" },
            { status: 500 }
        );
    }
}