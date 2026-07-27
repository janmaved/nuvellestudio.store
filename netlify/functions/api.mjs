import { getStore } from '@netlify/blobs'

// ==================== Nuvéllé — Netlify Function API ====================
// Uses Netlify Blobs (built-in, zero-config) as a simple JSON datastore.
// One-click deploy on Netlify — no external database needed.

const ADMIN_PIN = '2005'
// Set GROQ_API_KEY as a Netlify environment variable (Site settings → Environment variables).
// For local dev it is read from .dev.vars (git-ignored).
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' } })

function store() { return getStore({ name: 'nuvelle', consistency: 'strong' }) }

async function getData() {
  const s = store()
  let d = await s.get('data', { type: 'json' })
  if (!d) { d = seedData(); await s.setJSON('data', d) }
  return d
}
async function saveData(d) { await store().setJSON('data', d) }

function seedData() {
  const now = () => new Date().toISOString()
  return {
    nextId: 200,
    settings: {
      store_name: 'Nuvéllé', store_tagline: 'Beauty. Fashion. Luxury.', currency: 'INR',
      free_shipping_threshold: '999', shipping_fee: '49', payu_key: '',
      hero_title: 'Where Elegance Meets You', hero_subtitle: 'Curated luxury beauty, jewelry & fashion for the modern icon.',
      hero_cta: 'Shop Collection', hero_image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
      announcement: 'FREE SHIPPING OVER ₹999 · NEW ARRIVALS EVERY WEEK · AUTHENTIC LUXURY GUARANTEED',
      theme_primary: '#E8B4B8', theme_secondary: '#C98986', theme_dark: '#8C5A5A', theme_accent: '#C9A96A',
      about_text: "Born from a passion for timeless elegance, Nuvéllé curates the world's finest beauty, jewelry & fashion. We believe every woman and man deserves to feel like an icon.",
      contact_email: 'care@nuvelle.com', contact_phone: '+91 98765 43210',
      social_instagram: '#', social_facebook: '#', social_pinterest: '#', footer_text: ''
    },
    categories: [
      { id: 1, name: 'Makeup', slug: 'makeup', icon: 'fa-wand-magic-sparkles', sort_order: 1 },
      { id: 2, name: 'Skincare', slug: 'skincare', icon: 'fa-droplet', sort_order: 2 },
      { id: 3, name: 'Jewelry', slug: 'jewelry', icon: 'fa-gem', sort_order: 3 },
      { id: 4, name: 'Fashion Women', slug: 'fashion-women', icon: 'fa-person-dress', sort_order: 4 },
      { id: 5, name: 'Fashion Men', slug: 'fashion-men', icon: 'fa-shirt', sort_order: 5 },
      { id: 6, name: 'Fragrance', slug: 'fragrance', icon: 'fa-spray-can-sparkles', sort_order: 6 }
    ],
    products: [
      { ...p(1, 'Velvet Matte Lipstick - Ruby Rose', 'Long-lasting velvet matte finish lipstick enriched with vitamin E. Non-drying, transfer-proof formula in a stunning ruby shade.', 'makeup', 'lips', 'Nuvéllé Beauty', 649, 999, ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800'], 4.8, 342, 1, 'bestseller,matte,lipstick'), highlights: 'Long-lasting up to 12 hours\nEnriched with Vitamin E\nTransfer-proof & non-drying\nCruelty-free & vegan', faqs: [{ q: 'Is this lipstick waterproof?', a: 'Yes, it has a transfer-proof, smudge-resistant formula that stays put through meals and drinks.' }, { q: 'Is it suitable for dry lips?', a: 'Absolutely — it is infused with Vitamin E to keep your lips hydrated and comfortable all day.' }, { q: 'How do I remove it?', a: 'Use any oil-based makeup remover or micellar water for easy, gentle removal.' }], variants: [{ type: 'Shade', options: [{ label: 'Ruby Rose', color: '#B0304A', image: '', price: null }, { label: 'Nude Blush', color: '#C98986', image: '', price: null }, { label: 'Berry Wine', color: '#6E2438', image: '', price: null }, { label: 'Coral Kiss', color: '#E86A5A', image: '', price: null }] }] },
      { ...p(2, '24K Gold Glow Serum', 'Luxurious anti-aging face serum infused with 24K gold flakes and hyaluronic acid for radiant, youthful skin.', 'skincare', 'serum', 'Aurelle', 1899, 2799, ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800'], 4.9, 521, 1, 'luxury,serum,gold'), highlights: 'Infused with real 24K gold flakes\nHyaluronic acid for deep hydration\nReduces fine lines & wrinkles\nSuitable for all skin types', faqs: [{ q: 'When should I apply this serum?', a: 'Apply 2-3 drops on cleansed skin morning and night, before moisturizer.' }, { q: 'Is it safe for sensitive skin?', a: 'Yes, it is dermatologically tested and formulated to be gentle on all skin types.' }] },
      p(3, 'Diamond Solitaire Necklace', 'Elegant 18K white gold plated solitaire pendant with premium cubic zirconia. Perfect for every occasion.', 'jewelry', 'necklace', 'Luxe Jewels', 2499, 4999, ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'], 4.7, 198, 1, 'diamond,necklace,gift'),
      p(4, 'Silk Wrap Midi Dress', 'Flowing premium silk-blend wrap dress in emerald green. Timeless elegance for day to night.', 'fashion-women', 'dresses', 'Maison N', 3299, 5499, ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'], 4.6, 156, 1, 'dress,silk,women'),
      p(5, 'Tailored Wool Blazer - Navy', 'Sharp, modern-fit blazer crafted from Italian wool. Elevate your wardrobe with timeless sophistication.', 'fashion-men', 'blazers', 'Sartor', 4599, 7999, ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'], 4.8, 89, 1, 'blazer,men,formal'),
      p(6, 'Midnight Oud Eau de Parfum', 'Intense, long-lasting unisex fragrance with notes of oud, amber and vanilla. A signature scent of luxury.', 'fragrance', 'perfume', 'Noir', 2999, 4499, ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800'], 4.9, 412, 1, 'perfume,oud,unisex'),
      p(7, 'HD Liquid Foundation - Natural', 'Buildable, full-coverage liquid foundation with SPF 20. Weightless feel with a natural luminous finish.', 'makeup', 'face', 'Nuvéllé Beauty', 899, 1299, ['https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800'], 4.5, 267, 0, 'foundation,face'),
      p(8, 'Rose Gold Hoop Earrings', 'Chic rose gold plated hoop earrings. Lightweight, hypoallergenic and effortlessly stylish.', 'jewelry', 'earrings', 'Luxe Jewels', 1299, 2199, ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'], 4.7, 143, 0, 'earrings,rosegold'),
      p(9, 'Cashmere Blend Turtleneck', 'Ultra-soft cashmere blend turtleneck sweater in camel. Luxurious warmth with a refined silhouette.', 'fashion-women', 'tops', 'Maison N', 2799, 4299, ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'], 4.6, 78, 0, 'sweater,cashmere'),
      p(10, 'Leather Chelsea Boots', 'Premium genuine leather Chelsea boots for men. Classic design with all-day comfort.', 'fashion-men', 'shoes', 'Sartor', 5299, 8499, ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800'], 4.8, 112, 0, 'boots,leather,men'),
      p(11, 'Hydrating Rose Face Mist', 'Refreshing rose water facial mist that hydrates and sets makeup. Pure botanical extract.', 'skincare', 'mist', 'Aurelle', 549, 799, ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'], 4.4, 201, 0, 'mist,rose,skincare'),
      p(12, 'Statement Pearl Bracelet', 'Elegant freshwater pearl bracelet with gold accents. A sophisticated addition to any look.', 'jewelry', 'bracelet', 'Luxe Jewels', 1799, 2999, ['https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800'], 4.7, 67, 0, 'pearl,bracelet')
    ],
    orders: [],
    reviews: [
      { id: 1, product_id: 1, customer_name: 'Priya S.', rating: 5, comment: 'Absolutely love this lipstick! The color is stunning and lasts all day.', media: [], created_at: now() },
      { id: 2, product_id: 1, customer_name: 'Ananya M.', rating: 4, comment: 'Best matte lipstick I have ever used. Highly recommend!', media: [], created_at: now() },
      { id: 3, product_id: 2, customer_name: 'Riya K.', rating: 5, comment: 'My skin has never looked better. Worth every rupee.', media: [], created_at: now() },
      { id: 4, product_id: 3, customer_name: 'Sneha P.', rating: 4, comment: 'Beautiful necklace, looks very premium. Fast delivery.', media: [], created_at: now() },
      { id: 5, product_id: 6, customer_name: 'Arjun T.', rating: 5, comment: 'Amazing fragrance, gets so many compliments!', media: [], created_at: now() }
    ],
    blocks: [
      { id: 101, type: 'hero', enabled: 1, sort: 1, data: {} },
      { id: 102, type: 'category-grid', enabled: 1, sort: 2, data: { title: 'Shop by Category' } },
      { id: 103, type: 'products', enabled: 1, sort: 3, data: { title: 'Bestsellers', filter: 'featured', limit: 8 } },
      { id: 104, type: 'banner', enabled: 1, sort: 4, data: { title: 'The Gold Edit', subtitle: 'Discover our 24K luxury skincare collection', cta: 'Explore Now', link: '/shop?category=skincare', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200', align: 'left' } },
      { id: 105, type: 'products', enabled: 1, sort: 5, data: { title: 'New Arrivals', filter: 'newest', limit: 4 } },
      { id: 106, type: 'features', enabled: 1, sort: 6, data: {} },
      { id: 107, type: 'newsletter', enabled: 1, sort: 7, data: { title: 'Join the Nuvéllé Circle', subtitle: 'Be first to know about new drops, exclusive offers & beauty tips.' } }
    ],
    events: []
  }
}
function p(id, name, description, category, subcategory, brand, price, compare_price, images, rating, reviews_count, featured, tags) {
  return { id, name, description, category, subcategory, brand, price, compare_price, currency: 'INR', images, stock: 100, rating, reviews_count, is_affiliate: 0, affiliate_url: '', auto_price_fetch: 0, featured, active: 1, tags, highlights: '', faqs: [], variants: [], created_at: new Date().toISOString() }
}

function resolveUrl(u, base) { try { if (!u) return ''; if (u.startsWith('//')) return 'https:' + u; if (u.startsWith('http')) return u; return new URL(u, base).href } catch { return u } }

export default async (req) => {
  if (req.method === 'OPTIONS') return json({})
  const url = new URL(req.url)
  let path = url.pathname.replace(/^\/api/, '').replace(/^\/\.netlify\/functions\/api/, '') || '/'
  const qs = url.searchParams
  const method = req.method
  const body = (method === 'POST' || method === 'PUT') ? await req.json().catch(() => ({})) : {}
  const d = await getData()

  try {
    // ---------- PUBLIC ----------
    if (path === '/products' && method === 'GET') {
      let list = d.products.filter(x => x.active === 1 || x.active === undefined)
      const cat = qs.get('category'), search = qs.get('search'), featured = qs.get('featured'), sort = qs.get('sort'), limit = qs.get('limit')
      if (cat) list = list.filter(x => x.category === cat)
      if (featured === '1') list = list.filter(x => x.featured === 1)
      if (search) { const q = search.toLowerCase(); list = list.filter(x => (x.name + x.description + (x.brand || '') + (x.tags || '')).toLowerCase().includes(q)) }
      if (sort === 'price_asc') list.sort((a, b) => a.price - b.price)
      else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price)
      else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
      else list.sort((a, b) => (b.featured - a.featured) || (b.id - a.id))
      if (limit) list = list.slice(0, parseInt(limit))
      return json(list.map(serializeProduct))
    }
    const pm = path.match(/^\/products\/(\d+)$/)
    if (pm && method === 'GET') {
      const prod = d.products.find(x => x.id == pm[1]); if (!prod) return json({ error: 'not found' }, 404)
      const reviews = d.reviews.filter(r => r.product_id == pm[1]).sort((a, b) => b.id - a.id)
      return json({ ...serializeProduct(prod), reviews })
    }
    if (path === '/categories' && method === 'GET') return json([...d.categories].sort((a, b) => a.sort_order - b.sort_order))
    if (path === '/settings' && method === 'GET') { const o = { ...d.settings }; delete o.payu_key; return json(o) }
    if (path === '/blocks' && method === 'GET') return json([...(d.blocks || [])].filter(b => b.enabled !== 0).sort((a, b) => a.sort - b.sort))
    if (path === '/reviews' && method === 'POST') {
      const media = Array.isArray(body.media) ? body.media.slice(0, 5) : []
      const r = { id: d.nextId++, product_id: body.product_id, customer_name: body.customer_name, rating: Math.max(1, Math.min(5, +body.rating || 5)), comment: body.comment || '', media, created_at: new Date().toISOString() }
      d.reviews.push(r)
      const prod = d.products.find(x => x.id == body.product_id)
      if (prod) { const rs = d.reviews.filter(x => x.product_id == body.product_id); prod.rating = Math.round((rs.reduce((s, x) => s + x.rating, 0) / rs.length) * 10) / 10; prod.reviews_count = rs.length }
      await saveData(d); return json({ success: true })
    }
    if (path === '/track' && method === 'POST') {
      if (body.type) { d.events.push({ id: d.nextId++, type: body.type, product_id: body.product_id || null, created_at: new Date().toISOString() }); await saveData(d) }
      return json({ ok: true })
    }
    if (path === '/checkout' && method === 'POST') {
      const orderNum = 'NV' + Date.now().toString().slice(-8)
      const thr = parseFloat(d.settings.free_shipping_threshold || '999'), fee = parseFloat(d.settings.shipping_fee || '49')
      const shipping = body.subtotal >= thr ? 0 : fee
      const total = body.subtotal + shipping
      d.orders.push({ id: d.nextId++, order_number: orderNum, customer_name: body.name, customer_email: body.email, customer_phone: body.phone || '', shipping_address: body.address || '', items: body.items || [], subtotal: body.subtotal, shipping, total, status: 'pending', payment_status: 'pending', created_at: new Date().toISOString() })
      await saveData(d); return json({ success: true, order_number: orderNum, total, shipping })
    }

    // ---------- AI CHAT SUPPORT (Groq) ----------
    if (path === '/chat' && method === 'POST') {
      const s = d.settings
      const cur = s.currency === 'INR' ? '₹' : (s.currency || '₹')
      // Build compact product catalog context
      const catalog = d.products.filter(p => p.active !== 0).slice(0, 40).map(p =>
        `- ${p.name} (${p.category}${p.brand ? ', ' + p.brand : ''}) — ${cur}${p.price}${p.compare_price > p.price ? ` (was ${cur}${p.compare_price})` : ''}, ${p.stock > 0 ? 'In stock' : 'Out of stock'}, rated ${p.rating}/5`
      ).join('\n')
      const cats = d.categories.map(c => c.name).join(', ')
      // Order lookup if user references an order number
      let orderInfo = ''
      const userMsg = (body.messages || []).filter(m => m.role === 'user').map(m => m.content).join(' ')
      const onm = userMsg.match(/NV\d{6,}/i)
      if (onm) {
        const o = d.orders.find(x => x.order_number.toUpperCase() === onm[0].toUpperCase())
        if (o) orderInfo = `\n\nORDER LOOKUP — ${o.order_number}: status "${o.status}", payment "${o.payment_status}", total ${cur}${o.total}, placed ${new Date(o.created_at).toLocaleDateString()}, items: ${o.items.map(i => i.name + ' x' + i.qty).join(', ')}. Ship to: ${o.customer_name}.`
        else orderInfo = `\n\nORDER LOOKUP — no order found with number ${onm[0]}. Ask the customer to double-check the order number from their confirmation email.`
      }
      const thr = s.free_shipping_threshold || '999', fee = s.shipping_fee || '49'
      const sys = `You are "Nuvi", the friendly, professional live customer-support assistant for ${s.store_name || 'Nuvéllé'}, a premium online store for beauty, makeup, skincare, jewelry, fragrance and fashion (women & men).

Be warm, polite, concise and genuinely helpful — like a top luxury-brand support agent. Use the store facts below to answer accurately. Never invent products, prices, or policies not listed. If asked something you cannot know (e.g. a specific order you have no data for), politely ask for the order number or suggest emailing ${s.contact_email || 'care@nuvelle.com'}. Keep answers short (2-5 sentences) unless detail is needed. You may recommend relevant products from the catalog.

STORE FACTS:
- Store: ${s.store_name || 'Nuvéllé'} — ${s.store_tagline || 'Beauty. Fashion. Luxury.'}
- Categories: ${cats}
- Shipping: FREE over ${cur}${thr}; otherwise ${cur}${fee} flat. Standard delivery 3-7 business days across India. Tracking sent by email & SMS after dispatch.
- Returns: 7-day easy returns from delivery. Items must be unused with tags & original packaging. Opened beauty/personal-care items are non-returnable for hygiene. Refunds in 5-7 business days to original payment method. Exchange for size/defect at no cost.
- Damaged/wrong item: contact within 48 hours with photos for free replacement or refund.
- Payments: cards, UPI, netbanking, wallets — securely via PayU.
- Authenticity: 100% genuine products, sourced from authorized brands.
- Contact: ${s.contact_email || 'care@nuvelle.com'}, ${s.contact_phone || ''}.
- To track an order: give the customer's order number (format NVxxxxxxxx).${orderInfo}

PRODUCT CATALOG (sample):
${catalog}`
      try {
        const gr = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: GROQ_MODEL,
            temperature: 0.4,
            max_tokens: 500,
            messages: [{ role: 'system', content: sys }, ...(body.messages || []).slice(-8)]
          })
        })
        if (!gr.ok) { const et = await gr.text(); return json({ reply: `I'm having a little trouble right now. Please email us at ${s.contact_email || 'care@nuvelle.com'} and we'll help you right away!`, error: et }, 200) }
        const gj = await gr.json()
        const reply = gj.choices?.[0]?.message?.content || 'Sorry, could you rephrase that?'
        return json({ reply })
      } catch (e) {
        return json({ reply: `I'm having trouble connecting right now. Please email ${s.contact_email || 'care@nuvelle.com'} or try again in a moment.`, error: e.message }, 200)
      }
    }

    // ---------- ADMIN ----------
    if (path.startsWith('/admin')) {
      const pin = req.headers.get('x-admin-pin') || qs.get('pin')
      if (pin !== ADMIN_PIN) return json({ error: 'Unauthorized' }, 401)
      const ap = path.replace('/admin', '')

      if (ap === '/verify') return json({ ok: true })
      if (ap === '/products' && method === 'GET') return json([...d.products].sort((a, b) => b.id - a.id).map(serializeProduct))
      if (ap === '/products' && method === 'POST') {
        const np = { id: d.nextId++, ...normalizeProduct(body), created_at: new Date().toISOString() }
        d.products.push(np); await saveData(d); return json({ success: true, id: np.id })
      }
      const apm = ap.match(/^\/products\/(\d+)$/)
      if (apm && method === 'PUT') { const i = d.products.findIndex(x => x.id == apm[1]); if (i < 0) return json({ error: 'nf' }, 404); d.products[i] = { ...d.products[i], ...normalizeProduct(body) }; await saveData(d); return json({ success: true }) }
      if (apm && method === 'DELETE') { d.products = d.products.filter(x => x.id != apm[1]); await saveData(d); return json({ success: true }) }

      if (ap === '/fetch-price' && method === 'POST') {
        try {
          const res = await fetch(body.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9' }, redirect: 'follow' })
          const html = await res.text()
          let price = 0, title = '', images = []
          const mp = html.match(/<meta[^>]+(?:property|itemprop|name)=["'](?:product:price:amount|og:price:amount|price)["'][^>]+content=["']([\d.,]+)["']/i) || html.match(/["'](?:price|salePrice|finalPrice|sellingPrice)["']\s*:\s*["']?([\d]+(?:[.,]\d+)?)/i) || html.match(/[₹$€£]\s*([\d,]+(?:\.\d{1,2})?)/)
          if (mp) price = parseFloat(mp[1].replace(/,/g, ''))
          const mt = html.match(/<meta[^>]+(?:property|name)=["'](?:og:title|twitter:title)["'][^>]+content=["']([^"']+)["']/i) || html.match(/<title>([^<]+)<\/title>/i)
          if (mt) title = mt[1].trim().replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
          const re = /<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url|:url)?|twitter:image)["'][^>]+content=["']([^"']+)["']/gi
          let m; while ((m = re.exec(html)) && images.length < 6) { const u = resolveUrl(m[1].trim(), body.url); if (u && !images.includes(u)) images.push(u) }
          const jre = /["']image["']\s*:\s*["'](https?:[^"']+\.(?:jpg|jpeg|png|webp|avif)[^"']*)["']/gi
          while ((m = jre.exec(html)) && images.length < 8) { if (!images.includes(m[1])) images.push(m[1].trim()) }
          return json({ success: true, price, title, image: images[0] || '', images })
        } catch (e) { return json({ success: false, error: e.message, price: 0, images: [] }) }
      }
      if (ap === '/proxy-image' && method === 'POST') {
        try {
          const res = await fetch(body.url, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0 Safari/537.36', 'Referer': new URL(body.url).origin } })
          if (!res.ok) return json({ success: false })
          const ct = res.headers.get('content-type') || 'image/jpeg'
          const buf = new Uint8Array(await res.arrayBuffer())
          if (buf.byteLength > 900000) return json({ success: false, error: 'too large', url: body.url })
          let bin = ''; for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i])
          return json({ success: true, dataUrl: `data:${ct};base64,${btoa(bin)}` })
        } catch (e) { return json({ success: false, error: e.message }) }
      }
      if (ap === '/refresh-prices' && method === 'POST') {
        let updated = 0
        for (const prod of d.products.filter(x => x.auto_price_fetch === 1 && x.affiliate_url)) {
          try {
            const res = await fetch(prod.affiliate_url, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0 Safari/537.36' }, redirect: 'follow' })
            const html = await res.text()
            const mp = html.match(/<meta[^>]+(?:property|itemprop|name)=["'](?:product:price:amount|og:price:amount|price)["'][^>]+content=["']([\d.,]+)["']/i) || html.match(/[₹$]\s*([\d,]+(?:\.\d+)?)/)
            const im = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url|:url)?|twitter:image)["'][^>]+content=["']([^"']+)["']/i)
            let did = false
            if (mp) { prod.price = parseFloat(mp[1].replace(/,/g, '')); did = true }
            if (im && (!prod.images || prod.images.length === 0)) { prod.images = [resolveUrl(im[1].trim(), prod.affiliate_url)]; did = true }
            if (did) updated++
          } catch { }
        }
        await saveData(d); return json({ success: true, updated })
      }

      if (ap === '/orders' && method === 'GET') return json([...d.orders].sort((a, b) => b.id - a.id).map(o => ({ ...o, items: JSON.stringify(o.items) })))
      const om = ap.match(/^\/orders\/(\d+)$/)
      if (om && method === 'PUT') { const o = d.orders.find(x => x.id == om[1]); if (o) { if (body.status) o.status = body.status; if (body.payment_status) o.payment_status = body.payment_status; await saveData(d) } return json({ success: true }) }

      if (ap === '/settings' && method === 'GET') return json(d.settings)
      if (ap === '/settings' && method === 'POST') { Object.assign(d.settings, body); await saveData(d); return json({ success: true }) }

      if (ap === '/categories' && method === 'POST') { d.categories.push({ id: d.nextId++, name: body.name, slug: body.slug, icon: body.icon || 'fa-tag', sort_order: body.sort_order || 99 }); await saveData(d); return json({ success: true }) }
      const cm = ap.match(/^\/categories\/(\d+)$/)
      if (cm && method === 'DELETE') { d.categories = d.categories.filter(x => x.id != cm[1]); await saveData(d); return json({ success: true }) }

      // ---- Blocks (homepage sections) ----
      if (ap === '/blocks' && method === 'GET') return json([...(d.blocks || [])].sort((a, b) => a.sort - b.sort))
      if (ap === '/blocks' && method === 'POST') {
        if (!d.blocks) d.blocks = []
        const maxSort = d.blocks.reduce((m, b) => Math.max(m, b.sort || 0), 0)
        const nb = { id: d.nextId++, type: body.type || 'custom', enabled: body.enabled === 0 ? 0 : 1, sort: maxSort + 1, data: body.data || {} }
        d.blocks.push(nb); await saveData(d); return json({ success: true, id: nb.id })
      }
      if (ap === '/blocks/reorder' && method === 'POST') {
        const order = Array.isArray(body.order) ? body.order : []
        order.forEach((id, i) => { const b = (d.blocks || []).find(x => x.id == id); if (b) b.sort = i + 1 })
        await saveData(d); return json({ success: true })
      }
      const bm = ap.match(/^\/blocks\/(\d+)$/)
      if (bm && method === 'PUT') { const b = (d.blocks || []).find(x => x.id == bm[1]); if (b) { if (body.type != null) b.type = body.type; if (body.enabled != null) b.enabled = body.enabled ? 1 : 0; if (body.data != null) b.data = body.data; await saveData(d) } return json({ success: true }) }
      if (bm && method === 'DELETE') { d.blocks = (d.blocks || []).filter(x => x.id != bm[1]); await saveData(d); return json({ success: true }) }

      // ---- AI Block Generator (Groq) ----
      if (ap === '/ai-block' && method === 'POST') {
        const s = d.settings
        const sys = `You are an expert web designer for "${s.store_name || 'Nuvéllé'}", a premium beauty & fashion e-commerce store with a soft blush / rose-gold luxury aesthetic. Generate a single self-contained HTML section based on the user's request.

STRICT RULES:
- Output ONLY raw HTML (a single <section>...</section> or <div>...</div>). No markdown, no code fences, no explanation.
- Use Tailwind CSS utility classes (Tailwind CDN is loaded). You MAY use inline style with the store's CSS variables: var(--rose)=${s.theme_primary || '#E8B4B8'}, var(--mauve)=${s.theme_secondary || '#C98986'}, var(--wine)=${s.theme_dark || '#8C5A5A'}, var(--gold)=${s.theme_accent || '#C9A96A'}.
- Match the luxury rose-gold theme: soft pastels, rounded corners (rounded-2xl/3xl), elegant serif headings (use class "font-serif"), generous whitespace, subtle shadows.
- Fully responsive (mobile-first). Use Font Awesome icons via <i class="fas fa-..."></i> (already loaded).
- Do NOT include <script>, <style> tags, external links to other sites, or forms that post anywhere. Buttons/links may point to /shop or /product.
- Keep it beautiful, on-brand, and ready to drop into the homepage.`
        try {
          const gr = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST', headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: GROQ_MODEL, temperature: 0.6, max_tokens: 1800, messages: [{ role: 'system', content: sys }, { role: 'user', content: String(body.prompt || 'A beautiful promotional section') }] })
          })
          if (!gr.ok) { const et = await gr.text(); return json({ success: false, error: et }, 200) }
          const gj = await gr.json()
          let html = gj.choices?.[0]?.message?.content || ''
          html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
          return json({ success: true, html })
        } catch (e) { return json({ success: false, error: e.message }, 200) }
      }

      if (ap === '/stats' && method === 'GET') {
        const revenue = d.orders.reduce((s, o) => s + (o.total || 0), 0)
        const views = d.events.filter(e => e.type === 'view').length
        const clicks = d.events.filter(e => e.type === 'affiliate_click').length
        const viewCount = {}; d.events.filter(e => e.type === 'view' && e.product_id).forEach(e => viewCount[e.product_id] = (viewCount[e.product_id] || 0) + 1)
        const topProducts = Object.entries(viewCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([pid, v]) => ({ name: (d.products.find(x => x.id == pid) || {}).name || '—', views: v }))
        return json({ products: d.products.length, orders: d.orders.length, revenue, pending: d.orders.filter(o => o.status === 'pending').length, views, affiliate_clicks: clicks, topProducts })
      }
    }
    return json({ error: 'Not found', path }, 404)
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

function serializeProduct(p) { return { ...p, images: JSON.stringify(p.images || []) } }
function normalizeProduct(b) {
  return {
    name: b.name, description: b.description || '', category: b.category, subcategory: b.subcategory || '', brand: b.brand || '',
    price: +b.price || 0, compare_price: +b.compare_price || 0, currency: b.currency || 'INR',
    images: Array.isArray(b.images) ? b.images : (b.images ? JSON.parse(b.images) : []),
    stock: b.stock ?? 100, is_affiliate: b.is_affiliate ? 1 : 0, affiliate_url: b.affiliate_url || '',
    auto_price_fetch: b.auto_price_fetch ? 1 : 0, featured: b.featured ? 1 : 0, active: b.active === 0 ? 0 : 1, tags: b.tags || '',
    rating: b.rating ?? 4.5, reviews_count: b.reviews_count ?? 0,
    faqs: Array.isArray(b.faqs) ? b.faqs.filter(f => f && f.q).map(f => ({ q: String(f.q), a: String(f.a || '') })) : [],
    highlights: b.highlights || '',
    variants: Array.isArray(b.variants) ? b.variants.filter(v => v && (v.name || v.type)).map(v => ({
      type: String(v.type || 'Variant'),
      options: Array.isArray(v.options) ? v.options.filter(o => o && o.label).map(o => ({
        label: String(o.label), color: o.color ? String(o.color) : '', image: o.image ? String(o.image) : '', price: o.price != null && o.price !== '' ? +o.price : null
      })) : []
    })).filter(v => v.options.length) : []
  }
}

export const config = { path: '/api/*' }
