import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "./db";
import * as authSchema from "../auth-schema";
import nodemailer from "nodemailer";



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60 * 10,
    max: 3,
  },
  plugins: [
    emailOTP({
      expiresIn: 300,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,

      async sendVerificationOTP({ email, otp, type }) {


        const info = await transporter.sendMail({
          to: email,
          subject: "Verify your account",
          html: `<h2>${otp}</h2>`,
        });

        console.log("MAIL SENT:", info.messageId);
      },
    }),
  ],

  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL, process.env.BETTER_AUTH_URL, "http://localhost:3000",
    "https://ecommerce-smoky-chi-57.vercel.app",
  ].filter(Boolean),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
