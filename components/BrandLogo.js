import Image from "next/image";
export default function BrandLogo({ dark = false, className = "w-[150px]" }) {
  return (
    <span className={`relative block shrink-0 ${className}`}>
      <Image
        src="/images/citrus-products-logo.png"
        width={2146}
        height={733}
        alt="Citrus Products"
        className={`block h-auto w-full ${dark ? "brightness-0 invert" : ""}`}
        priority
      />
      {dark && (
        <>
          <Image
            src="/images/citrus-products-logo.png"
            width={2146}
            height={733}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-auto w-full"
            style={{ clipPath: "inset(0 77% 0 0)" }}
          />
          <Image
            src="/images/citrus-products-logo.png"
            width={2146}
            height={733}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-auto w-full"
            style={{ clipPath: "inset(0 0 0 91.5%)" }}
          />
        </>
      )}
    </span>
  );
}
