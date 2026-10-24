"use client";

import { authClient } from "../../lib/auth-client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignUp() {
  const [step, setStep] = useState("details");
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validateStep1 = () => {
    let newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateOtp = () => {
    let newErrors = {};

    if (!otp.trim()) newErrors.otp = "OTP is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);
  const formatTime = (time) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setLoading(true);

    const emailValue = email.trim().toLowerCase();

    const checkRes = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailValue }),
    });

    const checkData = await checkRes.json();

    if (!checkRes.ok) {
      setLoading(false);
      toast.error(checkData.error || "Email check failed");
      return;
    }

    if (checkData.exists) {
      setLoading(false);
      setErrors((prev) => ({
        ...prev,
        email: "This email is already registered",
      }));
      return;
    }

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: emailValue,
        password,
      }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "OTP send failed");
      return;
    }

    toast.success("OTP email par send ho gaya");
    setStep("otp");
    setSeconds(300);
  };
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    setLoading(true);

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp,
        name: name.trim(),
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      toast.error(data.error || "Invalid OTP");
      return;
    }

    const loginRes = await authClient.signIn.email({
      email: email.trim().toLowerCase(),
      password,
      rememberMe: true,
    });

    if (loginRes?.error) {
      setLoading(false);
      toast.error(loginRes.error.message || "Login failed after signup");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const session = await authClient.getSession();

    setLoading(false);

    if (!session?.data?.user) {
      toast.error("Session create nahi hua");
      return;
    }
    toast.success("Account created successfully");
    router.replace("/");
    router.refresh();
  };
  return (
    <section className="w-full mx-auto max-w-[1440px] bg-white pt-15 pb-[100px]">
      <div className="flex max-w-[1305px] items-center gap-[100px]">
        <div className="hidden h-[781px] w-[750px] overflow-hidden rounded-r-[4px] lg:block">
          <img
            src="/images/Side Image.png"
            alt="Shopping"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="w-full px-6 lg:w-[371px] lg:px-0">
          <div className="w-full">
            <h1 className="inter text-[36px] font-medium leading-[30px] tracking-[0.04em] text-black">
              Create an account
            </h1>

            <p className="mt-[24px] poppins text-[16px] leading-[24px] text-black">
              Enter your details below
            </p>
            {step === "details" && (
              <form className="mt-[48px]" onSubmit={handleSignup}>
                <div className="space-y-[40px]">
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrors({ ...errors, name: "" });
                      }}
                      placeholder="Name"
                      className="h-[32px] w-full border-b border-black/50 bg-transparent poppins outline-none focus:outline-none focus:ring-0"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({ ...errors, email: "" });
                      }}
                      placeholder="Email"
                      className="h-[32px] w-full border-b border-black/50 bg-transparent poppins outline-none focus:outline-none focus:ring-0"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors({ ...errors, password: "" });
                      }}
                      placeholder="Password"
                      className="h-[32px] w-full border-b border-black/50 bg-transparent poppins outline-none focus:outline-none focus:ring-0"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm">{errors.password}</p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-[40px] cursor-pointer hover:opacity-85 h-[56px] w-full rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium text-white disabled:opacity-60"
                >
                  {loading ? "Sending OTP..." : "Create Account"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await authClient.signIn.social({
                      provider: "google",
                      callbackURL: "/",
                    });
                  }}
                  className="mt-[16px] cursor-pointer hover:opacity-85 flex h-[56px] w-full items-center justify-center gap-[16px] rounded-[4px] border border-black/40 poppins text-[16px] text-black"
                >
                  <span className="text-[22px]">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_2864_3667)">
                        <path
                          d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.50253 14.3003C4.99987 12.8099 4.99987 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
                          fill="#FBBC04"
                        />
                        <path
                          d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
                          fill="#EA4335"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2864_3667">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  Sign up with Google
                </button>
                <p className="mt-[32px] text-center poppins text-[16px] leading-[24px] text-black/70">
                  Already have account?{" "}
                  <Link
                    href="/login"
                    className="border-b border-black text-black"
                  >
                    Log in
                  </Link>
                </p>
              </form>
            )}

            {step === "otp" && (
              <form className="mt-[48px]" onSubmit={verifyOtp}>
                <div className="space-y-[24px]">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setErrors({ ...errors, otp: "" });
                    }}
                    placeholder="Enter OTP"
                    className="h-[32px] w-full border-b border-black/50 bg-transparent poppins outline-none focus:outline-none focus:ring-0"
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-sm">{errors.otp}</p>
                  )}

                  <p className="poppins text-[14px] text-black/60">
                    OTP sent to{" "}
                    <span className="text-black">
                      {email.trim().toLowerCase()}
                    </span>
                  </p>

                  <p className="poppins text-[14px] text-black/60">
                    OTP expires in{" "}
                    <span className="font-semibold text-[#F97316]">
                      {formatTime(seconds)}
                    </span>
                  </p>
                </div>

                {seconds === 0 && (
                  <button
                    type="button"
                    onClick={handleSignup}
                    className="mt-[16px] poppins text-[14px] text-[#F97316]"
                  >
                    Resend OTP
                  </button>
                )}

                <button
                  disabled={loading || seconds === 0}
                  className="mt-[40px] cursor-pointer hover:opacity-85 h-[56px] w-full rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium text-white disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify otp"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="mt-[16px] cursor-pointer hover:opacity-85 flex h-[56px] w-full items-center justify-center rounded-[4px] border border-black/40 poppins text-[16px] text-black"
                >
                  Change Email
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
