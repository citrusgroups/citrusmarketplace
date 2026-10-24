import { db } from "../../../../lib/db";
import { verification } from "../../../../auth-schema";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});
export async function POST(req) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return Response.json(
                { error: "Name, email and password required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await db.delete(verification).where(eq(verification.identifier, normalizedEmail));

        await db.insert(verification).values({
            id: crypto.randomUUID(),
            identifier: normalizedEmail,
            value: JSON.stringify({
                otp,
                name,
                password,
            }),
            expiresAt,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await transporter.sendMail({
            from: `"Citrus Products" <${process.env.GMAIL_USER}>`,
            to: normalizedEmail,
            subject: "Your Signup OTP",
            html: `
        <h2>Your OTP is: ${otp}</h2>
        <p>This OTP will expire in 5 minutes.</p>
      `,
        });

        return Response.json({ success: true });
    } catch (error) {
        console.log("SEND_OTP_ERROR:", error);

        return Response.json(
            { error: "OTP send failed" },
            { status: 500 }
        );
    }
}