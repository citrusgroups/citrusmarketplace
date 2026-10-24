"use client";
import Link from "next/link";
import { readClientSession } from "@/lib/client-session";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "../../store/cartStore";
import { authClient } from "../../lib/auth-client";

export default function Checkout() {
  const router = useRouter();

  const cartItems = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    companyName: "",
    streetAddress: "",
    apartment: "",
    city: "",
    phone: "",
    email: "",
    paymentMethod: "cash",
  });
  const couponCode = useCartStore((state) => state.couponCode);

  const discount = useCartStore((state) => state.discount);

  const couponApplied = useCartStore((state) => state.couponApplied);

  const setCouponCode = useCartStore((state) => state.setCouponCode);

  const setCoupon = useCartStore((state) => state.setCoupon);
  const clearCoupon = useCartStore((state) => state.clearCoupon);
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const ensureSignedIn = async () => {
    const session = await readClientSession();
    if (session.status === "signed-out") {
      toast.error("Please sign in to place your order.");
      router.push("/login?callbackURL=%2Fcheckout");
      return false;
    }
    if (session.status !== "signed-in") {
      toast.error(
        "We could not check your session. Please retry; you have not been signed out.",
      );
      return false;
    }
    return true;
  };
  const placeOrder = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!(await ensureSignedIn())) return;

    if (
      !form.firstName ||
      !form.streetAddress ||
      !form.city ||
      !form.phone ||
      !form.email
    ) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        items: cartItems,
        subtotal,
        discount: discountAmount,
        total,
        couponCode,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Order failed");
      return;
    }

    clearCart();
    clearCoupon();
    toast.success("Order placed successfully");
    router.push(`/order-success?orderId=${data.orderId}`);
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
  const discountAmount = Math.round(subtotal * discount) / 100;

  const total = subtotal - discountAmount;

  const validate = () => {
    let newErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!form.streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const fillSavedAddress = async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();

    if (!res.ok) {
      toast.error("Saved address not found");
      return;
    }

    setForm((prev) => ({
      ...prev,
      streetAddress: data.address || "",
    }));

    toast.success("Address filled");
  };
  const placeOrderWithStripe = async (e) => {
    e?.preventDefault();

    if (!validate()) return;
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!(await ensureSignedIn())) return;

    if (
      !form.firstName ||
      !form.streetAddress ||
      !form.city ||
      !form.phone ||
      !form.email
    ) {
      toast.error("Please fill required fields");
      return;
    }

    if (loading) return;
    setLoading(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: cartItems,
          couponCode: couponApplied ? couponCode : "",
          paymentMethod: "stripe",
        }),
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok)
        throw new Error(orderData.error || "Could not create your order.");
      const stripeRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });
      const stripeData = await stripeRes.json().catch(() => ({}));
      if (!stripeRes.ok || !stripeData.url)
        throw new Error(stripeData.error || "Could not start card payment.");
      window.location.assign(stripeData.url);
    } catch (error) {
      toast.error(error.message || "Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="w-full bg-white py-12 sm:py-16 lg:py-[80px]">
      <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
        <div className="poppins mb-[50px] flex flex-wrap gap-[8px] text-[14px] leading-[21px] lg:mb-[80px]">
          <span className="text-black/50">Account</span>
          <span className="text-black/50">/</span>
          <span className="text-black/50">My Account</span>
          <span className="text-black/50">/</span>
          <span className="text-black/50">Product</span>
          <span className="text-black/50">/</span>
          <span className="text-black/50">View Cart</span>
          <span className="text-black">/ CheckOut</span>
        </div>

        <div className="flex flex-col justify-between gap-[50px] lg:flex-row lg:gap-[80px]">
          <div className="w-full lg:w-[470px]">
            <h1 className="inter text-[30px] font-medium leading-[34px] tracking-[0.04em] text-black sm:text-[36px] sm:leading-[30px]">
              Billing Details
            </h1>

            <form className="mt-[36px] space-y-[24px] lg:mt-[48px]">
              {[
                { label: "First Name*", name: "firstName" },
                { label: "Company Name", name: "companyName" },
                { label: "Street Address*", name: "streetAddress" },
                {
                  label: "Apartment, floor, etc. (optional)",
                  name: "apartment",
                },
                { label: "Town/City*", name: "city" },
                { label: "Phone Number*", name: "phone" },
                { label: "Email Address*", name: "email" },
              ].map((field) => (
                <label key={field.name} className="block">
                  <span className="poppins text-[16px] font-normal leading-[24px] text-black/40">
                    {field.label}
                  </span>

                  <input
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    onClick={
                      field.name === "streetAddress"
                        ? fillSavedAddress
                        : undefined
                    }
                    className={`mt-[8px] h-[50px] w-full rounded-[4px] bg-[#F5F5F5] px-4 outline-none ${
                      errors[field.name] ? "border border-red-500" : ""
                    }`}
                  />

                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors[field.name]}
                    </p>
                  )}
                </label>
              ))}

              <label className="flex items-start gap-[16px] sm:items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-[2px] h-[24px] w-[24px] shrink-0 cursor-pointer accent-[#F97316] sm:mt-0"
                />
                <span className="poppins text-[15px] leading-[23px] sm:text-[16px] sm:leading-[24px]">
                  Save this information for faster check-out next time
                </span>
              </label>
            </form>
          </div>

          <div className="w-full pt-0 lg:w-[527px] lg:pt-[32px]">
            <div className="space-y-[32px]">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex min-w-0 items-center gap-[16px] sm:gap-[24px]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-[54px] w-[54px] shrink-0 object-contain"
                    />
                    <p className="poppins truncate text-[16px] leading-[24px]">
                      {item.name} × {item.quantity}
                    </p>
                  </div>

                  <p className="poppins shrink-0 text-[16px] leading-[24px]">
                    ${item.price * item.quantity}
                  </p>
                </div>
              ))}
              <div className="space-y-[16px]">
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

                <div className="flex justify-between poppins text-[16px]">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-[16px]">
                <label className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex items-center gap-[16px] poppins text-[16px]">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={form.paymentMethod === "bank"}
                      onChange={handleChange}
                      className="h-[24px] w-[24px]"
                    />
                    Card payment (Stripe)
                  </span>

                  <div className="flex flex-wrap items-center gap-[8px] pl-[40px] sm:pl-0">
                    <img
                      src="/images/visa (4).png"
                      alt="no"
                      className="w-[38px]"
                    />
                    <img
                      src="/images/visa (1).png"
                      alt="no"
                      className="w-[38px]"
                    />
                    <img
                      src="/images/visa (2).png"
                      alt="no"
                      className="w-[38px]"
                    />
                    <img
                      src="/images/visa (3).png"
                      alt="no"
                      className="w-[38px]"
                    />
                  </div>
                </label>

                <label className="flex items-center gap-[16px] poppins text-[16px]">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={form.paymentMethod === "cash"}
                    onChange={handleChange}
                    className="h-[24px] w-[24px]"
                  />
                  Cash on delivery
                </label>
              </div>

              <div className="flex flex-col gap-[16px] sm:flex-row">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon Code"
                  disabled={couponApplied}
                  className="h-[56px] w-full rounded-[4px] border border-black/50 px-[24px] poppins text-[16px] outline-none sm:w-[300px]"
                />

                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponApplied}
                  className="h-[56px] w-full cursor-pointer rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium text-white hover:opacity-85 disabled:opacity-60 sm:w-[211px]"
                >
                  {couponApplied ? "Applied" : "Apply Coupon"}
                </button>
              </div>

              <button
                type="button"
                onClick={
                  form.paymentMethod === "bank"
                    ? placeOrderWithStripe
                    : placeOrder
                }
                disabled={loading}
                className="h-[56px] w-full cursor-pointer rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium text-white hover:opacity-85 disabled:opacity-60 sm:w-[190px]"
              >
                {loading
                  ? "Processing..."
                  : form.paymentMethod === "bank"
                    ? "Pay with Stripe"
                    : "Place Order"}
              </button>
              {/* <button
                onClick={placeOrderWithStripe}
                disabled={loading}
                className="ml-8 h-[56px] w-full cursor-pointer rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium text-white hover:opacity-85 disabled:opacity-60 sm:w-[190px]"
              >
                {loading ? "Processing..." : "Pay with Stripe"}
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
