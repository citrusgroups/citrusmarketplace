-- Run AFTER 01-citrus-products.sql. Old non-office products are hidden, not destroyed.
-- Existing order history and product IDs are preserved. Inspect the SELECT first.
SELECT p.id,p.name,c.name AS category FROM public.products p
LEFT JOIN public.categories c ON c.id=p.category_id OR c.slug=p.category_id
WHERE COALESCE(c.slug,p.category_id,'') NOT IN ('office-supplies','paper-notebooks','writing-instruments','filing-organization','desk-accessories','office-furniture','printer-supplies','breakroom-cleaning');
BEGIN;
-- Map recognized existing office categories into the new taxonomy.
UPDATE public.products p SET category_id=CASE
 WHEN lower(c.name || ' ' || c.slug) ~ '(notebook|paper)' THEN 'paper-notebooks'
 WHEN lower(c.name || ' ' || c.slug) ~ '(pen|pencil|writing)' THEN 'writing-instruments'
 WHEN lower(c.name || ' ' || c.slug) ~ '(folder|filing|organiz)' THEN 'filing-organization'
 WHEN lower(c.name || ' ' || c.slug) ~ '(printer|toner|ink)' THEN 'printer-supplies'
 WHEN lower(c.name || ' ' || c.slug) ~ '(desk|chair|furniture)' THEN 'office-furniture'
 WHEN lower(c.name || ' ' || c.slug) ~ '(office|stationery)' THEN 'office-supplies'
 ELSE p.category_id END
FROM public.categories c WHERE (p.category_id=c.id OR p.category_id=c.slug)
AND c.slug NOT IN ('office-supplies','paper-notebooks','writing-instruments','filing-organization','desk-accessories','office-furniture','printer-supplies','breakroom-cleaning');
UPDATE public.products SET is_published=false
WHERE COALESCE(category_id,'') NOT IN ('office-supplies','paper-notebooks','writing-instruments','filing-organization','desk-accessories','office-furniture','printer-supplies','breakroom-cleaning');
COMMIT;
-- Reassign any hidden genuine office products in Admin > Products before publishing them.
