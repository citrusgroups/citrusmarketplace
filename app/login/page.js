"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "../../lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const validate = () => {
        let newErrors = {};
        if (!email.trim()) {
            newErrors.email = "Email is required";
        }
        if (!password.trim()) {
            newErrors.password = "Password is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        const { error } = await authClient.signIn.email({
            email,
            password,
        });
        setLoading(false);
        if (error) {
            toast.error(error.message || "Login failed");
            return;
        }
        const session = await authClient.getSession();
        if (session?.data?.user?.role === "admin") {
            router.replace("/admin");
        } else {
            router.replace("/");
        }
        toast.success("Login successful");
    };
    return (
        <section className="w-full mx-auto max-w-[1440px] bg-white pt-15 pb-[100px]">
            <div className="flex max-w-[1305px] items-center gap-[100px]">
                <div className="hidden h-[781px] w-[750px] overflow-hidden rounded-r-[4px] lg:block">
                    <img src="/images/Side Image.png" alt="Shopping" className="h-full w-full object-cover" />
                </div>
                <div className="w-full px-6 lg:w-[371px] lg:px-0">
                    <div className="w-full">
                        <h1 className="inter text-[36px] font-medium leading-[30px] tracking-[0.04em] text-black">
                            Log in to Citrus Marketplace
                        </h1>

                        <p className="mt-[34px] poppins text-[16px] leading-[24px] text-black">
                            Enter your details below
                        </p>
                        <form onSubmit={handleLogin} className="space-y-10 mt-7">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors({ ...errors, email: "" });
                                    }}
                                    className="w-full border-b border-gray-400 p-2 outline-none"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors({ ...errors, password: "" });
                                    }}
                                    className="w-full border-b border-gray-400 p-2 outline-none"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-[20px] h-[56px] w-full rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium text-white disabled:opacity-60"
                            >
                                {loading ? "Logining in..." : "login"}
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    await authClient.signIn.social({
                                        provider: "google",
                                        callbackURL: "/",
                                    });
                                }}
                                className="cursor-pointer hover:opacity-85 flex h-[56px] w-full items-center justify-center gap-[16px] rounded-[4px] border border-black/40 poppins text-[16px] text-black"
                            >
                                <span className="text-[22px]">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_2864_3667)">
                                            <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
                                            <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853" />
                                            <path d="M5.50253 14.3003C4.99987 12.8099 4.99987 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC04" />
                                            <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_2864_3667">
                                                <rect width="24" height="24" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </span>
                                Login with Google
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}