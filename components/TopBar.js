import Link from "next/link";
export default function TopBar() { return <div className="hidden h-10 items-center justify-center bg-black px-4 text-center text-xs text-white md:flex">Citrus Marketplace · Thoughtful products. Practical Amazon support. <Link href="/services" className="ml-3 underline text-orange-400">Explore services</Link></div>; }
