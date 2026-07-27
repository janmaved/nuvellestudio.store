import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer, adminRenderer } from './renderer'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

const ADMIN_PIN = '2005'

// ---------- Helpers ----------
async function getSetting(db: D1Database, key: string, def = '') {
  const r = await db.prepare('SELECT value FROM settings WHERE key=?').bind(key).first<{ value: string }>()
  return r?.value ?? def
}
function parseImages(s: string): string[] {
  try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a.map(x => String(x).trim()) : [] } catch { return [] }
}
function resolveUrl(u: string, base: string): string {
  try { if (!u) return ''; if (u.startsWith('//')) return 'https:' + u; if (u.startsWith('http')) return u; return new URL(u, base).href } catch { return u }
}

// ==================== PUBLIC API ====================
app.get('/api/products', async (c) => {
  const { category, featured, search, sort, limit } = c.req.query()
  let sql = 'SELECT * FROM products WHERE active=1'
  const b: any[] = []
  if (category) { sql += ' AND category=?'; b.push(category) }
  if (featured === '1') { sql += ' AND featured=1' }
  if (search) { sql += ' AND (name LIKE ? OR description LIKE ? OR brand LIKE ? OR tags LIKE ?)'; const q = `%${search}%`; b.push(q, q, q, q) }
  if (sort === 'price_asc') sql += ' ORDER BY price ASC'
  else if (sort === 'price_desc') sql += ' ORDER BY price DESC'
  else if (sort === 'rating') sql += ' ORDER BY rating DESC'
  else sql += ' ORDER BY featured DESC, created_at DESC'
  if (limit) sql += ` LIMIT ${parseInt(limit) || 100}`
  const { results } = await c.env.DB.prepare(sql).bind(...b).all()
  return c.json(results)
})

app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id')
  const p = await c.env.DB.prepare('SELECT * FROM products WHERE id=?').bind(id).first()
  if (!p) return c.notFound()
  const { results: reviews } = await c.env.DB.prepare('SELECT * FROM reviews WHERE product_id=? ORDER BY created_at DESC').bind(id).all()
  return c.json({ ...p, reviews })
})

app.get('/api/categories', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM categories ORDER BY sort_order').all()
  return c.json(results)
})

app.get('/api/settings', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM settings').all()
  const o: Record<string, string> = {}
  for (const r of results as any[]) if (r.key !== 'payu_key') o[r.key] = r.value
  return c.json(o)
})

app.post('/api/reviews', async (c) => {
  const { product_id, customer_name, rating, comment } = await c.req.json()
  await c.env.DB.prepare('INSERT INTO reviews (product_id, customer_name, rating, comment) VALUES (?,?,?,?)')
    .bind(product_id, customer_name, rating || 5, comment || '').run()
  const agg = await c.env.DB.prepare('SELECT AVG(rating) avg, COUNT(*) cnt FROM reviews WHERE product_id=?').bind(product_id).first<any>()
  await c.env.DB.prepare('UPDATE products SET rating=?, reviews_count=? WHERE id=?')
    .bind(Math.round((agg.avg || 4.5) * 10) / 10, agg.cnt, product_id).run()
  return c.json({ success: true })
})

app.post('/api/track', async (c) => {
  const { type, product_id, meta } = await c.req.json().catch(() => ({}))
  if (type) await c.env.DB.prepare('INSERT INTO events (type, product_id, meta) VALUES (?,?,?)').bind(type, product_id || null, meta || '').run()
  return c.json({ ok: true })
})

// ---------- Checkout / PayU ----------
app.post('/api/checkout', async (c) => {
  const body = await c.req.json()
  const orderNum = 'NV' + Date.now().toString().slice(-8)
  const shippingFee = body.subtotal >= parseFloat(await getSetting(c.env.DB, 'free_shipping_threshold', '999')) ? 0 : parseFloat(await getSetting(c.env.DB, 'shipping_fee', '49'))
  const total = body.subtotal + shippingFee
  await c.env.DB.prepare(`INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, items, subtotal, shipping, total, status, payment_status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(orderNum, body.name, body.email, body.phone || '', body.address || '', JSON.stringify(body.items || []), body.subtotal, shippingFee, total, 'pending', 'pending').run()
  return c.json({ success: true, order_number: orderNum, total, shipping: shippingFee })
})

// ==================== ADMIN API ====================
const admin = new Hono<{ Bindings: Bindings }>()
admin.use('*', async (c, next) => {
  const pin = c.req.header('X-Admin-Pin') || c.req.query('pin')
  if (pin !== ADMIN_PIN) return c.json({ error: 'Unauthorized' }, 401)
  await next()
})

admin.get('/verify', (c) => c.json({ ok: true }))

admin.get('/products', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all()
  return c.json(results)
})

admin.post('/products', async (c) => {
  const p = await c.req.json()
  const r = await c.env.DB.prepare(`INSERT INTO products (name, description, category, subcategory, brand, price, compare_price, currency, images, stock, is_affiliate, affiliate_url, auto_price_fetch, featured, active, tags)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(p.name, p.description || '', p.category, p.subcategory || '', p.brand || '', p.price || 0, p.compare_price || 0, p.currency || 'INR',
      JSON.stringify(p.images || []), p.stock ?? 100, p.is_affiliate ? 1 : 0, p.affiliate_url || '', p.auto_price_fetch ? 1 : 0, p.featured ? 1 : 0, p.active === 0 ? 0 : 1, p.tags || '').run()
  return c.json({ success: true, id: r.meta.last_row_id })
})

admin.put('/products/:id', async (c) => {
  const id = c.req.param('id')
  const p = await c.req.json()
  await c.env.DB.prepare(`UPDATE products SET name=?, description=?, category=?, subcategory=?, brand=?, price=?, compare_price=?, currency=?, images=?, stock=?, is_affiliate=?, affiliate_url=?, auto_price_fetch=?, featured=?, active=?, tags=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .bind(p.name, p.description || '', p.category, p.subcategory || '', p.brand || '', p.price || 0, p.compare_price || 0, p.currency || 'INR',
      JSON.stringify(p.images || []), p.stock ?? 100, p.is_affiliate ? 1 : 0, p.affiliate_url || '', p.auto_price_fetch ? 1 : 0, p.featured ? 1 : 0, p.active === 0 ? 0 : 1, p.tags || '', id).run()
  return c.json({ success: true })
})

admin.delete('/products/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM products WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

// Fetch price + images from affiliate link (scrapes product page metadata)
admin.post('/fetch-price', async (c) => {
  const { url } = await c.req.json()
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36', 'Accept': 'text/html', 'Accept-Language': 'en-US,en;q=0.9' }, redirect: 'follow' })
    const html = await res.text()
    let price = 0, title = '', images: string[] = []
    const metaPrice = html.match(/<meta[^>]+(?:property|itemprop|name)=["'](?:product:price:amount|og:price:amount|price)["'][^>]+content=["']([\d.,]+)["']/i)
      || html.match(/["'](?:price|salePrice|finalPrice|sellingPrice|priceAmount)["']\s*:\s*["']?([\d]+(?:[.,]\d+)?)/i)
      || html.match(/[₹$€£]\s*([\d,]+(?:\.\d{1,2})?)/)
    if (metaPrice) price = parseFloat(metaPrice[1].replace(/,/g, ''))
    const ogTitle = html.match(/<meta[^>]+(?:property|name)=["'](?:og:title|twitter:title)["'][^>]+content=["']([^"']+)["']/i) || html.match(/<title>([^<]+)<\/title>/i)
    if (ogTitle) title = ogTitle[1].trim().replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    // Collect og:image + twitter:image + first few JSON "image" fields
    const imgRe = /<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url|:url)?|twitter:image)["'][^>]+content=["']([^"']+)["']/gi
    let m
    while ((m = imgRe.exec(html)) && images.length < 6) { const u = resolveUrl(m[1].trim(), url); if (u && !images.includes(u)) images.push(u) }
    const jsonImgRe = /["']image["']\s*:\s*["'](https?:[^"']+\.(?:jpg|jpeg|png|webp|avif)[^"']*)["']/gi
    while ((m = jsonImgRe.exec(html)) && images.length < 8) { const u = m[1].trim(); if (!images.includes(u)) images.push(u) }
    return c.json({ success: true, price, title, image: images[0] || '', images })
  } catch (e: any) {
    return c.json({ success: false, error: e.message, price: 0, images: [] })
  }
})

// Server-side image proxy fetch -> returns base64 data URL (bypasses hotlink/CORS blocks so affiliate images always show)
admin.post('/proxy-image', async (c) => {
  const { url } = await c.req.json()
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36', 'Referer': new URL(url).origin } })
    if (!res.ok) return c.json({ success: false })
    const ct = res.headers.get('content-type') || 'image/jpeg'
    const buf = await res.arrayBuffer()
    if (buf.byteLength > 900000) return c.json({ success: false, error: 'too large', url }) // keep DB rows small; use original url
    let bin = ''; const bytes = new Uint8Array(buf)
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
    const b64 = btoa(bin)
    return c.json({ success: true, dataUrl: `data:${ct};base64,${b64}` })
  } catch (e: any) {
    return c.json({ success: false, error: e.message })
  }
})

// Refresh all auto-price affiliate products (price + images)
admin.post('/refresh-prices', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, affiliate_url, images FROM products WHERE auto_price_fetch=1 AND affiliate_url != ""').all()
  let updated = 0
  for (const p of results as any[]) {
    try {
      const res = await fetch(p.affiliate_url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36' }, redirect: 'follow' })
      const html = await res.text()
      const pm = html.match(/<meta[^>]+(?:property|itemprop|name)=["'](?:product:price:amount|og:price:amount|price)["'][^>]+content=["']([\d.,]+)["']/i) || html.match(/["'](?:price|salePrice|finalPrice)["']\s*:\s*["']?([\d]+(?:[.,]\d+)?)/i) || html.match(/[₹$]\s*([\d,]+(?:\.\d+)?)/)
      const im = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url|:url)?|twitter:image)["'][^>]+content=["']([^"']+)["']/i)
      let didUpdate = false
      if (pm) { await c.env.DB.prepare('UPDATE products SET price=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(parseFloat(pm[1].replace(/,/g, '')), p.id).run(); didUpdate = true }
      const existing = parseImages(p.images)
      if (im && existing.length === 0) { await c.env.DB.prepare('UPDATE products SET images=? WHERE id=?').bind(JSON.stringify([resolveUrl(im[1].trim(), p.affiliate_url)]), p.id).run(); didUpdate = true }
      if (didUpdate) updated++
    } catch { }
  }
  return c.json({ success: true, updated })
})

admin.get('/orders', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
  return c.json(results)
})

admin.put('/orders/:id', async (c) => {
  const { status, payment_status } = await c.req.json()
  await c.env.DB.prepare('UPDATE orders SET status=COALESCE(?,status), payment_status=COALESCE(?,payment_status) WHERE id=?')
    .bind(status || null, payment_status || null, c.req.param('id')).run()
  return c.json({ success: true })
})

admin.get('/settings', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM settings').all()
  const o: Record<string, string> = {}
  for (const r of results as any[]) o[r.key] = r.value
  return c.json(o)
})

admin.post('/settings', async (c) => {
  const body = await c.req.json()
  for (const [k, v] of Object.entries(body)) {
    await c.env.DB.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=?').bind(k, String(v), String(v)).run()
  }
  return c.json({ success: true })
})

admin.post('/categories', async (c) => {
  const p = await c.req.json()
  await c.env.DB.prepare('INSERT INTO categories (name, slug, icon, sort_order) VALUES (?,?,?,?)').bind(p.name, p.slug, p.icon || '', p.sort_order || 0).run()
  return c.json({ success: true })
})

admin.delete('/categories/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM categories WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ success: true })
})

admin.get('/stats', async (c) => {
  const db = c.env.DB
  const prod = await db.prepare('SELECT COUNT(*) c FROM products').first<any>()
  const orders = await db.prepare('SELECT COUNT(*) c, COALESCE(SUM(total),0) rev FROM orders').first<any>()
  const pending = await db.prepare("SELECT COUNT(*) c FROM orders WHERE status='pending'").first<any>()
  const views = await db.prepare("SELECT COUNT(*) c FROM events WHERE type='view'").first<any>()
  const clicks = await db.prepare("SELECT COUNT(*) c FROM events WHERE type='affiliate_click'").first<any>()
  const { results: topProducts } = await db.prepare("SELECT p.name, COUNT(e.id) views FROM events e JOIN products p ON p.id=e.product_id WHERE e.type='view' GROUP BY e.product_id ORDER BY views DESC LIMIT 5").all()
  return c.json({ products: prod.c, orders: orders.c, revenue: orders.rev, pending: pending.c, views: views.c, affiliate_clicks: clicks.c, topProducts })
})

app.route('/api/admin', admin)

// ==================== PAGES ====================
app.get('/', (c) => c.html(renderer('Nuvéllé — Beauty. Fashion. Luxury.', 'home')))
app.get('/shop', (c) => c.html(renderer('Shop — Nuvéllé', 'shop')))
app.get('/product/:id', (c) => c.html(renderer('Product — Nuvéllé', 'product')))
app.get('/cart', (c) => c.html(renderer('Cart — Nuvéllé', 'cart')))
app.get('/checkout', (c) => c.html(renderer('Checkout — Nuvéllé', 'checkout')))
app.get('/about', (c) => c.html(renderer('About — Nuvéllé', 'about')))
app.get('/faq', (c) => c.html(renderer('FAQ — Nuvéllé', 'faq')))
app.get('/shipping', (c) => c.html(renderer('Shipping & Returns — Nuvéllé', 'shipping')))
app.get('/contact', (c) => c.html(renderer('Contact — Nuvéllé', 'contact')))
app.get('/admin', (c) => c.html(adminRenderer()))
app.get('/favicon.ico', (c) => c.body('', 204))

export default app
