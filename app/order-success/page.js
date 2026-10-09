"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderSuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-white px-4">
      <div className="max-w-[600px] rounded bg-white p-8 text-center shadow-[0_1px_13px_rgba(0,0,0,0.1)]">
        <h1 className="inter text-[36px] font-semibold text-black">
          Order Placed Successfully 🎉
        </h1>

        <p className="mt-4 poppins text-[16px] text-black/60">
          Your order has been placed successfully.
        </p>

        {orderId && (
          <p className="mt-4 poppins text-[16px]">
            Order ID: <span className="font-semibold">{orderId}</span>
          </p>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/" className="flex h-[50px] items-center justify-center rounded bg-[#F97316] px-6 text-white">
            Continue Shopping
          </Link>

          {orderId && (
            <Link
              href={`/account/orders/${orderId}`}
              className="flex h-[50px] items-center justify-center rounded border border-black px-6"
            >
              View Order
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}