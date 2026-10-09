import { db } from "@/lib/db";
import { orders, orderItems, products, productVariants, coupons, siteSettings, productImages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getSalePrice } from "@/lib/getSalePrice";
export async function POST(req) {
 try {
  const session=await auth.api.getSession({headers:req.headers});
  if (!session?.user) return Response.json({error:"Please login to place an order."},{status:401});
  const body=await req.json();
  if (!Array.isArray(body.items) || !body.items.length || body.items.length>100) return Response.json({error:"Your cart is empty or invalid."},{status:400});
  if (["firstName","streetAddress","city","phone","email"].some(key=>typeof body[key]!=="string" || !body[key].trim())) return Response.json({error:"Please fill in all required billing details."},{status:400});
  if (!["cash","stripe"].includes(body.paymentMethod)) return Response.json({error:"Choose a supported payment method."},{status:400});
  const result=await db.transaction(async tx=>{
   const [settings]=await tx.select().from(siteSettings);
   const items=[];
   for (const item of body.items) {
    if (!Number.isInteger(item.quantity) || item.quantity<1 || item.quantity>999) throw new Error("Invalid product quantity.");
    const [product]=await tx.select().from(products).where(eq(products.id,item.id));
    if (!product) throw new Error("A product in your cart is no longer available.");
    let price=getSalePrice(product,settings), stock=product.stock;
    if (product.hasVariants && !item.variantId) throw new Error("Please select a product variant.");
    if (item.variantId) {
     const [variant]=await tx.select().from(productVariants).where(eq(productVariants.id,item.variantId));
     if (!variant || variant.productId!==product.id) throw new Error("Invalid product variant.");
     price=variant.price ?? price;stock=variant.stock;
    }
    const requested=items.filter(row=>row.productId===product.id && row.variantId===(item.variantId || null)).reduce((sum,row)=>sum+row.quantity,0)+item.quantity;
    if (requested>stock) throw new Error(`Not enough stock for ${product.name}.`);
    if (!Number.isSafeInteger(price) || price<0) throw new Error("Invalid product price.");
    const [image]=await tx.select().from(productImages).where(eq(productImages.productId,product.id)).limit(1);
    items.push({id:randomUUID(),productId:product.id,variantId:item.variantId || null,productName:product.name,image:image?.imageUrl || null,quantity:item.quantity,price});
   }
   const subtotal=items.reduce((sum,item)=>sum+item.quantity*item.price,0);
   let discount=0;
   if (body.couponCode?.trim()) {
    const [coupon]=await tx.select().from(coupons).where(eq(coupons.code,body.couponCode.trim().toUpperCase()));
    const now=new Date();
    if (!coupon?.isActive || (coupon.startAt && now<coupon.startAt) || (coupon.endAt && now>coupon.endAt) || coupon.discountPercent<0 || coupon.discountPercent>100) throw new Error("Coupon is invalid or expired.");
    discount=Math.round(subtotal*coupon.discountPercent/100);
   }
   const total=subtotal-discount;
   if (!Number.isSafeInteger(total) || total<0) throw new Error("Invalid order total.");
   const id=randomUUID();
   await tx.insert(orders).values({id,userId:session.user.id,firstName:body.firstName,companyName:body.companyName || null,streetAddress:body.streetAddress,apartment:body.apartment || null,city:body.city,phone:body.phone,email:body.email,subtotal,discount,totalPrice:total,paymentMethod:body.paymentMethod,paymentStatus:"pending",status:"pending"});
   await tx.insert(orderItems).values(items.map(item=>({...item,orderId:id})));
   return id;
  });
  return Response.json({success:true,orderId:result});
 } catch (error) {
  const messages=["Invalid product quantity.","A product in your cart is no longer available.","Please select a product variant.","Invalid product variant.","Invalid product price.","Coupon is invalid or expired.","Invalid order total."];
  const validation=messages.includes(error.message) || error.message?.startsWith("Not enough stock for ");
  return Response.json({error:validation ? error.message : "Could not create your order. Please try again."},{status:validation ? 400 : 500});
 }
}
