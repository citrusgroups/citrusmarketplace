import Link from "next/link";
import BrandLogo from "./BrandLogo";
export default function Footer() {
    const groups = [
        [
            "Shop",
            [
                ["All products", "/products"],
                ["Cart", "/cart"],
                ["Wishlist", "/wishlist"],
            ],
        ],
        [
            "Amazon services",
            [
                ["Our services", "/services"],
                ["Packages", "/packages"],
                ["Discuss your business", "/contact"],
            ],
        ],
        [
            "Company",
            [
                ["Our story", "/about"],
                ["Contact us", "/contact"],
                ["Frequently asked questions", "/faq"],
            ],
        ],
        [
            "Your account",
            [
                ["My account", "/account"],
                ["Sign in", "/login"],
                ["Create an account", "/signup"],
            ],
        ],
    ];
    return (
        <footer className="bg-[#181C18] text-white">
            <div className="mx-auto max-w-[1170px] px-4 py-16">
                <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
                    <Link href="/" className="block px-3 py-4">
                        <BrandLogo dark className="w-[190px]" />
                    </Link>
                    <p className="max-w-md text-sm leading-7 text-white/70">
                        Founded by four friends in 2024, with a shared commitment to dependable office
                        products and practical support for Amazon businesses.
                    </p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {groups.map(([title, links]) => (
                        <div key={title}>
                            <h2 className="font-semibold text-orange-400">{title}</h2>
                            <ul className="mt-5 space-y-3 text-sm text-white/80">
                                {links.map(([label, href]) => (
                                    <li key={href}>
                                        <Link href={href} className="hover:text-orange-400">
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <p className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/60">
                © {new Date().getFullYear()} Citrus Products. All rights reserved.
            </p>
        </footer>
    );
}
