"use client";

import Link from "next/link";
import { useCartStore } from "../../store/cartStore";
import { toast } from "sonner";


export default function Cart() {
  const couponCode = useCartStore((state) => state.couponCode);
  const discount = useCartStore((state) => state.discount);
  const couponApplied = useCartStore((state) => state.couponApplied);
  const setCouponCode = useCartStore((state) => state.setCouponCode);
  const setCoupon = useCartStore((state) => state.setCoupon);
  const cartItems = useCartStore(
    (state) => state.cart
  );

  const removeFromCart = useCartStore(
    (state) => state.removeFromCart
  );

  const updateQuantity = useCartStore(
    (state) => state.updateQuantity
  );
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const removeItem = (id) => {
    removeFromCart(id);
  };
  const updateQty = (id, qty) => {
    updateQuantity(id, Number(qty));
  };
  const applyCoupon = async () => {
    if (couponApplied) {
      toast.error("Coupon already applied");
      return;
    }

    if (!couponCode.trim()) {
      toast.error("Please enter coupon code");
      return;
    }

    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: couponCode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Invalid Coupon");
      return;
    }

    setCoupon(couponCode, data.discountPercent);
    toast.success("Coupon Applied");
  };
  const discountAmount =
    subtotal * (discount / 100);
  const total =
    subtotal - discountAmount;
  return (
    <main className="w-full bg-white mb-50 py-12 sm:py-16 lg:py-[80px]">
      <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
        <div className="poppins mb-[50px] flex gap-[12px] text-[14px] leading-[21px] lg:mb-[80px]">
          <Link href="/" className="text-black/50">Home</Link>
          <span className="text-black/50">/</span>
          <Link href="/cart" className="text-black">Cart</Link>
        </div>

        <div className="space-y-[24px] lg:space-y-[40px]">
          <div className="hidden h-[72px] grid-cols-4 items-center rounded-[4px] px-[40px] shadow-[0_1px_13px_0_rgba(0,0,0,0.05)] md:grid">
            <p className="poppins text-[16px]">Product</p>
            <p className="poppins text-[16px]">Price</p>
            <p className="poppins text-[16px]">Quantity</p>
            <p className="poppins text-right text-[16px]">Subtotal</p>
          </div>

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="rounded-[4px] p-4 shadow-[0_1px_13px_0_rgba(0,0,0,0.05)] md:grid md:h-[102px] md:grid-cols-4 md:items-center md:px-[40px] md:py-0"
            >
              <div className="relative flex items-center gap-[16px] md:gap-[20px]">
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute -left-[8px] -top-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#F97316] text-[14px] text-white md:-left-[10px] md:top-[0px]"
                >
                  ×
                </button>

                <img
                  src={item.image}
                  alt={item.name}
                  className="h-[54px] w-[54px] object-contain"
                />

                <p className="poppins text-[16px]">{item.name}</p>
              </div>

              <div className="mt-4 grid grid-cols-3 items-center gap-3 md:mt-0 md:block">
                <p className="poppins text-[13px] text-black/50 md:hidden">Price</p>
                <p className="poppins col-span-2 text-[16px] md:col-span-1">${item.price}</p>
              </div>

              <div className="mt-4 grid grid-cols-3 items-center gap-3 md:mt-0 md:block">
                <p className="poppins text-[13px] text-black/50 md:hidden">Quantity</p>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQty(item.id, Number(e.target.value))
                  }
                  className="h-[44px] w-[72px] rounded-[4px] border border-black/40 px-[12px] poppins text-[16px] outline-none"
                />
              </div>

              <div className="mt-4 grid grid-cols-3 items-center gap-3 md:mt-0 md:block">
                <p className="poppins text-[13px] text-black/50 md:hidden">Subtotal</p>
                <p className="poppins col-span-2 text-[16px] md:col-span-1 md:text-right">
                  ${item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[24px] flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Link
            href="/"
            className="flex h-[56px] w-full items-center justify-center rounded-[4px] border border-black/50 poppins text-[16px] hover:bg-black hover:text-white sm:w-[218px]"
          >
            Return To Shop
          </Link>

          <Link
            href="#"
            disabled
            className="flex h-[56px] w-full items-center justify-center rounded-[4px] border border-black/50 poppins text-[16px] hover:bg-black hover:text-white sm:w-[195px]"
          >
            Update Cart
          </Link>
        </div>

        <div className="mt-[50px] flex flex-col justify-between gap-[40px] lg:mt-[80px] lg:flex-row">
          <div className="flex h-auto flex-col gap-[16px] sm:h-[56px] sm:flex-row">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon Code"
              disabled={couponApplied}
              className="h-[56px] w-full rounded-[4px] border border-black/50 px-[24px] poppins text-[16px] outline-none disabled:opacity-60 sm:w-[300px]"
            />

            <button
              onClick={applyCoupon}
              disabled={couponApplied}
              className="h-[56px] w-full cursor-pointer rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium text-white hover:opacity-85 disabled:opacity-60 sm:w-[211px]"
            >
              {couponApplied ? "Applied" : "Apply Coupon"}
            </button>
          </div>

          <div className="h-auto w-full rounded-[4px] border-[1.5px] border-black px-[20px] py-[28px] sm:px-[24px] sm:py-[32px] lg:h-[384px] lg:w-[470px]">
            <h3 className="poppins text-[20px] font-medium leading-[28px]">
              Cart Total
            </h3>

            <div className="mt-[24px] space-y-[16px]">
              <div className="flex justify-between border-b border-black/40 pb-[16px] poppins text-[16px]">
                <span>Subtotal:</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between border-b border-black/40 pb-[16px] poppins text-[16px]">
                <span>Discount:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-black/40 pb-[16px] poppins text-[16px]">
                <span>Shipping:</span>
                <span>Free</span>
              </div>

              <div className="flex justify-between poppins text-[16px] font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link href="/checkout" className="flex h-[56px] items-center justify-center w-full cursor-pointer rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium text-white hover:opacity-85 sm:w-[260px]">
                Process to checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}