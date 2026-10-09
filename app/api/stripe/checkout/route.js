import { getStripe, getAppUrl } from "@/lib/stripe";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
export const runtime = "nodejs";
export async function POST(req) {
 try {
  const userSession = await auth.api.getSession({headers:req.headers});
  if (!userSession?.user) return Response.json({error:"Please login to pay for your order."},{status:401});
  const {orderId} = await req.json();
  if (typeof orderId !== "string") return Response.json({error:"An order ID is required."},{status:400});
  const [order] = await db.select().from(orders).where(and(eq(orders.id,orderId),eq(orders.userId,userSession.user.id)));
  if (!order) return Response.json({error:"Order not found."},{status:404});
  if (order.paymentStatus === "paid" || order.paymentMethod !== "stripe" || order.status === "cancelled") return Response.json({error:"This order cannot be paid by card."},{status:409});
  const amount = Math.round(Number(order.totalPrice)*100);
  if (!Number.isSafeInteger(amount) || amount < 50) return Response.json({error:"Card checkout requires a valid total of at least $0.50."},{status:400});
  const stripe = getStripe();
  if (order.stripeSessionId) {
   const previous = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
   if (previous.status === "open" && previous.url) return Response.json({url:previous.url});
   if (previous.status === "complete") return Response.json({error:"This payment is awaiting confirmation. Check your order status."},{status:409});
  }
  const origin = getAppUrl(req);
  const session = await stripe.checkout.sessions.create({
   mode:"payment", payment_method_types:["card"], customer_email:order.email || undefined,
   line_items:[{price_data:{currency:"usd",product_data:{name:`Citrus Marketplace order ${order.id}`},unit_amount:amount},quantity:1}],
   metadata:{orderId:order.id}, client_reference_id:order.id,
   success_url:`${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
   cancel_url:`${origin}/checkout?cancelled=1`,
  },{idempotencyKey:`checkout-${order.id}-${order.stripeSessionId || "initial"}`});
  await db.update(orders).set({stripeSessionId:session.id,paymentStatus:"pending"}).where(eq(orders.id,order.id));
  return Response.json({url:session.url});
 } catch (error) {
  console.error("STRIPE_CHECKOUT_ERROR", error.type || error.name, error.code || "");
  const configuration = !process.env.STRIPE_SECRET_KEY;
  return Response.json({error:configuration ? "Card payments are not configured. Please use cash on delivery or contact the store." : "Unable to start card checkout. Please try again or contact the store."},{status:configuration ? 503 : 500});
 }
}
