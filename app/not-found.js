import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1170px] px-4 py-[80px] lg:px-0">
        <div className="mb-[140px] flex gap-[12px] poppins text-[14px] leading-[21px]">
          <Link href="/" className="text-black/50">Home</Link>
          <span className="text-black/50">/</span>
          <span className="text-black">404 Error</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <h1 className="inter text-[110px] font-medium leading-[115px] tracking-[0.03em] text-black">
            404 Not Found
          </h1>

          <p className="mt-[40px] poppins text-[16px] font-normal leading-[24px] text-black">
            Your visited page not found. You may go home page.
          </p>
          <Link
            href="/"
            className="mt-[80px] flex h-[56px] hover:opacity-85 cursor-pointer w-[254px] items-center justify-center rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium leading-[24px] text-white"
          >
            Back to home page
          </Link>
        </div>
      </div>
    </section>
  );
}