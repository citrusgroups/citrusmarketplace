import Stripe from "stripe";
export function getStripe() {
 if (!process.env.STRIPE_SECRET_KEY) throw new Error("Card payments are not configured. Please contact the store or use cash on delivery.");
 return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export function getAppUrl(req) {
 const value = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || new URL(req.url).origin;
 const url = new URL(value);
 if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid application URL configuration.");
 return url.origin;
}
