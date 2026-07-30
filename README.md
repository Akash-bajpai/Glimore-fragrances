# Glimoré Fragrances

Full-stack luxury candle store. Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion,
with a real checkout: PostgreSQL/Prisma, custom JWT auth, Razorpay payments, and an admin panel.

## 1. Set up your environment

```bash
cp .env.example .env
```

Fill in `.env`:

- **DATABASE_URL** — any Postgres works. Fastest free option: [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) — create a project, copy the connection string.
- **AUTH_SECRET** — run `openssl rand -base64 32` and paste the output.
- **RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET** — from [dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys). Use **Test Mode** keys to begin — no real money moves, and Razorpay gives you test card/UPI credentials.
- **RAZORPAY_WEBHOOK_SECRET** — after deploying (or via a tunnel like `ngrok` for local dev), add a webhook in Razorpay Dashboard → Settings → Webhooks pointing at `{your-url}/api/payment/webhook`, subscribed to `payment.captured` and `payment.failed`. Razorpay gives you the secret when you create it.
- **RESEND_API_KEY** (optional) — from [resend.com](https://resend.com), for real password-reset/order-confirmation emails. Without it, those emails are logged to your server console instead — everything still works for local testing.

## 2. Install, migrate, seed

```bash
npm install
npm run db:migrate   # creates all tables in your database
npm run db:seed      # adds 5 products, 2 sample coupons, and an admin login
npm run dev
```

Your seeded admin login is whatever you set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` to in `.env`
(defaults to `admin@glimorefragrances.com` — **change the password before going live**). Sign in at
`/login`, then visit `/admin`.

## 3. Test a full order without real money

Sign up a regular account, add items to the bag, go to checkout, and choose **Cash on Delivery** —
this exercises the entire order pipeline (address, coupon, shipping, tax, inventory) with zero
payment gateway involvement. To test online payment, use **Test Mode** Razorpay keys and their
test card/UPI numbers from the Razorpay docs.

## Architecture notes

- **Money** is stored as whole rupees everywhere except the literal Razorpay API call, where it's
  converted to paise (`lib/razorpay.ts`) — the one place that conversion needs to happen.
- **Order totals are always recalculated server-side** (`lib/pricing.ts`) from the server-held cart
  and product prices — the client can request a coupon or a PIN code, but it can never dictate a
  price. This is the single most important rule in the checkout code.
- **Payment confirmation** has two independent paths that both lead to the same idempotent
  transaction: the client-side Razorpay Checkout callback (`/api/payment/verify`) and the Razorpay
  webhook (`/api/payment/webhook`). The webhook exists because the client-side path can simply never
  fire (closed tab, dropped connection) — don't remove it.
- **Checkout requires an account** (a deliberate scope decision, not an oversight) — it keeps order
  history, addresses, and the data model simple. Guest checkout would mean nullable order ownership
  and a reconciliation step at signup; a reasonable v2, not included here.
- Stock is decremented **on payment confirmation**, not at order creation, so an abandoned online
  checkout doesn't lock up inventory. There's no reservation/hold system (e.g. "stock held for 10
  minutes while you pay") — fine at boutique scale, worth adding if you get high concurrent traffic
  on low-stock items.

## What's here vs. what needs your input

**Fully implemented and tested:** the data model, pricing/tax/coupon/shipping math, auth (signup,
login, password reset), Razorpay order creation + signature verification + webhook handling,
inventory tracking, the entire checkout UI, account pages, and the admin dashboard (orders,
products, coupons, customers, revenue).

**Needs your credentials to go live:** a real Postgres database, a real Razorpay account (with
KYC completed for live — not test — payments), and optionally a Resend account for real emails.
None of this can be faked — connect real credentials and it works as built.

## Structure

```
app/                         routes: storefront, checkout, account, admin, all API routes
components/sections/         homepage sections
components/layout/           nav, footer, cart drawer, search
components/ui/                shared building blocks
components/account/ admin/   dashboard-specific nav
prisma/schema.prisma          full data model
prisma/seed.ts                demo products, coupons, admin user
lib/                          auth, pricing engine, Razorpay integration, email, rate limiting
```
