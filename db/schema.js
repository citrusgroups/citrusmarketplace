import {
    pgTable,
    text,
    integer,
    boolean,
    timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    basePrice: integer("base_price").notNull(),
    oldPrice: integer("old_price"),
    discountPercent: integer("discount_percent"),
    categoryId: text("category_id"),
    ratingCount: integer("rating_count").default(0),
    stock: integer("stock").default(0),
    hasVariants: boolean("has_variants").default(false),
    badge: text("badge"),
    createdAt: timestamp("created_at").defaultNow(),
    isFlashSale: boolean("is_flash_sale").default(false),
    isBestSelling: boolean("is_best_selling").default(false),
    isFeatured: boolean("is_featured").default(false),
});
export const productImages = pgTable("product_images", {
    id: text("id").primaryKey(),
    productId: text("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
        .references(() => productVariants.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    color: text("color"),
    isPrimary: boolean("is_primary").default(false),
});

export const productVariants = pgTable("product_variants", {
    id: text("id").primaryKey(),

    productId: text("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),

    colorName: text("color_name"),
    color: text("color"),
    size: text("size"),

    price: integer("price"),
    stock: integer("stock").default(0),
});
export const productReviews = pgTable("product_reviews", {
    id: text("id").primaryKey(),
    productId: text("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const cart = pgTable("cart", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    productId: text("product_id").notNull(),
    variantId: text("variant_id"),
    quantity: integer("quantity").default(1),
});
export const orders = pgTable("orders", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    firstName: text("first_name"),
    companyName: text("company_name"),
    streetAddress: text("street_address"),
    apartment: text("apartment"),
    city: text("city"),
    phone: text("phone"),
    email: text("email"),
    subtotal: integer("subtotal"),
    discount: integer("discount").default(0),
    totalPrice: integer("total_price").notNull(),
    paymentMethod: text("payment_method"),
    status: text("status").default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    paymentStatus: text("payment_status").default("pending"),
    stripeSessionId: text("stripe_session_id"),
});
export const orderItems = pgTable("order_items", {
    id: text("id").primaryKey(),
    orderId: text("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    variantId: text("variant_id"),
    productName: text("product_name"),
    image: text("image"),
    quantity: integer("quantity").notNull(),
    price: integer("price").notNull(),
});
export const categories = pgTable("categories", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    icon: text("icon"),
    slug: text("slug").notNull(),
});
export const siteSettings = pgTable("site_settings", {
    id: text("id").primaryKey(),
    flashSaleEnabled: boolean("flash_sale_enabled").default(false),
    flashSaleDiscountPercent: integer(
        "flash_sale_discount_percent"
    ).default(0),
    flashSaleStartTime: timestamp(
        "flash_sale_start_time"
    ),
    flashSaleEndTime: timestamp(
        "flash_sale_end_time"
    ),
});
export const coupons = pgTable("coupons", {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    discountPercent: integer("discount_percent").notNull(),
    isActive: boolean("is_active").default(true),
    startAt: timestamp("start_at"),
    endAt: timestamp("end_at"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const contactMessages = pgTable("contact_messages", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    message: text("message").notNull(),
    status: text("status").default("unread"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const heroBanners = pgTable("hero_banners", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    heading: text("heading").notNull(),
    buttonText: text("button_text").default("Shop Now"),
    buttonLink: text("button_link").default("/"),
    image: text("image").notNull(),
    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});