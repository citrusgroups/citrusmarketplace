import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
    persist(
        (set) => ({
            wishlist: [],
            clearWishlist: () =>
                set({
                    wishlist: [],
                }),
            toggleWishlist: (product) =>
                set((state) => {
                    const exists = state.wishlist.find(
                        (item) => item.id === product.id
                    );

                    if (exists) {
                        return {
                            wishlist: state.wishlist.filter(
                                (item) => item.id !== product.id
                            ),
                        };
                    }

                    return {
                        wishlist: [
                            ...state.wishlist,
                            {
                                id: product.id,
                                name: product.name,
                                price: product.basePrice,
                                oldPrice: product.oldPrice,
                                image: product.images?.[0]?.imageUrl,
                            },
                        ],
                    };
                }),

            removeFromWishlist: (id) =>
                set((state) => ({
                    wishlist: state.wishlist.filter((item) => item.id !== id),
                })),
        }),
        {
            name: "wishlist-storage",
        }
    )
);