# Glimoré Fragrances

Luxury hand-poured soy candle brand site. Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm run start
```

## Structure

- `app/` — routes, layout, SEO (sitemap, robots, manifest), 404/error/loading
- `components/sections/` — homepage sections (Hero, Best Sellers, About, etc.)
- `components/layout/` — nav, footer, cart drawer, search, floating UI
- `components/ui/` — shared building blocks (ProductCard, StarRating, etc.)
- `components/providers/` — cart/wishlist, theme, quick-view state
- `data/` — products, testimonials, FAQ, site config (edit `data/content.ts` for phone/email/address)
- `public/images`, `public/videos` — your uploaded photography, cropped and optimized

## Notes

- Cart/wishlist persist in the browser (localStorage) — there's no payment backend wired up yet.
- The contact form and newsletter simulate a submit — connect them to an email/API provider when ready.
