# Nuvéllé — Premium Beauty, Jewelry & Fashion E-commerce

A full-stack, aesthetic luxury e-commerce website (soft blush/rose/gold theme, rounded cards) for beauty, makeup, skincare, jewelry, fragrance and fashion (women & men). **Built for one-click Netlify deploy** — Netlify Functions + Netlify Blobs (no external database, no config needed).

## ✨ Features

### Storefront
- Aesthetic luxury design — Cormorant serif headings, blush/rose/mauve/gold palette, rounded soft cards, animations
- Home (hero, category grid, bestsellers, new arrivals, trust badges), Shop with filters/search/sort
- Product detail: image gallery, reviews (read + submit), related products, quantity selector
- Affiliate products: "View Deal / Buy Now" opens external link (tracked)
- Cart (localStorage) + free-shipping progress, PayU-ready checkout with order confirmation
- FAQ, Shipping & 7-day Returns policy, About, Contact — fully responsive with mobile menu

### Admin Panel (`/admin`, PIN: **2005**)
- Dashboard: products, orders, revenue, pending, views, affiliate clicks, top products
- Products: add / edit / remove — all fields editable
- **Upload images from your computer** (auto-compressed) or paste URLs, with live preview
- **Affiliate links**: "Fetch Price" auto-scrapes price + images from the product link; "Refresh Affiliate Prices" auto-updates all
- Orders management, Categories add/remove
- **Full customization**: store name, tagline, hero (title/subtitle/button/image), announcement bar, **theme colors** (live recolor), shipping, PayU key, about text, contact email/phone, social links — all auto-save

## 🔗 Routes
| Path | Description |
|------|-------------|
| `/` `/shop` `/product/:id` `/cart` `/checkout` | Storefront |
| `/about` `/faq` `/shipping` `/contact` | Info pages |
| `/admin` | Admin (PIN 2005) |
| `/api/*` | Netlify Function (products, settings, checkout, reviews, admin) |

## 🚀 Tech Stack
- **Frontend**: Static HTML + vanilla JS SPA + TailwindCSS (CDN)
- **Backend**: Netlify Functions (`netlify/functions/api.mjs`)
- **Storage**: **Netlify Blobs** (built-in JSON store — zero setup, auto-seeded on first run)

## 🌐 Deploy to Netlify (one click)
1. Push this repo to GitHub (already done).
2. On Netlify → **Add new site → Import from Git** → pick this repo.
3. Netlify reads `netlify.toml` automatically:
   - Publish dir: `public`
   - Functions dir: `netlify/functions`
4. Click **Deploy**. Done — data persists in Netlify Blobs automatically.

No build command, no environment variables, no database signup required.

## 🖥️ Local Development
```bash
npm install
node local-dev-server.mjs   # http://localhost:3000 (emulates Netlify: static + /api + SPA)
```
(`local-dev-server.mjs` is a dev-only emulator; production runs on Netlify Functions + Blobs.)

## 💳 PayU
Enter your PayU merchant key in **Admin → Settings**. Orders are created server-side ready for PayU checkout.

## 🔐 Admin Access
- URL: `/admin` · PIN: `2005`

**Last Updated**: 2026-07-27
