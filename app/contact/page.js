"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";


export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selection = params.get("package") || params.get("service");
    if (selection) setForm(prev => ({...prev, message: `I am interested in ${selection} support. My Amazon marketplace is: \nMy business stage is: \nThe help I need is: `}));
  }, []);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Message send failed");
      return;
    }

    toast.success("Message sent successfully");
    setForm({ name: "", email: "", phone: "", message: "" });
  };
  return (
    <main className="w-full bg-white py-[80px]">
      <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
        <div className="mb-[80px] flex gap-[12px] poppins text-[14px] leading-[21px]">
          <Link href="/" className="text-black/50">Home</Link>
          <span className="text-black/50">/</span>
          <Link href="/contact" className="text-black">Contact</Link>
        </div>
        <div className="flex flex-col gap-[30px] lg:flex-row">
          <div className="h-auto w-full rounded-[4px] bg-white px-[35px] py-[40px] shadow-[0_1px_13px_rgba(0,0,0,0.05)] lg:h-[457px] lg:w-[340px]">
            <div>
              <div className="flex items-center gap-[16px]">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#F97316] text-white">
                  ☎
                </div>
                <h3 className="poppins text-[16px] font-medium leading-[24px]">
                  Call To Us
                </h3>
              </div>

              <p className="mt-[24px] poppins text-[14px] leading-[21px]">
                Tell us about your order or Amazon business.
              </p>

              <p className="mt-[16px] poppins text-[14px] leading-[21px]">
                Send your details using this form.
              </p>
            </div>

            <div className="my-[32px] h-[1px] w-full bg-black/30" />

            <div>
              <div className="flex items-center gap-[16px]">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#F97316] text-white">
                  ✉
                </div>
                <h3 className="poppins text-[16px] font-medium leading-[24px]">
                  Write To Us
                </h3>
              </div>

              <p className="mt-[24px] poppins text-[14px] leading-[21px]">
                Fill out our form and we will contact you within 24 hours.
              </p>

              <p className="mt-[16px] poppins text-[14px] leading-[21px]">
                For product orders, include your order ID.
              </p>

              <p className="mt-[16px] poppins text-[14px] leading-[21px]">
                For services, include your marketplace and goals.
              </p>
            </div>
          </div>
          <div className="h-auto w-full rounded-[4px] bg-white px-[31px] py-[40px] shadow-[0_1px_13px_rgba(0,0,0,0.05)] lg:h-[457px] lg:w-[800px]">
            <form onSubmit={sendMessage}>
              <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3">
                <input
                  name="name" value={form.name} onChange={handleChange} placeholder="Your Name *"
                  className="h-[50px] rounded-[4px] bg-[#F5F5F5] px-[16px] poppins text-[16px] outline-none placeholder:text-black/40"
                />
                <input
                  name="email" value={form.email} onChange={handleChange} placeholder="Your Email *"
                  className="h-[50px] rounded-[4px] bg-[#F5F5F5] px-[16px] poppins text-[16px] outline-none placeholder:text-black/40"
                />
                <input
                  name="phone" value={form.phone} onChange={handleChange} placeholder="Your Phone *"
                  className="h-[50px] rounded-[4px] bg-[#F5F5F5] px-[16px] poppins text-[16px] outline-none placeholder:text-black/40"
                />
              </div>

              <textarea
                name="message" value={form.message} onChange={handleChange} className="mt-[32px] h-[207px] w-full resize-none rounded-[4px] bg-[#F5F5F5] px-[16px] py-[13px] poppins text-[16px] outline-none placeholder:text-black/40"
              />

              <div className="mt-[32px] flex justify-end">
                <button disabled={loading} className="h-[56px] w-[215px] cursor-pointer hover:opacity-85 rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium text-white">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}