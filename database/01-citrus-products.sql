-- Run ONCE in the existing project's Supabase SQL Editor BEFORE deploying the updated files.
-- Rerunnable. Preserves customers, authentication, orders, products and storage.
BEGIN;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS catalog_key text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS catalog_sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS catalog_source text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS catalog_page integer;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS catalog_currency text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS catalog_notes text;
CREATE UNIQUE INDEX IF NOT EXISTS products_catalog_key_unique ON public.products(catalog_key);
ALTER TABLE public.products ALTER COLUMN base_price TYPE numeric(12,2) USING base_price::numeric;
ALTER TABLE public.products ALTER COLUMN old_price TYPE numeric(12,2) USING old_price::numeric;
ALTER TABLE public.product_variants ALTER COLUMN price TYPE numeric(12,2) USING price::numeric;
ALTER TABLE public.order_items ALTER COLUMN price TYPE numeric(12,2) USING price::numeric;
ALTER TABLE public.orders ALTER COLUMN subtotal TYPE numeric(12,2) USING subtotal::numeric;
ALTER TABLE public.orders ALTER COLUMN discount TYPE numeric(12,2) USING discount::numeric;
ALTER TABLE public.orders ALTER COLUMN total_price TYPE numeric(12,2) USING total_price::numeric;
CREATE TABLE IF NOT EXISTS public.catalog_import_jobs (
 id text PRIMARY KEY,user_id text NOT NULL,source_name text NOT NULL,supplier text NOT NULL,source_url text,
 status text NOT NULL DEFAULT 'ready',auto_publish boolean NOT NULL DEFAULT false,
 total_batches integer NOT NULL DEFAULT 0,processed_batches integer NOT NULL DEFAULT 0,
 products_added integer NOT NULL DEFAULT 0,duplicates_skipped integer NOT NULL DEFAULT 0,needs_review integer NOT NULL DEFAULT 0,
 error text,image_candidates jsonb DEFAULT '[]',created_at timestamp DEFAULT now(),updated_at timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.catalog_import_batches (
 id text PRIMARY KEY,job_id text NOT NULL REFERENCES public.catalog_import_jobs(id) ON DELETE CASCADE,
 position integer NOT NULL,payload jsonb NOT NULL,status text NOT NULL DEFAULT 'pending',lease text,started_at timestamp,error text,
 UNIQUE(job_id,position)
);
CREATE INDEX IF NOT EXISTS catalog_import_batches_pending ON public.catalog_import_batches(job_id,status,position);
-- Imports run only through authenticated admin server routes, never the public Supabase client.
ALTER TABLE public.catalog_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_import_batches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.catalog_import_jobs,public.catalog_import_batches FROM anon,authenticated;
INSERT INTO public.categories(id,name,slug,icon)
SELECT seed.id,seed.name,seed.slug,'/images/office-product-fallback.svg'
FROM (VALUES
 ('office-supplies','Office Supplies','office-supplies'),
 ('paper-notebooks','Paper & Notebooks','paper-notebooks'),
 ('writing-instruments','Writing Instruments','writing-instruments'),
 ('filing-organization','Filing & Organization','filing-organization'),
 ('desk-accessories','Desk Accessories','desk-accessories'),
 ('office-furniture','Office Furniture','office-furniture'),
 ('printer-supplies','Printer Supplies','printer-supplies'),
 ('breakroom-cleaning','Breakroom & Cleaning','breakroom-cleaning')
) seed(id,name,slug)
WHERE NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.slug=seed.slug)
ON CONFLICT(id) DO NOTHING;
-- Replace the old promotional banners with a real office-themed hero.
UPDATE public.hero_banners SET is_active=false WHERE id NOT LIKE 'citrus-office-%';
INSERT INTO public.hero_banners(id,title,heading,button_text,button_link,image,sort_order,is_active)
VALUES('citrus-office-essentials','THE EVERYDAY WORKPLACE, ELEVATED','Office essentials. Fresh possibilities.','Shop office products','/products','/images/office-essentials-hero.png',0,true)
ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,heading=EXCLUDED.heading,image=EXCLUDED.image,button_text=EXCLUDED.button_text,button_link=EXCLUDED.button_link,is_active=true;
COMMIT;
