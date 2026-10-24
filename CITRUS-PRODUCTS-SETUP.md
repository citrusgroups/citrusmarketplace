# Citrus Products update

This update is based on the current `main` branch of `citrusgroups/citrusmarketplace` (the former `citruscompanies/citrusmarketplace` link redirects there). It contains changed/new files only. It retains the existing Supabase database, authentication, storage and Stripe configuration.

## Apply the update

1. Back up your project and database. Extract the update ZIP into a separate folder. Copy its `app`, `components`, `lib`, `db`, `public`, `database`, `tests`, `package.json` and `package-lock.json` into the project, replacing matching files. Keep your existing `.env`.
2. In the existing Supabase project's **SQL Editor**, run `database/01-citrus-products.sql`. This adds import tables and publication/source fields, supports decimal USD prices, seeds office categories and replaces the iPhone banner with the new office banner. It does not remove order/customer/auth records.
3. Run `database/02-office-products-only.sql`. It maps recognized office categories and hides non-office products. No product/order history is deleted. Review any hidden genuine office product in Admin > Products, choose its office category, then publish it.
4. Add these server environment variables locally and in your deployment:

```env
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_CATALOG_MODEL=gemini-3.5-flash-lite
```

This is a Gemini API key, not your Google sign-in client ID or client secret. Keep the existing DATABASE_URL, Supabase, authentication, Stripe and email settings unchanged. No new Supabase service-role key or storage bucket is required for the importer; it uses the existing server-side database connection. Gemini charges/quotas follow your Google project. The model is configurable without code changes.

5. Run `npm install`, then `npm run dev`. For production run `npm run build`, commit the updated files and redeploy. Use a Node runtime compatible with Next.js 16 and the installed dependencies (Node 22.19+ or Node 24 required by the current AI SDK/download dependencies).

## Import a catalog

Open **Admin > Catalog Import**. Enter a consistent supplier name, then a URL or file. Click **Extract & add products**.

- Supported: PDF (including scanned PDFs), CSV, XLSX, DOCX, JSON, TXT, HTML, PNG, JPG and WEBP. Convert old XLS/DOC formats to XLSX/PDF first. Encrypted/unreadable files must be exported to a readable format.
- File uploads are limited to 4 MB to stay within hosted request limits. Direct downloadable URLs support up to 20 MB. PDFs support up to 1,000 pages and process one page per request. Text/rows use bounded segments.
- Keep the admin page open while processing. Pausing/closing the page stops new segments; the in-flight segment may finish. Use **Resume import** to continue saved progress. Failed segments can be retried without re-adding completed pages. Cancellation prevents in-flight results being committed.
- Supplier + SKU (or supplier + normalized product name if no SKU is available) prevents duplicate records. Existing selling prices are never overwritten by repeat imports. Variants with different orderable SKUs are imported as separate products and retain their pack/model details.
- Extracted office items are added automatically. With auto-publish enabled, only records with a positive USD price, quoted price evidence and an exact source image URL publish automatically. Other items are saved as hidden drafts. Unsupported/non-office items are excluded.
- Imported stock defaults to zero. Supplier/catalog pack quantities are not your inventory. In **Admin > Products > Edit**, verify the selling price in USD, add/upload an image, enter stock and select **Publish on storefront**.
- The importer preserves actual image URLs present in HTML/CSV/XLSX/JSON sources. It does **not** crop individual product photos from PDF/scanned pages. Those products remain drafts until you add their photos. A neutral office illustration is a display fallback, not a product photo.
- Missing/ambiguous prices or currencies are not invented or converted. Review them before publishing. Human review is appropriate for AI-extracted product information, even when source fields are complete.

## Your OEX reference

`https://www.oexusa.com/catalogs` is a catalog index. The importer detects its individual ActivePoint catalog links. Some ActivePoint flipbooks render product data only in browser frames/scripts and do not expose readable product content or a direct PDF link. In that case, the importer asks you to use the supplier's Download PDF/export option and upload the PDF or a spreadsheet. It does not claim to have imported a flipbook it cannot read. No OEX products, prices or reseller relationship have been invented or preloaded in this update.

## Changes included

- Citrus Products name across public pages, metadata, emails and payment order labels.
- Updated transparent CITRUS PRODUCTS logo, retaining the CITRUS mark, orange accents, and white-on-dark footer treatment.
- Office-supplies homepage banner and office category navigation; old phone/gaming template promotions removed from the home page.
- Company story: four friends founded CITRUS in 2024; Amazon services and the office-products direction described without invented client/revenue claims.
- Admin import history, saved progress, retries, duplicate prevention and draft review.
- Public product/list/detail APIs hide unpublished/non-office products; checkout rejects hidden products.
- Product edit now supports image URL/upload, decimal selling prices and explicit publication.
- Import and product-mutation routes require a verified administrator session. Catalog downloads reject private/reserved networks and pin validated DNS connections.

## Validation

`npm run test:catalog` covers normalization, URL restrictions, catalog index discovery, PDF splitting, spreadsheet parsing and real PostgreSQL-compatible migration/product transactions. `npm run test:payments` covers the existing Stripe checkout/webhook flow. Production build and focused lint checks were run. HTTP smoke checks passed for the home/about/services pages, office categories and administrator API access checks. A visual browser check could not be completed because the browser download failed in this environment. No live Gemini extraction or live Supabase migration was performed here because credentials are unavailable.

For an end-to-end acceptance check after setup: import a small catalog, verify its progress reaches completed, inspect product drafts/images/prices, enter stock, publish one office product and confirm it appears in the storefront and can enter checkout.
