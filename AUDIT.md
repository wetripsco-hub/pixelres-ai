# PixelRes AI – audit (2026-10-10)

## Fixed in this pass
| # | Problem | Fix |
|---|---|---|
| 1 | Admin PIN cookie was the literal text `true` – anyone could type it in the browser console and become admin. Default PIN was `1234`. | Signed, expiring cookie (`lib/admin-session.ts`). No default PIN: `ADMIN_PIN` must be set. Default admin email removed. |
| 2 | `/api/storage/signed-url` had no login check – anyone could download any customer photo or result. | Needs login; user must own an order that references the file (admin allowed). Bucket whitelist, max 15 min. |
| 3 | `/api/upload/raw` was open to everyone: any path, any file type, overwrite existing files, creates a PUBLIC bucket. | Strict path format, image types only, 25MB, no overwrite, private bucket, user prefix must match login. |
| 4 | Orders trusted the price and status from the browser, and were marked "processing" before payment. `/api/orders` did the same. | Server computes price; order starts `pending`; Stripe webhook sets `processing`. Old `/api/orders` now returns 410. |
| 5 | Checkout took tier/currency from the browser and fell back to "free success" if the Stripe key was missing – also in production. | Checkout reads tier/currency from the stored order. Missing key in production → 503. Redirect URL no longer built from spoofable headers. |
| 6 | Dashboard gave every logged-in user all guest orders with an empty email, and `getSession()` trusts the cookie without checking. | Only exact-email match; `getUser()` used. |
| 7 | Any user could `UPDATE profiles SET role='admin'` (RLS allows updating own row). | Migration `20260818_security_fixes.sql` blocks role/credits changes from non-service roles. |
| 8 | Admin revenue counted unpaid orders. | Only `processing`/`completed` count. |
| 9 | `postcss.config.mjs` pointed to a package that is not installed and clashed with `postcss.config.js`. | Same Tailwind v3 config in both. |
| 10 | Stripe webhook could reset a completed order on a retry. | Only updates `pending` orders. |

## NOT changed – needs your decision
- **Run the new migration** in Supabase, and set `ADMIN_PIN` and `ADMIN_SESSION_SECRET` in Vercel/.env.local (the PIN login stops working until `ADMIN_PIN` exists).
- **PKR price mismatch**: code says web = Rs. 300, the SQL seed says 499.
- **`upscaled-outputs` bucket is public** – results can be opened by anyone who knows the URL. Make it private (the dashboard already uses signed URLs).
- **`lib/pricing-store.ts` writes `data/pricing_settings.json`** – does not persist on Vercel, and reads 3 stores in turn. Keep only the DB.
- **Two upload components** (`components/dashboard/image-uploader.tsx`, `components/studio/ImageUploader.tsx`) – near-duplicates; keep one.
- `AdminDashboardClient.tsx` is 47KB in one file; split it.
- Service-role client falls back to a "placeholder" URL/key silently – better to fail loudly.
- No rate limiting on PIN attempts, upload or checkout.

## Junk you can delete
`fix_confetti.js`, `patch_confetti.js` (one-off patch scripts), `server.log`, `stitch_screenshot.png`, `screenshots/`, `test-results/`, `screenshot*.spec.ts` (4 files), `tsconfig.tsbuildinfo`, `eslint.config.mjs` (imports `eslint/config`, which ESLint 8 does not have – keep `.eslintrc.json`), `public/*.svg` (Next template), default README. `.next/` is already git-ignored.
