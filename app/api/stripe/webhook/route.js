import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
export const runtime = "nodejs";
export async function POST(req) {
 if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return Response.json({error:"Webhook is not configured."},{status:503});
 let event;
 try { event=getStripe().webhooks.constructEvent(await req.text(),req.headers.get("stripe-signature"),process.env.STRIPE_WEBHOOK_SECRET); }
 catch { return Response.json({error:"Invalid webhook signature."},{status:400}); }
 try {
  const session=event.data.object;
  const id=session.metadata?.orderId;
  if (!id) return Response.json({received:true});
  const [order]=await db.select().from(orders).where(eq(orders.id,id));
  if (!order || order.paymentMethod !== "stripe") return Response.json({received:true});
  if (["checkout.session.completed","checkout.session.async_payment_succeeded"].includes(event.type) && session.payment_status === "paid") {
   if (session.currency !== "usd" || session.amount_total !== Math.round(order.totalPrice*100)) return Response.json({error:"Payment amount mismatch."},{status:400});
   await db.update(orders).set({paymentStatus:"paid",status:"processing",stripeSessionId:session.id}).where(and(eq(orders.id,id),ne(orders.paymentStatus,"paid")));
  }
  if (["checkout.session.expired","checkout.session.async_payment_failed"].includes(event.type) && order.stripeSessionId === session.id) {
   await db.update(orders).set({paymentStatus:"failed"}).where(and(eq(orders.id,id),ne(orders.paymentStatus,"paid")));
  }
  return Response.json({received:true});
 } catch { return Response.json({error:"Could not record payment. Retry this event."},{status:500}); }
}
