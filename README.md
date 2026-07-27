# Nuvéllé — Premium Beauty, Jewelry & Fashion E-commerce

A full-stack, aesthetic luxury e-commerce website (soft blush/rose/gold "diva" theme with rounded cards) for beauty, makeup, skincare, jewelry, fragrance and fashion (women & men). Built for Cloudflare Pages with Hono + D1.

## ✨ Features

### Storefront
- Aesthetic luxury design — Cormorant serif headings, blush/rose/mauve/gold palette, rounded soft cards, animations
- Home with hero, category grid, bestsellers, new arrivals, trust badges
- Shop with category filters, search, sorting (price/rating/featured)
- Product detail: image gallery, reviews (read + submit), related products, quantity selector
- Affiliate products: "View Deal / Buy Now" opens external link (click tracked)
- Cart (localStorage) with quantity controls & free-shipping progress
- Checkout with PayU-ready order creation & confirmation
- FAQ (researched, Amazon/Myntra/Flipkart-style), Shipping & Returns policy (7-day), About, Contact
- Fully responsive with mobile drawer menu

### Admin Panel (`/admin`, PIN: **2005**)
- Dashboard: products, orders, revenue, pending, views, affiliate clicks, top products
- Products: add / edit / remove — name, description, price, compare price, images, stock, tags, category, brand, featured, active
- **Affiliate links**: mark product as affiliate, paste product URL, **Fetch Price** button auto-scrapes price/title/image from the link
- **Auto price update**: enable per product + "Refresh Affiliate Prices" button re-fetches & updates prices from links automatically
- Orders: view all, update order & payment status
- Categories: add / remove
- Settings: store name, tagline, hero text, shipping thresholds, **PayU merchant key**
- All changes save instantly to the database (auto-persist)

## 🔗 Functional URIs
| Path | Description |
|------|-------------|
| `/` | Home |
| `/shop?category=&search=&sort=` | Product listing |
| `/product/:id` | Product detail |
| `/cart`, `/checkout` | Cart & checkout |
| `/about`, `/faq`, `/shipping`, `/contact` | Info pages |
| `/admin` | Admin (PIN 2005) |
| `GET /api/products`, `/api/products/:id`, `/api/categories`, `/api/settings` | Public API |
| `POST /api/reviews`, `/api/checkout`, `/api/track` | Public actions |
| `/api/admin/*` | Admin API (X-Admin-Pin header) |

## 🗄️ Data Architecture
- **Storage**: Cloudflare D1 (SQLite)
- **Tables**: `products`, `categories`, `orders`, `reviews`, `settings`, `events`
- Cart stored client-side in localStorage

## 🚀 Tech Stack
Hono + TypeScript + Cloudflare Pages/D1 + TailwindCSS (CDN) + Vite

## 🛠️ Development
```bash
npm install
npm run build
npm run db:migrate:local && npm run db:seed
pm2 start ecosystem.config.cjs   # http://localhost:3000
```

## 💳 PayU Integration
Add your PayU merchant key in Admin → Settings. Orders are created server-side ready for PayU checkout redirect. (Your provided key can be entered there.)

## 🌐 Hosting Options
- **Cloudflare Pages (recommended, zero changes)**: uses the built-in D1 database. Run `npm run deploy` with a Cloudflare API token.
- **Netlify**: possible, but Netlify does NOT support Cloudflare D1. You must switch the database to a Netlify-compatible provider (Supabase / Neon Postgres via REST) and update the DB calls in `src/index.tsx`. A `netlify.toml` is included. For no-hassle hosting, use Cloudflare Pages.

## 📦 Deployment
- Platform: Cloudflare Pages
- Status: ✅ Running locally / ready to deploy
- Deploy: configure Cloudflare API token, run `npm run deploy`

## 🔐 Admin Access
- URL: `/admin`
- PIN: `2005`

**Last Updated**: 2026-07-27
