import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import { and, eq, ne } from "drizzle-orm";
import ClearPaidCart from "./ClearPaidCart";
export const dynamic="force-dynamic";
export default async function Success({searchParams}) {
 let order=null, paid=false;
 try {
  const user=await auth.api.getSession({headers:await headers()});
  const {session_id}=await searchParams;
  if (user?.user && typeof session_id === "string") {
   const session=await getStripe().checkout.sessions.retrieve(session_id);
   if (session.metadata?.orderId) {
    [order]=await db.select().from(orders).where(and(eq(orders.id,session.metadata.orderId),eq(orders.userId,user.user.id)));
    paid=Boolean(order && order.paymentMethod === "stripe" && session.payment_status === "paid" && session.currency === "usd" && session.amount_total === Math.round(order.totalPrice*100));
    if (paid) await db.update(orders).set({paymentStatus:"paid",status:"processing",stripeSessionId:session.id}).where(and(eq(orders.id,order.id),ne(orders.paymentStatus,"paid")));
   }
  }
 } catch { paid=false; }
 return <main className="mx-auto max-w-xl px-4 py-24 text-center">{paid && <ClearPaidCart/>}<h1 className="inter text-3xl font-semibold">{paid ? "Payment confirmed" : "Payment confirmation pending"}</h1><p className="mt-5 leading-7 text-black/60">{paid ? "Thank you. Your Citrus Products order is now being processed." : "We could not confirm a completed payment yet. Sign in and check your order status before paying again."}</p>{order && <p className="mt-4">Order ID: {order.id}</p>}<div className="mt-8 flex flex-wrap justify-center gap-4"><Link href={order ? `/account/orders/${order.id}` : "/account"} className="rounded bg-orange-500 px-6 py-3 text-white">View order status</Link><Link href="/products" className="rounded border px-6 py-3">Continue shopping</Link></div></main>;
}
