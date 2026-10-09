import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
    persist(
        (set) => ({
            cart: [],
            couponCode: "",
            discount: 0,
            couponApplied: false,

            setCouponCode: (code) =>
                set({
                    couponCode: code,
                }),

            setCoupon: (code, discount) =>
                set({
                    couponCode: code,
                    discount,
                    couponApplied: true,
                }),

            clearCoupon: () =>
                set({
                    couponCode: "",
                    discount: 0,
                    couponApplied: false,
                }),
            addToCart: (product) =>
                set((state) => {
                    const existing = state.cart.find(
                        (item) => item.id === product.id && item.variantId === product.variantId
                    );

                    if (existing) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === product.id && item.variantId === product.variantId
                                    ? {
                                        ...item,
                                        quantity: item.quantity + (product.quantity || 1),
                                    }
                                    : item
                            ),
                        };
                    }

                    return {
                        cart: [
                            ...state.cart,
                            {
                                id: product.id,
                                name: product.name,
                                image: product.images?.[0]?.imageUrl,
                                price: product.basePrice,
                                variantId: product.variantId,
                                quantity: product.quantity || 1,
                            },
                        ],
                    };
                }),

            removeFromCart: (id) =>
                set((state) => ({
                    cart: state.cart.filter((item) => item.id !== id),
                })),

            updateQuantity: (id, quantity) =>
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.id === id
                            ? { ...item, quantity }
                            : item
                    ),
                })),
            clearCart: () => set({ cart: [] }),
        }),
        {
            name: "cart-storage",
        }
    )
);