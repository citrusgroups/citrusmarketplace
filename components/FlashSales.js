"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { getSalePrice } from "../lib/getSalePrice";

export default function FlashSales() {
    const scrollRef = useRef(null);
    const scrolRef = useRef(null);
    const scrollProducts = (direction) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -300 : 300,
            behavior: "smooth",
        });
    };
    const scrollcategory = (direction) => {
        if (!scrolRef.current) return;
        scrolRef.current.scrollBy({
            left: direction === "left" ? -300 : 300,
            behavior: "smooth",
        });
    };
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState([])

    const bestSellingProducts = products.filter((p) => p.isBestSelling);
    const featuredProducts = products.filter((p) => p.isFeatured);


    useEffect(() => {
        const getCategory = async () => {
            const res = await fetch("/api/admin/categories");
            const data = await res.json();
            setCategory(data.categories || []);
        }
        getCategory();
    }, []);
    useEffect(() => {
        const getProducts = async () => {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        };

        getProducts();
    }, []);
    const [timeLeft, setTimeLeft] = useState({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
    });
    const [settings, setSettings] = useState(null);
    const saleEndTime = settings?.flashSaleEndTime;
    const saleActive =
        settings?.flashSaleEnabled &&
        new Date() >= new Date(settings?.flashSaleStartTime) &&
        new Date() <= new Date(settings?.flashSaleEndTime);

    useEffect(() => {
        const getSettings = async () => {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();

            setSettings(data);
        };

        getSettings();
    }, []);
    useEffect(() => {
        if (!saleEndTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const end = new Date(saleEndTime);

            const diff = end - now;

            if (diff <= 0) {
                clearInterval(interval);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (diff % (1000 * 60 * 60 * 24)) /
                (1000 * 60 * 60)
            );

            const minutes = Math.floor(
                (diff % (1000 * 60 * 60)) /
                (1000 * 60)
            );

            const seconds = Math.floor(
                (diff % (1000 * 60)) /
                1000
            );

            setTimeLeft({
                days: String(days).padStart(2, "0"),
                hours: String(hours).padStart(2, "0"),
                minutes: String(minutes).padStart(2, "0"),
                seconds: String(seconds).padStart(2, "0"),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [saleEndTime]);
    const changeColor = (productId, colorIndex) => {
        setProducts((prev) =>
            prev.map((item) =>
                item.id === productId
                    ? { ...item, selectedColor: colorIndex }
                    : item
            )
        );
    };
    const addToCart = useCartStore(
        (state) => state.addToCart
    );
    const wishlist = useWishlistStore((state) => state.wishlist);
    const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
    const flashProducts = saleActive
        ? products.filter((p) => p.isFlashSale)
        : [];

    return (
        <>
            <section className="w-full overflow-hidden border-b border-[#ECECEC] bg-white py-[40px]">
                <div className="mx-auto max-w-[1170px] px-4 py-20 lg:px-0">
                    <div className="mb-[40px] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="mb-[24px] flex items-center gap-[16px]">
                                <span className="h-[40px] w-[20px] rounded-[4px] bg-[#F97316]" />
                                <p className="poppins text-[16px] font-semibold leading-[20px] text-[#F97316]">
                                    Today’s
                                </p>
                            </div>

                            <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-[87px]">
                                <h2 className="inter text-[32px] font-semibold leading-[42px] tracking-[0.04em] text-black md:text-[36px] md:leading-[48px]">
                                    Flash Sales
                                </h2>

                                <div className="flex items-end gap-[10px] overflow-x-auto md:gap-[17px]">
                                    {[
                                        { label: "Days", value: timeLeft.days },
                                        { label: "Hours", value: timeLeft.hours },
                                        { label: "Minutes", value: timeLeft.minutes },
                                        { label: "Seconds", value: timeLeft.seconds },
                                    ].map((item, i) => (
                                        <div
                                            key={item.label}
                                            className="flex shrink-0 overflow-hidden items-end gap-[10px] md:gap-[17px]"
                                        >
                                            <div>
                                                <p className="poppins text-[12px] font-medium leading-[18px]">
                                                    {item.label}
                                                </p>

                                                <p className="inter text-[28px] font-bold leading-[30px] tracking-[0.04em] md:text-[32px]">
                                                    {item.value}
                                                </p>
                                            </div>

                                            {i !== 3 && (
                                                <span className="pb-[4px] text-[24px] font-bold text-[#EA580C] md:text-[28px]">
                                                    :
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="hidden gap-[8px] md:flex">
                            <button
                                onClick={() => scrollProducts("left")}
                                className="flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-full bg-[#F5F5F5] hover:opacity-85"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                            </button>

                            <button
                                onClick={() => scrollProducts("right")}
                                className="flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-full bg-[#F5F5F5] hover:opacity-85"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div
                        ref={scrollRef}
                        className="-mx-4 overflow-x-auto scroll-smooth px-4 pb-2 lg:mx-0 lg:w-[calc(100%+138px)] lg:px-0 [&::-webkit-scrollbar]:hidden"
                    >
                        <div className="flex h-[350px] w-max gap-[20px] xl:gap-[19px] md:gap-[30px]">
                            {flashProducts.map((product) => {
                                const isFavourite = wishlist.some(
                                    (item) => item.id === product.id
                                );
                                const salePrice =
                                    saleActive && product.isFlashSale
                                        ? Math.round(
                                            product.basePrice -
                                            (product.basePrice *
                                                settings.flashSaleDiscountPercent) /
                                            100
                                        )
                                        : product.basePrice;
                                return (
                                    <div key={product.id} className="h-[350px] w-[270px] shrink-0">
                                        <div className="group relative h-[250px] w-[270px] overflow-hidden rounded-[4px] bg-[#F5F5F5]">
                                            {saleActive && product.isFlashSale && (
                                                <span className="absolute left-[12px] top-[12px] z-30 rounded-[4px] bg-[#F97316] px-[12px] py-[4px] text-white">
                                                    -{settings.flashSaleDiscountPercent}%
                                                </span>
                                            )}
                                            <div className="absolute right-[12px] top-[12px] z-10 flex flex-col gap-[8px]">
                                                <button onClick={() => toggleWishlist(product)} className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white hover:opacity-85">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill={isFavourite ? "#F97316" : "none"}
                                                        viewBox="0 0 24 24"
                                                        strokeWidth="1.5"
                                                        stroke={isFavourite ? "#F97316" : "currentColor"}
                                                        className="size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                                        />
                                                    </svg>
                                                </button>

                                                <Link href={`/product/${product.id}`} className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white hover:opacity-85">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /> </svg>
                                                </Link>
                                            </div>

                                            <div className="absolute left-1/2 top-[35px] z-0 flex h-[180px] w-[190px] -translate-x-1/2 items-center justify-center">
                                                <img
                                                    src={product.images?.[0]?.imageUrl || "/images/placeholder.png"}
                                                    alt={product.name}
                                                    className="h-[180px] w-[190px] object-contain"
                                                />
                                            </div>

                                            <button onClick={() => addToCart(product)} className="absolute bottom-0 left-0 h-[41px] w-full translate-y-full cursor-pointer bg-black poppins text-[12px] font-medium text-white transition duration-300 group-hover:translate-y-0">
                                                Add To Cart
                                            </button>
                                        </div>

                                        <h3 className="mt-[16px] poppins text-[16px] font-medium leading-[24px] text-black">
                                            {product.name}
                                        </h3>

                                        <div className="mt-[8px] flex gap-[12px] poppins text-[16px] font-medium leading-[24px]">
                                            <span className="text-[#F97316]">
                                                ${salePrice}
                                            </span>

                                            {saleActive && product.isFlashSale && (
                                                <span className="text-black/50 line-through">
                                                    ${product.basePrice}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-[8px] flex items-center gap-[8px]">
                                            <span className="text-[20px] text-[#FFAD33]">
                                                {"★".repeat(Math.round(product.averageRating || 0))}
                                                {"☆".repeat(5 - Math.round(product.averageRating || 0))}
                                            </span>
                                            <span className="poppins text-[14px] font-semibold text-black/50">
                                                {product.totalReviews || 0}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    </div>

                    <div className="mt-[60px] flex justify-center">
                        <Link href="/products" className="flex justify-center items-center h-[56px] w-[234px] cursor-pointer rounded-[4px] bg-[#F97316] text-[16px] font-medium text-white hover:opacity-85">
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>
            <section className="mx-auto w-full mt-20 overflow-hidden bg-white pb-12 border-b border-[#ECECEC] sm:pb-16 lg:pb-20">
                <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
                    <div className="mb-[40px] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="mb-[24px] flex items-center gap-[16px]">
                                <span className="h-[40px] w-[20px] rounded-[4px] bg-[#F97316]" />
                                <p className="poppins text-[16px] font-semibold leading-[20px] text-[#F97316]">
                                    Categories
                                </p>
                            </div>

                            <div className="flex items-end">
                                <h2 className="inter text-[28px] font-semibold leading-[36px] tracking-[0.04em] text-black sm:text-[32px] sm:leading-[42px] md:text-[36px] md:leading-[48px]">
                                    Browse By Category
                                </h2>
                            </div>
                        </div>

                        <div className="hidden gap-[8px] md:flex">
                            <button
                                onClick={() => scrollcategory("left")}
                                className="flex h-[46px] w-[46px] items-center justify-center cursor-pointer hover:opacity-85 rounded-full bg-[#F5F5F5]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                            </button>

                            <button
                                onClick={() => scrollcategory("right")}
                                className="flex h-[46px] w-[46px] items-center justify-center cursor-pointer hover:opacity-85 rounded-full bg-[#F5F5F5]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div
                        ref={scrolRef}
                        className="-mx-4 flex gap-[20px] overflow-x-auto scroll-smooth px-4 pb-2 sm:gap-[30px] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
                    >
                        {category.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.slug}`}
                                onClick={() => setSelectedCategory(cat.slug)}
                                className={`flex h-[145px] w-[170px] shrink-0 flex-col items-center justify-center gap-[16px] cursor-pointer hover:opacity-85 rounded-[4px] border ${selectedCategory === cat.slug
                                    ? "border-[#F97316] bg-[#F97316] text-white"
                                    : "border-black/30 bg-white text-black"
                                    }`}
                            >
                                {cat.icon ? (
                                    <img
                                        src={cat.icon}
                                        alt={cat.name}
                                        className={`h-14 w-14 ${selectedCategory === cat.slug ? "invert brightness-0" : ""
                                            }`}
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] text-[20px]">
                                        {cat.name?.charAt(0)}
                                    </div>
                                )}
                                <span className="poppins text-[16px] leading-[24px]">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            <section className="mx-auto w-full overflow-hidden border-b border-[#ECECEC] bg-white py-12 sm:py-16 lg:py-20">
                <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
                    <div className="mb-[40px] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="mb-[24px] flex items-center gap-[16px]">
                                <span className="h-[40px] w-[20px] rounded-[4px] bg-[#F97316]" />
                                <p className="poppins text-[16px] font-semibold leading-[20px] text-[#F97316]">
                                    This Month
                                </p>
                            </div>

                            <div className="flex items-end">
                                <h2 className="inter text-[28px] font-semibold leading-[36px] tracking-[0.04em] text-black sm:text-[32px] sm:leading-[42px] md:text-[36px] md:leading-[48px]">
                                    Best Selling Products
                                </h2>
                            </div>
                        </div>

                        <div className="hidden gap-[8px] md:flex">
                            <Link href="/products" className="flex justify-center items-center h-[56px] w-[159px] rounded-[4px] cursor-pointer bg-[#F97316] text-[16px] font-medium text-white hover:opacity-85">
                                View All
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 justify-items-center gap-[30px] sm:grid-cols-2 lg:grid-cols-4 lg:justify-items-start">
                        {bestSellingProducts.map((product) => {
                            const isFavourite = wishlist.some(
                                (item) => item.id === product.id
                            );
                            return (
                                <div
                                    key={product.id}
                                    className="w-full max-w-[270px]"
                                >
                                    <div className="group relative h-[250px] w-full max-w-[270px] overflow-hidden rounded-[4px] bg-[#F5F5F5]">
                                        <div className="absolute right-[12px] top-[12px] flex flex-col gap-[8px]">
                                            <button onClick={() => toggleWishlist(product)} className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white hover:opacity-85">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill={isFavourite ? "#F97316" : "none"}
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke={isFavourite ? "#F97316" : "currentColor"}
                                                    className="size-6"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                                    />
                                                </svg>
                                            </button>

                                            <Link href={`/product/${product.id}`} className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white hover:opacity-85">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /> </svg>
                                            </Link>
                                        </div>

                                        <div className="absolute left-1/2 top-[35px] flex h-[180px] w-[190px] -translate-x-1/2 items-center justify-center">
                                            <img
                                                src={product.images?.[0]?.imageUrl || "/images/placeholder.png"}
                                                alt={product.name}
                                                className="h-[180px] w-[190px] object-contain"
                                            />
                                        </div>

                                        <button onClick={() => addToCart(product)} className="absolute bottom-0 left-0 h-[41px] w-full translate-y-full cursor-pointer bg-black poppins text-[12px] font-medium text-white transition duration-300 group-hover:translate-y-0">
                                            Add To Cart
                                        </button>
                                    </div>

                                    <h3 className="mt-[16px] poppins text-[16px] font-medium leading-[24px] text-black">
                                        {product.name}
                                    </h3>

                                    <div className="mt-[8px] flex gap-[12px] poppins text-[16px] font-medium leading-[24px]">
                                        <span className="text-[#F97316]">{product.basePrice}</span>
                                        <span className="text-black/50 line-through">{product.oldPrice}</span>
                                    </div>

                                    <div className="mt-[8px] flex items-center gap-[8px]">
                                        <span className="text-[20px] text-[#FFAD33]">
                                            {"★".repeat(Math.round(product.averageRating || 0))}
                                            {"☆".repeat(5 - Math.round(product.averageRating || 0))}
                                        </span>
                                        <span className="poppins text-[14px] font-semibold text-black/50">
                                            {product.totalReviews || 0}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                    </div>

                    <div className="mt-[40px] flex justify-center md:hidden">
                        <Link href="/products" className="flex justify-center items-center h-[56px] w-[159px] cursor-pointer rounded-[4px] bg-[#F97316] text-[16px] font-medium text-white hover:opacity-85">
                            View All
                        </Link>
                    </div>
                </div>
            </section>
            <section className="w-full bg-black py-12 sm:py-16 lg:py-[70px]">
                <div className="mx-auto flex max-w-[1170px] flex-col-reverse items-center justify-between gap-10 bg-black px-6 py-10 sm:px-10 lg:min-h-[500px] lg:flex-row lg:px-[56px] lg:py-[37px]">

                    {/* Content */}
                    <div className="max-w-[443px] text-center lg:text-left">
                        <p className="poppins text-[16px] font-semibold leading-[20px] text-[#00FF66]">
                            Categories
                        </p>

                        <h2 className="mt-[20px] sm:mt-[24px] lg:mt-[32px] inter text-[30px] leading-[40px] sm:text-[40px] sm:leading-[50px] lg:text-[48px] lg:leading-[60px] font-semibold tracking-[0.04em] text-white">
                            Enhance Your <br /> Music Experience
                        </h2>

                        <div className="mt-[24px] flex flex-wrap justify-center gap-4 lg:mt-[32px] lg:justify-start lg:gap-[24px]">
                            {[
                                { value: "23", label: "Hours" },
                                { value: "05", label: "Days" },
                                { value: "59", label: "Minutes" },
                                { value: "35", label: "Seconds" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex h-[62px] w-[62px] flex-col items-center justify-center rounded-full bg-white text-black"
                                >
                                    <span className="poppins text-[16px] font-semibold leading-[20px]">
                                        {item.value}
                                    </span>
                                    <span className="poppins text-[11px] font-normal leading-[18px]">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button className="mt-[32px] h-[56px] w-[171px] cursor-pointer rounded-[4px] bg-[#00FF66] poppins text-[16px] font-medium text-white hover:opacity-85 lg:mt-[40px]">
                            Buy Now!
                        </button>
                    </div>

                    {/* Image */}
                    <div className="relative flex w-full justify-center lg:h-[420px] lg:w-[600px]">
                        <img
                            src="/images/Frame 694.png"
                            alt="Music speaker"
                            className="h-auto w-full max-w-[280px] object-contain sm:max-w-[420px] lg:h-[420px] lg:w-[600px] xl:max-w-[568px]"
                        />
                    </div>

                </div>
            </section>
            <section className="w-full bg-white py-12 sm:py-16 lg:py-[70px]">
                <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
                    <div className="mb-[40px] flex flex-col gap-6 md:mb-[60px] md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="mb-[20px] flex items-center gap-[16px]">
                                <span className="h-[40px] w-[20px] rounded-[4px] bg-[#F97316]" />
                                <p className="poppins text-[16px] font-semibold leading-[20px] text-[#F97316]">
                                    Our Products
                                </p>
                            </div>

                            <h2 className="inter text-[28px] font-semibold leading-[36px] tracking-[0.04em] text-black sm:text-[32px] sm:leading-[42px] md:text-[36px] md:leading-[48px]">
                                Explore Our Products
                            </h2>
                        </div>

                        <div className="hidden gap-[8px] md:flex">
                            <button className="flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-full bg-[#F5F5F5] hover:opacity-85">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                            </button>

                            <button className="flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-full bg-[#F5F5F5] hover:opacity-85">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 justify-items-center gap-x-[30px] gap-y-[48px] sm:grid-cols-2 lg:grid-cols-4 lg:justify-items-start lg:gap-y-[60px]">
                        {featuredProducts.map((product) => {
                            const selectedIndex = product.selectedColor ?? 0;
                            const selectedVariant = product.variants?.[selectedIndex];
                            const selectedImage =
                                product.images?.find((img) => img.variantId === selectedVariant?.id)?.imageUrl ||
                                product.images?.find((img) => img.color === selectedVariant?.color)?.imageUrl ||
                                product.images?.[0]?.imageUrl ||
                                "/images/Frame 611.png";
                            const isNew =
                                Date.now() - new Date(product.createdAt).getTime() <
                                7 * 24 * 60 * 60 * 1000;
                            const isFavourite = wishlist.some(
                                (item) => item.id === product.id
                            );
                            return (
                                <div key={product.id} className="w-full max-w-[270px]">
                                    <div className="group relative h-[250px] w-full max-w-[270px] overflow-hidden rounded-[4px] bg-[#F5F5F5]">
                                        <div className="absolute left-[12px] top-[12px] z-30 flex flex-col gap-2">
                                            {product.discountPercent && (
                                                <span className="rounded-[4px] bg-[#F97316] px-[12px] py-[4px] text-[12px] text-white">
                                                    -{product.discountPercent}%
                                                </span>
                                            )}

                                            {isNew && (
                                                <span className="rounded-[4px] bg-[#00C853] px-[12px] py-[4px] text-[12px] text-white">
                                                    NEW
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute right-[12px] top-[12px] flex flex-col gap-[8px] z-10">
                                            <button onClick={() => toggleWishlist(product)} className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white hover:opacity-85">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill={isFavourite ? "#F97316" : "none"}
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke={isFavourite ? "#F97316" : "currentColor"}
                                                    className="size-6"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                                    />
                                                </svg>
                                            </button>
                                            <Link href={`/product/${product.id}`} className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white hover:opacity-85 "> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /> </svg> </Link>
                                        </div>
                                        <div className="absolute left-1/2 top-[35px] z-0 flex h-[180px] w-[190px] -translate-x-1/2 items-center justify-center">
                                            <img
                                                src={product.hasVariants ? selectedImage : product.images?.[0]?.imageUrl || "/images/Frame 611.png"}
                                                alt={product.name}
                                                className="h-[180px] w-[190px] object-contain"
                                            />
                                        </div>

                                        <button onClick={() => addToCart(product)} className="absolute bottom-0 left-0 h-[41px] w-full translate-y-full cursor-pointer bg-black poppins text-[12px] font-medium text-white transition duration-300 group-hover:translate-y-0">
                                            Add To Cart
                                        </button>
                                    </div>

                                    <h3 className="mt-[16px] poppins text-[16px] font-medium leading-[24px] text-black">
                                        {product.name}
                                    </h3>

                                    <div className="mt-[8px] flex flex-wrap items-center gap-[8px] poppins text-[16px] font-medium leading-[24px]">
                                        <span className="text-[#F97316]">{product.basePrice}</span>
                                        <span className="text-[20px] text-[#FFAD33]">
                                            {"★".repeat(Math.round(product.averageRating || 0))}
                                            {"☆".repeat(5 - Math.round(product.averageRating || 0))}
                                        </span>
                                        <span className="poppins text-[14px] font-semibold text-black/50">
                                            {product.totalReviews || 0}
                                        </span>
                                    </div>


                                    {product.variants?.length > 1 && (
                                        <div className="mt-2 flex gap-2">
                                            {product.variants.map((variant, index) => (
                                                <button
                                                    key={variant.id}
                                                    onClick={() => changeColor(product.id, index)}
                                                    className={`h-5 w-5 rounded-full border ${(product.selectedColor ?? 0) === index
                                                        ? "border-2 border-black"
                                                        : "border-black/30"
                                                        }`}
                                                    style={{ backgroundColor: variant.color }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-[60px] flex justify-center">
                        <Link href="/products" className="flex justify-center items-center h-[56px] w-[234px] cursor-pointer rounded-[4px] bg-[#F97316] poppins text-[16px] font-medium text-white hover:opacity-85">
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>
            <section className="w-full bg-white py-12 sm:py-16 lg:py-[70px]">
                <div className="mx-auto max-w-[1170px] px-4 lg:px-0">
                    <div className="mb-[40px] flex items-end justify-between lg:mb-[60px]">
                        <div>
                            <div className="mb-[20px] flex items-center gap-[16px]">
                                <span className="h-[40px] w-[20px] rounded-[4px] bg-[#F97316]" />
                                <p className="poppins text-[16px] font-semibold leading-[20px] text-[#F97316]">
                                    Featured
                                </p>
                            </div>

                            <h2 className="inter text-[28px] font-semibold leading-[36px] tracking-[0.04em] text-black sm:text-[32px] sm:leading-[42px] md:text-[36px] md:leading-[48px]">
                                New Arrival
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-[30px] lg:grid-cols-2">
                        <div className="relative h-[420px] overflow-hidden rounded-[4px] bg-black sm:h-[520px] lg:h-[600px]">
                            <img
                                src="/images/one.png"
                                alt="PlayStation 5"
                                className="absolute bottom-0 left-0 h-full w-full object-cover"
                            />

                            <div className="absolute bottom-[24px] left-[24px] text-white sm:bottom-[32px] sm:left-[32px]">
                                <h3 className="inter text-[24px] font-semibold leading-[24px]">
                                    PlayStation 5
                                </h3>
                                <p className="mt-[16px] max-w-[242px] poppins text-[14px] leading-[21px]">
                                    Black and White version of the PS5 coming out on sale.
                                </p>
                                <button className="mt-[16px] cursor-pointer border-b border-[#5D5D5D] poppins text-[16px] font-medium hover:opacity-85">
                                    Shop Now
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-[30px] sm:grid-cols-2 lg:h-[600px]">
                            <div className="relative h-[284px] overflow-hidden rounded-[4px] bg-black sm:col-span-2">
                                <img
                                    src="/images/tow.jpg"
                                    alt="Women’s Collections"
                                    className="absolute right-0 top-0 h-full max-h-[286px] w-full max-w-[432px] object-cover scale-x-[-1]"
                                />

                                <div className="absolute bottom-[24px] left-[24px] text-white">
                                    <h3 className="inter text-[22px] font-semibold sm:text-[24px]">
                                        Women’s Collections
                                    </h3>
                                    <p className="mt-[16px] max-w-[255px] poppins text-[14px] leading-[21px]">
                                        Featured woman collections that give you another vibe.
                                    </p>
                                    <button className="mt-[16px] cursor-pointer border-b border-[#5D5D5D] poppins text-[16px] font-medium hover:opacity-85">
                                        Shop Now
                                    </button>
                                </div>
                            </div>

                            <div className="relative h-[284px] overflow-hidden rounded-[4px] bg-black">
                                <img
                                    src="/images/four.png"
                                    alt="Speakers"
                                    className="absolute left-10 top-4 h-full w-full object-cover"
                                />

                                <div className="absolute bottom-[24px] left-[24px] text-white">
                                    <h3 className="inter text-[24px] font-semibold">Speakers</h3>
                                    <p className="mt-[8px] poppins text-[14px] leading-[21px]">
                                        Amazon wireless speakers
                                    </p>
                                    <button className="mt-[8px] cursor-pointer border-b border-[#5D5D5D] poppins text-[16px] font-medium hover:opacity-85">
                                        Shop Now
                                    </button>
                                </div>
                            </div>

                            <div className="relative h-[286px] overflow-hidden rounded-[4px] bg-[#000000]">
                                <img
                                    src="/images/three.png"
                                    alt="Perfume"
                                    className="absolute inset-0 left-0 top-0 h-full w-full"
                                />

                                <div className="absolute bottom-[24px] left-[24px] text-white">
                                    <h3 className="inter text-[24px] font-semibold">Perfume</h3>
                                    <p className="mt-[8px] poppins text-[14px] leading-[21px]">
                                        GUCCI INTENSE OUD EDP
                                    </p>
                                    <button className="mt-[8px] cursor-pointer border-b border-[#5D5D5D] poppins text-[16px] font-medium hover:opacity-85">
                                        Shop Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="w-full max-w-[1260px] mx-auto bg-white pb-8 pt-[80px]">
                <div className="mx-auto max-w-[943px]">
                    <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative h-[80px] w-[80px] rounded-full bg-[#C1C1C1]">
                                <div className="absolute left-[11px] top-[11px] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-black">
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_2829_272)">
                                            <path d="M11.6667 31.6667C13.5076 31.6667 15 30.1743 15 28.3333C15 26.4924 13.5076 25 11.6667 25C9.82573 25 8.33334 26.4924 8.33334 28.3333C8.33334 30.1743 9.82573 31.6667 11.6667 31.6667Z" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M28.3333 31.6667C30.1743 31.6667 31.6667 30.1743 31.6667 28.3333C31.6667 26.4924 30.1743 25 28.3333 25C26.4924 25 25 26.4924 25 28.3333C25 30.1743 26.4924 31.6667 28.3333 31.6667Z" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M8.33331 28.3335H6.99998C5.89541 28.3335 4.99998 27.4381 4.99998 26.3335V21.6668M3.33331 8.3335H19.6666C20.7712 8.3335 21.6666 9.22893 21.6666 10.3335V28.3335M15 28.3335H25M21.6666 10.0002H28.8676C29.5701 10.0002 30.2211 10.3688 30.5826 10.9712L35 18.3335V26.3335C35 27.4381 34.1046 28.3335 33 28.3335H31.6667M35 18.3335H21.6666" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M8 28H6.66667C5.5621 28 4.66667 27.1046 4.66667 26V21.3333M3 8H19.3333C20.4379 8 21.3333 8.89543 21.3333 10V28M15 28H24.6667M21.3333 9.66667H28.5343C29.2368 9.66667 29.8878 10.0353 30.2493 10.6377L34.6667 18V26C34.6667 27.1046 33.7712 28 32.6667 28H32M34.6667 18H21.3333" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M5 11.8184H11.6667" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M1.81818 15.4546H8.48484" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M5 19.0908H11.6667" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_2829_272">
                                                <rect width="40" height="40" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>


                                </div>
                            </div>

                            <h3 className="mt-[24px] poppins text-[20px] font-semibold leading-[28px]">
                                FREE AND FAST DELIVERY
                            </h3>

                            <p className="mt-[8px] poppins text-[14px] leading-[21px] text-black">
                                Free delivery for all orders over $140
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="relative h-[80px] w-[80px] rounded-full bg-[#C1C1C1]">
                                <div className="absolute left-[11px] top-[11px] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-black">
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_2829_310)">
                                            <path d="M13.3334 24.9998C13.3334 23.1589 11.841 21.6665 10 21.6665C8.15907 21.6665 6.66669 23.1589 6.66669 24.9998V28.3332C6.66669 30.1741 8.15907 31.6665 10 31.6665C11.841 31.6665 13.3334 30.1741 13.3334 28.3332V24.9998Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M33.3334 24.9998C33.3334 23.1589 31.841 21.6665 30 21.6665C28.1591 21.6665 26.6667 23.1589 26.6667 24.9998V28.3332C26.6667 30.1741 28.1591 31.6665 30 31.6665C31.841 31.6665 33.3334 30.1741 33.3334 28.3332V24.9998Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M6.66669 24.9998V19.9998C6.66669 16.4636 8.07145 13.0722 10.5719 10.5717C13.0724 8.07126 16.4638 6.6665 20 6.6665C23.5362 6.6665 26.9276 8.07126 29.4281 10.5717C31.9286 13.0722 33.3334 16.4636 33.3334 19.9998V24.9998" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M30 31.6665C30 32.9926 28.9464 34.2644 27.0711 35.202C25.1957 36.1397 22.6522 36.6665 20 36.6665" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_2829_310">
                                                <rect width="40" height="40" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>

                                </div>
                            </div>

                            <h3 className="mt-[24px] poppins text-[20px] font-semibold leading-[28px]">
                                24/7 CUSTOMER SERVICE
                            </h3>

                            <p className="mt-[8px] poppins text-[14px] leading-[21px] text-black">
                                Friendly 24/7 customer support
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="relative h-[80px] w-[80px] rounded-full bg-[#C1C1C1]">
                                <div className="absolute left-[11px] top-[11px] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-black">
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.983 2.5874C21.0046 2.5874 22.004 2.73663 22.7574 3.01807L31.0748 6.13525H31.0758C33.2953 6.96202 35.0504 9.50761 35.0504 11.8667V24.2495C35.0504 25.3367 34.7062 26.5895 34.1237 27.7485C33.5777 28.8348 32.8403 29.8024 32.0309 30.4556L31.8678 30.5825L24.7008 35.9321L24.6949 35.937C23.4122 36.9261 21.7236 37.4331 19.9996 37.4331C18.2769 37.433 16.5846 36.9263 15.2643 35.9478H15.2633L8.09924 30.5991C7.22654 29.9484 6.4252 28.9208 5.84241 27.7593C5.25956 26.5976 4.91663 25.3447 4.91663 24.2661V11.8667C4.91663 9.50749 6.67157 6.96189 8.89124 6.13525H8.89221L17.2086 3.01807C17.962 2.73655 18.9614 2.58743 19.983 2.5874ZM20.0006 4.08545C19.202 4.08763 18.3751 4.19487 17.7418 4.43115L17.7408 4.43213L9.42444 7.54834H9.42346C8.59596 7.85993 7.85473 8.52245 7.32385 9.29053C6.79277 10.0589 6.43323 10.9898 6.43323 11.8833V24.2661C6.43323 25.1606 6.74381 26.1893 7.20081 27.1011C7.65769 28.0126 8.29305 28.8726 9.00061 29.4009L16.1676 34.7505C17.2294 35.5444 18.628 35.9252 20.0016 35.9253C21.3755 35.9253 22.7778 35.5442 23.8473 34.7515L23.8492 34.7505L31.0153 29.4009L31.0162 29.3999C31.731 28.8638 32.3666 28.0049 32.8219 27.0942C33.2772 26.1836 33.5836 25.1596 33.5836 24.2661V11.8667C33.5836 10.9807 33.2232 10.0539 32.693 9.28662C32.1625 8.51907 31.422 7.85386 30.5973 7.53369L30.5924 7.53174L22.275 4.41455L22.2662 4.41162C21.6281 4.18643 20.8 4.08327 20.0006 4.08545Z" fill="#FAFAFA" stroke="#FAFAFA" />
                                        <path d="M24.4039 14.77C24.692 14.4822 25.1755 14.482 25.4635 14.77C25.7514 15.058 25.7513 15.5415 25.4635 15.8296L18.2965 22.9966C18.1452 23.1478 17.9574 23.2163 17.7662 23.2163C17.5752 23.2162 17.3881 23.1477 17.2369 22.9966L14.5533 20.313C14.2655 20.0249 14.2654 19.5414 14.5533 19.2534C14.8414 18.9654 15.3248 18.9655 15.6129 19.2534L17.7662 21.4067L18.1207 21.0532L24.4039 14.77Z" fill="#FAFAFA" stroke="#FAFAFA" />
                                    </svg>

                                </div>
                            </div>

                            <h3 className="mt-[24px] poppins text-[20px] font-semibold leading-[28px]">
                                MONEY BACK GUARANTEE
                            </h3>

                            <p className="mt-[8px] poppins text-[14px] leading-[21px] text-black">
                                We return money within 30 days
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-[62px] flex justify-end">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#F5F5F5]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 19V5m0 0-6 6m6-6 6 6"
                            />
                        </svg>
                    </button>
                </div>
            </section>
        </>
    );
}