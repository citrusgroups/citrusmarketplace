import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  authOrigin,
  trustedAuthOrigins,
  sessionPolicy,
  authRateLimit,
} from "./auth-settings";
import { emailOTP } from "better-auth/plugins";
import { db } from "./db";
import * as authSchema from "../auth-schema";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || process.env.GMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD,
  },
});
export const auth = betterAuth({
  appName: "Citrus Products",
  baseURL: authOrigin(),
  secret: process.env.BETTER_AUTH_SECRET,
  session: sessionPolicy,
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
  rateLimit: authRateLimit,
  plugins: [
    emailOTP({
      expiresIn: 300,
      sendVerificationOnSignUp: false,
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
    nextCookies(),
  ],

  trustedOrigins: trustedAuthOrigins(),
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID.trim(),
            clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
          },
        }
      : {},
});
