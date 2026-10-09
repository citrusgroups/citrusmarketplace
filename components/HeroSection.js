"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function HeroSection() {
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const getBanners = async () => {
            const res = await fetch("/api/banners");
            const data = await res.json();

            if (res.ok) setBanners(data.banners || []);
        };

        const getCategories = async () => {
            const res = await fetch("/api/admin/categories");
            const data = await res.json();

            if (res.ok) setCategories(data.categories || []);
        };

        getBanners();
        getCategories();
    }, []);

    return (
        <section className="w-full bg-white">
            <div className="mx-auto flex w-full max-w-[1170px] gap-[45px] px-4 lg:px-0">
                <aside className="hidden w-[217px] shrink-0 border-r border-black/30 pt-[40px] md:block">
                    <ul className="space-y-[16px] pr-[16px] poppins text-[16px] font-normal text-black">
                        {categories.map((cat) => (
                            <li key={cat.id}>
                                <Link
                                    href={`/category/${cat.slug}`}
                                    className="flex items-center justify-between hover:text-[#F97316]"
                                >
                                    <span>{cat.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </aside>

                <div className="relative mt-[40px] h-[344px] flex-1 overflow-hidden bg-black md:max-w-[908px]">
                    {banners.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center text-white">
                            <h2 className="inter text-3xl font-semibold">Discover Citrus Marketplace</h2><p>Thoughtful products. Practical business support.</p><Link href="/products" className="rounded bg-orange-500 px-6 py-3">Explore the shop</Link>
                        </div>
                    ) : (
                        <Swiper
                            modules={[Pagination, Autoplay]}
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 4000 }}
                            loop={true}
                            className="hero-swiper h-full bg-black"
                        >
                            {banners.map((banner) => (
                                <SwiperSlide key={banner.id}>
                                    <div className="flex h-full items-center justify-between px-5 sm:px-8 lg:px-16">
                                        <div className="z-10 max-w-[300px] shrink-0 text-white sm:max-w-[360px]">
                                            <div className="mb-4 flex items-center gap-5">
                                                <img
                                                    className="h-[49px] w-[40px] object-contain"
                                                    src="/images/Apple.png"
                                                    alt="Apple"
                                                />
                                                <p className="poppins text-[14px] font-normal sm:text-[16px]">
                                                    {banner.title}
                                                </p>
                                            </div>

                                            <h2 className="inter text-[32px] font-semibold leading-[40px] tracking-[0.04em] sm:text-[42px] sm:leading-[52px] lg:text-[48px] lg:leading-[60px]">
                                                {banner.heading}
                                            </h2>

                                            <Link
                                                href={banner.buttonLink || "/products"}
                                                className="mt-6 flex w-fit items-center gap-2 poppins text-[16px] font-medium"
                                            >
                                                <span className="border-b border-white">
                                                    {banner.buttonText || "Shop Now"}
                                                </span>
                                                →
                                            </Link>
                                        </div>

                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            className="absolute bottom-0 right-[-80px] h-[260px] object-contain sm:right-[-20px] sm:h-[310px] lg:static lg:h-[320px]"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
            </div>
        </section>
    );
}