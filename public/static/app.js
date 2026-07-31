// ==================== DIVA STOREFRONT ====================
const $ = (s, e = document) => e.querySelector(s)
const money = (n, cur = '₹') => cur + Number(n || 0).toLocaleString('en-IN')
let SETTINGS = {}, CATS = []

const Cart = {
  get() { try { return JSON.parse(localStorage.getItem('diva_cart') || '[]') } catch { return [] } },
  save(c) { localStorage.setItem('diva_cart', JSON.stringify(c)); updateCartCount() },
  add(p, qty = 1, variant) { const c = this.get(); const vlabel = variant && variant.label ? variant.label : ''; const price = (variant && variant.priceOverride != null) ? variant.priceOverride : p.price; const key = p.id + (vlabel ? '::' + vlabel : ''); const i = c.find(x => x.key === key); if (i) i.qty += qty; else c.push({ key, id: p.id, name: p.name, variant: vlabel, price, image: (JSON.parse(p.images || '[]')[0] || ''), qty }); this.save(c); toast(`${p.name}${vlabel ? ' (' + vlabel + ')' : ''} added to bag`) },
  remove(key) { this.save(this.get().filter(x => (x.key || x.id) !== key)) },
  setQty(key, q) { const c = this.get(); const i = c.find(x => (x.key || x.id) === key); if (i) { i.qty = Math.max(1, q); this.save(c) } },
  count() { return this.get().reduce((s, x) => s + x.qty, 0) },
  subtotal() { return this.get().reduce((s, x) => s + x.price * x.qty, 0) }
}

function toast(msg, type = 'ok') {
  const t = document.createElement('div')
  t.className = `toast fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full text-white shadow-xl ${type === 'ok' ? 'bg-mauve' : 'bg-wine'}`
  t.innerHTML = `<i class="fas fa-${type === 'ok' ? 'check-circle' : 'circle-exclamation'} mr-2"></i>${msg}`
  document.body.appendChild(t); setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300) }, 2400)
}
function updateCartCount() { document.querySelectorAll('.cart-count').forEach(e => { e.textContent = Cart.count(); e.classList.toggle('hidden', Cart.count() === 0) }) }
async function track(type, product_id, meta) { try { await axios.post('/api/track', { type, product_id, meta }) } catch { } }

// ---------- Layout ----------
function nav() {
  const A = SETTINGS.announcement || 'FREE SHIPPING · NEW ARRIVALS · AUTHENTIC LUXURY GUARANTEED'
  return `<header class="glass sticky top-0 z-50">
    <div class="marquee badge-gold text-xs py-1.5 text-center"><span>${A+" ✦ "+A+" ✦ "+A}</span></div>
    <nav class="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
      <button class="md:hidden text-xl text-wine" onclick="openMenu()"><i class="fas fa-bars"></i></button>
      <a href="/" class="font-serif text-3xl font-bold tracking-widest text-wine">${SETTINGS.store_name || 'Nuvéllé'}</a>
      <div class="hidden md:flex items-center gap-8 text-sm font-medium">
        <a href="/" class="hover:text-mauve transition">Home</a>
        <a href="/shop" class="hover:text-mauve transition">Shop</a>
        <div class="relative group">
          <button class="hover:text-mauve transition">Categories <i class="fas fa-chevron-down text-xs"></i></button>
          <div class="absolute hidden group-hover:block bg-white shadow-xl rounded-2xl p-2 mt-2 w-52 border border-rose/30">
            ${CATS.map(c => `<a href="/shop?category=${c.slug}" class="block px-4 py-2 rounded-xl hover:bg-softpink transition"><i class="fas ${c.icon} text-mauve mr-2"></i>${c.name}</a>`).join('')}
          </div>
        </div>
        <a href="/about" class="hover:text-mauve transition">About</a>
        <a href="/faq" class="hover:text-mauve transition">FAQ</a>
      </div>
      <div class="flex items-center gap-5 text-lg text-wine">
        <button onclick="openSearch()" class="hover:text-mauve"><i class="fas fa-search"></i></button>
        <a href="/cart" class="relative hover:text-mauve"><i class="fas fa-bag-shopping"></i><span class="cart-count hidden absolute -top-2 -right-2 bg-mauve text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">0</span></a>
        <a href="/admin" title="Admin Login" class="hover:text-mauve"><i class="fas fa-user-shield"></i></a>
      </div>
    </nav>
    <div id="searchBar" class="hidden border-t border-rose/30 px-5 py-3 bg-white/70"><div class="max-w-2xl mx-auto flex gap-2"><input id="searchInput" placeholder="Search luxury products..." onkeydown="if(event.key==='Enter')doSearch()"><button onclick="doSearch()" class="btn btn-primary px-6"><i class="fas fa-search"></i></button></div></div>
  </header>
  <aside id="mobileMenu" class="fixed inset-0 z-[60] hidden">
    <div class="overlay absolute inset-0 bg-black/40" onclick="closeMenu()"></div>
    <div class="drawer absolute left-0 top-0 h-full w-72 bg-cream p-6 -translate-x-full">
      <div class="flex justify-between items-center mb-8"><span class="font-serif text-2xl text-wine font-bold">${SETTINGS.store_name || 'Nuvéllé'}</span><button onclick="closeMenu()"><i class="fas fa-times text-xl"></i></button></div>
      <a href="/" class="block py-3 border-b border-rose/20">Home</a><a href="/shop" class="block py-3 border-b border-rose/20">Shop</a>
      ${CATS.map(c => `<a href="/shop?category=${c.slug}" class="block py-3 border-b border-rose/20"><i class="fas ${c.icon} text-mauve mr-2"></i>${c.name}</a>`).join('')}
      <a href="/about" class="block py-3 border-b border-rose/20">About</a><a href="/faq" class="block py-3 border-b border-rose/20">FAQ</a><a href="/shipping" class="block py-3 border-b border-rose/20">Shipping & Returns</a><a href="/admin" class="block py-3 text-mauve"><i class="fas fa-user-shield mr-2"></i>Admin Login</a>
    </div>
  </aside>`
}
window.openMenu = () => { const m = $('#mobileMenu'); m.classList.remove('hidden'); setTimeout(() => { $('.drawer', m).classList.remove('-translate-x-full') }, 10) }
window.closeMenu = () => { const m = $('#mobileMenu'); $('.drawer', m).classList.add('-translate-x-full'); setTimeout(() => m.classList.add('hidden'), 400) }
window.openSearch = () => { $('#searchBar').classList.toggle('hidden'); $('#searchInput')?.focus() }
window.doSearch = () => { const q = $('#searchInput').value.trim(); if (q) location.href = '/shop?search=' + encodeURIComponent(q) }

function footer() {
  return `<footer class="mt-24 bg-wine text-blush">
    <div class="max-w-7xl mx-auto px-5 py-14 grid md:grid-cols-4 gap-10">
      <div><h3 class="font-serif text-3xl mb-3 text-white">${SETTINGS.store_name || 'Nuvéllé'}</h3><p class="text-sm text-blush/80">${SETTINGS.store_tagline || 'Beauty. Fashion. Luxury.'}</p>
        <div class="flex gap-4 mt-4 text-lg"><a href="${SETTINGS.social_instagram||'#'}" target="_blank"><i class="fab fa-instagram"></i></a><a href="${SETTINGS.social_facebook||'#'}" target="_blank"><i class="fab fa-facebook"></i></a><a href="${SETTINGS.social_pinterest||'#'}" target="_blank"><i class="fab fa-pinterest"></i></a></div></div>
      <div><h4 class="font-medium mb-4 text-white">Shop</h4><ul class="space-y-2 text-sm text-blush/80">${CATS.map(c => `<li><a href="/shop?category=${c.slug}" class="hover:text-white">${c.name}</a></li>`).join('')}</ul></div>
      <div><h4 class="font-medium mb-4 text-white">Help</h4><ul class="space-y-2 text-sm text-blush/80"><li><a href="/faq" class="hover:text-white">FAQ</a></li><li><a href="/shipping" class="hover:text-white">Shipping & Returns</a></li><li><a href="/contact" class="hover:text-white">Contact Us</a></li><li><a href="/about" class="hover:text-white">About Us</a></li></ul></div>
      <div><h4 class="font-medium mb-4 text-white">Newsletter</h4><p class="text-sm text-blush/80 mb-3">Get 10% off your first order.</p><div class="flex gap-2"><input placeholder="Email" class="!bg-white/10 !border-white/20 !text-white placeholder:!text-blush/60"><button onclick="toast('Subscribed! Welcome to Nuvéllé ✨')" class="btn bg-gold text-white px-4 whitespace-nowrap">Join</button></div></div>
    </div>
    <div class="border-t border-white/10 py-5 text-center text-xs text-blush/70">${SETTINGS.footer_text ? SETTINGS.footer_text + ' · ' : ''}© ${new Date().getFullYear()} ${SETTINGS.store_name || 'Nuvéllé'}. All rights reserved. · Secure payments via PayU · <a href="/admin" class="hover:text-white underline"><i class="fas fa-lock mr-1"></i>Admin Login</a></div>
  </footer>`
}

// ---------- Product Card ----------
function productCard(p) {
  const imgs = JSON.parse(p.images || '[]'); const img = imgs[0] || 'https://via.placeholder.com/400x500?text=Nuvéllé'
  const off = p.compare_price > p.price ? Math.round((1 - p.price / p.compare_price) * 100) : 0
  return `<div class="card group fade-up">
    <a href="/product/${p.id}" class="block relative">
      <div class="aspect-[4/5] overflow-hidden bg-softpink"><img src="${img}" class="pimg w-full h-full object-cover" loading="lazy" alt="${p.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x500/F7E7E4/8C5A5A?text=Nuvéllé'"></div>
      ${off ? `<span class="absolute top-3 left-3 badge-gold text-xs px-2.5 py-1 rounded-full">-${off}%</span>` : ''}
      ${p.featured ? `<span class="absolute top-3 right-3 bg-white/90 text-mauve text-xs px-2.5 py-1 rounded-full"><i class="fas fa-star"></i></span>` : ''}
    </a>
    <div class="p-4">
      <p class="text-[11px] uppercase tracking-wider text-mauve/70 mb-1">${p.brand || ''}</p>
      <a href="/product/${p.id}"><h3 class="font-medium text-sm line-clamp-2 mb-2 hover:text-mauve transition">${p.name}</h3></a>
      <div class="flex items-center gap-1 text-xs text-gold mb-2">${'★'.repeat(Math.round(p.rating))}<span class="text-charcoal/50 ml-1">(${p.reviews_count})</span></div>
      <div class="flex items-center gap-2 mb-3"><span class="font-serif text-xl text-wine font-semibold">${money(p.price)}</span>${off ? `<span class="text-sm text-charcoal/40 line-through">${money(p.compare_price)}</span>` : ''}</div>
      <button onclick='quickAdd(${p.id})' class="btn btn-primary w-full py-2.5 text-sm"><i class="fas fa-bag-shopping mr-1"></i>${p.is_affiliate ? 'View Deal' : 'Add to Bag'}</button>
    </div>
  </div>`
}
window.quickAdd = async (id) => {
  const { data: p } = await axios.get('/api/products/' + id)
  if (p.is_affiliate && p.affiliate_url) { track('affiliate_click', id); window.open(p.affiliate_url, '_blank'); return }
  Cart.add(p)
}

// ==================== PAGES ====================
async function pageHome() {
  let blocks = []
  try { const { data } = await axios.get('/api/blocks'); blocks = data } catch { }
  if (!blocks.length) blocks = [{ type: 'hero', data: {} }, { type: 'category-grid', data: {} }, { type: 'products', data: { filter: 'featured', title: 'Bestsellers', limit: 8 } }, { type: 'features', data: {} }, { type: 'products', data: { filter: 'newest', title: 'New Arrivals', limit: 8 } }]
  // preload product blocks
  const html = []
  for (const b of blocks) html.push(await renderBlock(b))
  return `${nav()}${html.join('')}${footer()}`
}

async function renderBlock(b) {
  const d = b.data || {}
  if (b.type === 'hero') return `<section class="hero-grad">
    <div class="max-w-7xl mx-auto px-5 py-20 md:py-32 grid md:grid-cols-2 gap-10 items-center">
      <div class="fade-up">
        <p class="text-mauve tracking-[.3em] text-sm mb-4">✦ ${d.eyebrow || 'LUXURY REDEFINED'} ✦</p>
        <h1 class="font-serif text-5xl md:text-7xl leading-tight text-wine mb-6">${d.title || SETTINGS.hero_title || 'Where Elegance Meets You'}</h1>
        <p class="text-charcoal/70 text-lg mb-8 max-w-md">${d.subtitle || SETTINGS.hero_subtitle || 'Curated luxury beauty, jewelry & fashion for the modern icon.'}</p>
        <div class="flex gap-4"><a href="${d.link || '/shop'}" class="btn btn-primary px-8 py-3.5">${d.cta || SETTINGS.hero_cta || 'Shop Collection'}</a><a href="/about" class="btn btn-outline px-8 py-3.5">Our Story</a></div>
      </div>
      <div class="fade-up grid grid-cols-2 gap-4">
        <img src="${d.image || SETTINGS.hero_image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500'}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500'" class="rounded-3xl shadow-xl h-64 w-full object-cover mt-8">
        <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500" class="rounded-3xl shadow-xl h-64 w-full object-cover">
        <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500" class="rounded-3xl shadow-xl h-64 w-full object-cover">
        <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=500" class="rounded-3xl shadow-xl h-64 w-full object-cover mt-8">
      </div>
    </div></section>`
  if (b.type === 'category-grid') return `<section class="max-w-7xl mx-auto px-5 py-14">
    <h2 class="font-serif text-4xl text-center text-wine mb-10">${d.title || 'Shop by Category'}</h2>
    <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
      ${CATS.map(c => `<a href="/shop?category=${c.slug}" class="card p-6 text-center group"><div class="w-16 h-16 mx-auto rounded-full bg-softpink flex items-center justify-center mb-3 group-hover:bg-rose transition"><i class="fas ${c.icon} text-2xl text-mauve group-hover:text-white"></i></div><p class="text-sm font-medium">${c.name}</p></a>`).join('')}
    </div></section>`
  if (b.type === 'products') {
    const q = new URLSearchParams(); q.set('limit', d.limit || 8)
    if (d.filter === 'featured') q.set('featured', '1'); else if (d.filter === 'newest') q.set('sort', 'newest'); else if (d.category) q.set('category', d.category)
    let list = []; try { const { data } = await axios.get('/api/products?' + q.toString()); list = data } catch { }
    return `<section class="max-w-7xl mx-auto px-5 py-8">
      <div class="flex justify-between items-end mb-8"><h2 class="font-serif text-4xl text-wine">${d.title || 'Products'}</h2><a href="/shop" class="text-mauve hover:text-wine text-sm">View All <i class="fas fa-arrow-right ml-1"></i></a></div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-5">${list.map(productCard).join('')}</div></section>`
  }
  if (b.type === 'banner') return `<section class="max-w-7xl mx-auto px-5 py-8"><div class="relative rounded-3xl overflow-hidden shadow-xl min-h-[280px] flex items-center" style="background:linear-gradient(90deg, rgba(140,90,90,.72), rgba(201,137,134,.35)), url('${d.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200'}') center/cover">
    <div class="p-10 md:p-16 max-w-lg ${d.align === 'right' ? 'ml-auto text-right' : ''}">
      <h2 class="font-serif text-4xl md:text-5xl text-white mb-4">${d.title || 'Featured Collection'}</h2>
      <p class="text-white/90 mb-6">${d.subtitle || ''}</p>
      <a href="${d.link || '/shop'}" class="btn bg-white text-wine px-8 py-3.5 hover:bg-gold hover:text-white transition inline-block">${d.cta || 'Shop Now'}</a>
    </div></div></section>`
  if (b.type === 'features') return `<section class="hero-grad my-14"><div class="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-8 text-center">
    <div><i class="fas fa-truck-fast text-3xl text-mauve mb-3"></i><h4 class="font-serif text-xl text-wine">Fast Delivery</h4><p class="text-sm text-charcoal/60">Free shipping over ${money(SETTINGS.free_shipping_threshold || 999)}</p></div>
    <div><i class="fas fa-shield-heart text-3xl text-mauve mb-3"></i><h4 class="font-serif text-xl text-wine">100% Authentic</h4><p class="text-sm text-charcoal/60">Genuine luxury products guaranteed</p></div>
    <div><i class="fas fa-rotate-left text-3xl text-mauve mb-3"></i><h4 class="font-serif text-xl text-wine">Easy Returns</h4><p class="text-sm text-charcoal/60">7-day hassle-free returns</p></div>
  </div></section>`
  if (b.type === 'newsletter') return `<section class="max-w-4xl mx-auto px-5 py-14"><div class="card p-10 md:p-14 text-center bg-softpink">
    <h2 class="font-serif text-4xl text-wine mb-3">${d.title || 'Join the Circle'}</h2>
    <p class="text-charcoal/70 mb-6 max-w-lg mx-auto">${d.subtitle || 'Be first to know about new drops & exclusive offers.'}</p>
    <div class="flex gap-2 max-w-md mx-auto"><input id="nlEmail" placeholder="Enter your email" class="flex-1"><button onclick="subscribeNl()" class="btn btn-primary px-6">Subscribe</button></div></div></section>`
  if (b.type === 'reels') {
    let reels = []; try { const { data } = await axios.get('/api/reels'); reels = data } catch { }
    if (!reels.length) return ''
    const handle = SETTINGS.instagram_handle || ''
    return `<section class="max-w-7xl mx-auto px-5 pt-8 pb-4">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-serif text-3xl md:text-4xl text-wine flex items-center gap-2"><i class="fab fa-instagram text-mauve"></i>${d.title || SETTINGS.reels_title || 'Shop Our Reels'}</h2>
        ${handle ? `<a href="https://instagram.com/${handle.replace('@', '')}" target="_blank" class="text-sm text-mauve hover:text-wine">@${handle.replace('@', '')} <i class="fas fa-arrow-right ml-1"></i></a>` : ''}
      </div>
      <div class="flex gap-5 overflow-x-auto pb-4 snap-x">
        ${reels.map(r => `<div class="snap-start shrink-0 w-[240px]">
          <div class="relative rounded-2xl overflow-hidden shadow-lg aspect-[9/16] bg-black group">
            ${r.media_type === 'video' ? `<video src="${r.media_url}" class="w-full h-full object-cover" muted loop playsinline autoplay onmouseover="this.play()" onerror="this.style.display='none'"></video>` : `<img src="${r.media_url}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://via.placeholder.com/240x420/F7E7E4/8C5A5A?text=Reel'">`}
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute top-3 left-3 text-white text-xs bg-black/30 backdrop-blur px-2 py-1 rounded-full"><i class="fab fa-instagram mr-1"></i>Reel</div>
            ${r.caption ? `<p class="absolute bottom-3 left-3 right-3 text-white text-xs leading-snug line-clamp-2">${escapeHtml(r.caption)}</p>` : ''}
          </div>
          ${(r.products || []).length ? `<div class="mt-2 space-y-2">${r.products.map(p => `<a href="${p.url}" ${p.is_affiliate ? 'target="_blank" onclick="track(\'affiliate_click\',' + p.id + ')"' : ''} class="flex items-center gap-2 card p-2 hover:shadow-md transition group">
            <img src="${p.image}" class="w-11 h-11 rounded-lg object-cover shrink-0" onerror="this.onerror=null;this.src='https://via.placeholder.com/80/F7E7E4/8C5A5A?text=N'">
            <div class="min-w-0 flex-1"><p class="text-xs font-medium truncate group-hover:text-mauve">${escapeHtml(p.name)}</p><p class="text-sm text-wine font-serif">${money(p.price)}${p.compare_price > p.price ? ` <span class="text-[10px] text-charcoal/40 line-through">${money(p.compare_price)}</span>` : ''}</p></div>
            <i class="fas fa-arrow-right text-mauve text-xs shrink-0"></i></a>`).join('')}</div>` : ''}
        </div>`).join('')}
      </div></section>`
  }
  if (b.type === 'custom') return `<section class="block-custom">${d.html || ''}</section>`
  return ''
}
window.subscribeNl = () => { const e = $('#nlEmail'); if (e && e.value.includes('@')) { toast('Thank you for subscribing! 💕'); e.value = '' } else toast('Please enter a valid email', 'err') }

async function pageShop() {
  const params = new URLSearchParams(location.search)
  const category = params.get('category') || '', search = params.get('search') || ''
  const q = new URLSearchParams(); if (category) q.set('category', category); if (search) q.set('search', search)
  const { data: products } = await axios.get('/api/products?' + q.toString())
  const catName = CATS.find(c => c.slug === category)?.name
  return `${nav()}
  <div class="max-w-7xl mx-auto px-5 py-10">
    <div class="mb-8"><h1 class="font-serif text-5xl text-wine mb-2">${search ? `Results for "${search}"` : (catName || 'All Products')}</h1><p class="text-charcoal/60">${products.length} products</p></div>
    <div class="flex flex-wrap gap-3 mb-8">
      <a href="/shop" class="chip px-5 py-2 text-sm ${!category ? 'active' : ''}">All</a>
      ${CATS.map(c => `<a href="/shop?category=${c.slug}" class="chip px-5 py-2 text-sm ${category === c.slug ? 'active' : ''}">${c.name}</a>`).join('')}
      <select onchange="location.href='/shop?${category ? 'category=' + category + '&' : ''}sort='+this.value" class="!w-auto ml-auto text-sm">
        <option value="">Sort: Featured</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="rating">Top Rated</option>
      </select>
    </div>
    ${products.length ? `<div class="grid grid-cols-2 md:grid-cols-4 gap-5">${products.map(productCard).join('')}</div>` : `<div class="text-center py-20 text-charcoal/50"><i class="fas fa-box-open text-5xl mb-4"></i><p>No products found.</p></div>`}
  </div>${footer()}`
}

async function pageProduct() {
  const id = location.pathname.split('/').pop()
  const { data: p } = await axios.get('/api/products/' + id)
  track('view', id)
  const imgs = JSON.parse(p.images || '[]'); if (!imgs.length) imgs.push('https://via.placeholder.com/600x750?text=Nuvéllé')
  const off = p.compare_price > p.price ? Math.round((1 - p.price / p.compare_price) * 100) : 0
  const { data: related } = await axios.get('/api/products?category=' + p.category + '&limit=4')
  const reviews = p.reviews || []
  const faqs = Array.isArray(p.faqs) ? p.faqs : []
  const variants = Array.isArray(p.variants) ? p.variants : []
  _variants = variants; _vsel = variants.map(() => 0)
  const hl = (p.highlights || '').split('\n').map(x => x.trim()).filter(Boolean)
  // rating distribution
  const dist = [5, 4, 3, 2, 1].map(n => reviews.filter(r => r.rating === n).length)
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : p.rating
  const revImages = reviews.flatMap(r => (r.media || [])).slice(0, 8)
  return `${nav()}
  <div class="max-w-7xl mx-auto px-5 py-10">
    <nav class="text-sm text-charcoal/50 mb-6"><a href="/" class="hover:text-mauve">Home</a> / <a href="/shop?category=${p.category}" class="hover:text-mauve">${p.category}</a> / <span class="text-wine">${p.name}</span></nav>
    <div class="grid md:grid-cols-2 gap-12">
      <div class="md:sticky md:top-28 self-start">
        <div class="card !rounded-3xl aspect-[4/5] overflow-hidden mb-4"><img id="mainImg" src="${imgs[0]}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x500/F7E7E4/8C5A5A?text=Nuvéllé'"></div>
        <div class="flex gap-3 overflow-x-auto pb-1">${imgs.map((im, i) => `<img src="${im}" onclick="document.getElementById('mainImg').src='${im}';document.querySelectorAll('.thumb').forEach(t=>t.classList.remove('border-mauve'));this.classList.add('border-mauve')" class="thumb w-20 h-24 object-cover rounded-xl cursor-pointer border-2 ${i === 0 ? 'border-mauve' : 'border-transparent'} hover:border-mauve shrink-0" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x500/F7E7E4/8C5A5A?text=Nuvéllé'">`).join('')}</div>
      </div>
      <div class="fade-up">
        <p class="text-mauve uppercase tracking-widest text-sm mb-2">${p.brand || ''}</p>
        <h1 class="font-serif text-4xl md:text-5xl text-wine mb-4">${p.name}</h1>
        <div class="flex items-center gap-2 mb-5"><span class="text-gold text-lg">${stars(avg)}</span><span class="text-sm text-charcoal/60">${(Math.round(avg * 10) / 10)} · ${reviews.length} review${reviews.length === 1 ? '' : 's'}</span><a href="#reviews" class="text-sm text-mauve hover:underline ml-1">See all</a></div>
        <div class="flex items-center gap-3 mb-4"><span class="font-serif text-4xl text-wine font-semibold">${money(p.price)}</span>${off ? `<span class="text-xl text-charcoal/40 line-through">${money(p.compare_price)}</span><span class="badge-gold px-3 py-1 rounded-full text-sm">Save ${off}%</span>` : ''}</div>
        <div class="mb-5 text-sm">${p.stock > 0 ? `<span class="text-green-600"><i class="fas fa-check-circle"></i> In Stock</span>` : `<span class="text-red-500"><i class="fas fa-circle-xmark"></i> Out of Stock</span>`}</div>
        ${(variants.length ? variants.map((v, vi) => `<div class="mb-5"><div class="flex items-center gap-2 mb-2"><span class="text-sm font-medium text-wine">${escapeHtml(v.type)}:</span><span id="vsel${vi}" class="text-sm text-charcoal/60"></span></div><div class="flex gap-3 flex-wrap">${v.options.map((o, oi) => o.color ? `<button onclick="pickVariant(${vi},${oi})" data-v="${vi}" title="${escapeHtml(o.label)}" class="vopt vopt-${vi} w-9 h-9 rounded-full border-2 border-transparent shadow-sm ring-offset-2 hover:ring-2 hover:ring-mauve" style="background:${o.color}"></button>` : (o.image ? `<button onclick="pickVariant(${vi},${oi})" data-v="${vi}" title="${escapeHtml(o.label)}" class="vopt vopt-${vi} w-14 h-14 rounded-xl border-2 border-transparent overflow-hidden hover:border-mauve"><img src="${o.image}" class="w-full h-full object-cover"></button>` : `<button onclick="pickVariant(${vi},${oi})" data-v="${vi}" class="vopt vopt-${vi} px-4 py-2 rounded-full border-2 border-rose/40 text-sm hover:border-mauve">${escapeHtml(o.label)}</button>`)).join('')}</div></div>`).join('') : '')}
        ${p.is_affiliate ? `<button onclick="track('affiliate_click',${p.id});window.open('${p.affiliate_url}','_blank')" class="btn btn-primary w-full py-4 text-lg mb-3"><i class="fas fa-external-link mr-2"></i>Buy Now — Best Deal</button>` : `<div class="flex gap-3 mb-3"><div class="flex items-center border-2 border-rose/40 rounded-full"><button onclick="qadj(-1)" class="px-4 py-3">−</button><span id="qty" class="px-4">1</span><button onclick="qadj(1)" class="px-4 py-3">+</button></div><button onclick="addProduct(${p.id})" ${p.stock <= 0 ? 'disabled' : ''} class="btn btn-primary flex-1 py-4 text-lg ${p.stock <= 0 ? 'opacity-50' : ''}"><i class="fas fa-bag-shopping mr-2"></i>Add to Bag</button></div><button onclick="buyNow(${p.id})" ${p.stock <= 0 ? 'disabled' : ''} class="btn btn-outline w-full py-3.5 mb-2 ${p.stock <= 0 ? 'opacity-50' : ''}"><i class="fas fa-bolt mr-2"></i>Buy Now</button>`}
        <div class="grid grid-cols-3 gap-3 text-center text-xs text-charcoal/60 mt-4 pt-5 border-t border-rose/20"><div><i class="fas fa-truck-fast text-mauve text-lg mb-1"></i><br>Free Shipping</div><div><i class="fas fa-rotate-left text-mauve text-lg mb-1"></i><br>7-Day Returns</div><div><i class="fas fa-lock text-mauve text-lg mb-1"></i><br>Secure Payment</div></div>

        <!-- Description BELOW the buy buttons -->
        <div class="mt-6 pt-6 border-t border-rose/20">
          <h3 class="font-serif text-2xl text-wine mb-3">Description</h3>
          <p class="text-charcoal/70 leading-relaxed whitespace-pre-line">${p.description || 'No description available.'}</p>
          ${hl.length ? `<ul class="mt-4 space-y-2">${hl.map(h => `<li class="flex items-start gap-2 text-sm text-charcoal/70"><i class="fas fa-check text-mauve mt-1"></i>${h}</li>`).join('')}</ul>` : ''}
        </div>
      </div>
    </div>

    ${faqs.length ? `<section class="mt-16 max-w-3xl"><h2 class="font-serif text-3xl text-wine mb-6">Product FAQ</h2>
      <div class="space-y-3">${faqs.map((f, i) => `<div class="card overflow-hidden"><button onclick="togglePfaq(${i})" class="w-full flex justify-between items-center p-5 text-left font-medium"><span>${escapeHtml(f.q)}</span><i id="pfaqi${i}" class="fas fa-plus text-mauve transition"></i></button><div id="pfaq${i}" class="hidden px-5 pb-5 text-charcoal/70 text-sm leading-relaxed">${escapeHtml(f.a)}</div></div>`).join('')}</div></section>` : ''}

    <section id="reviews" class="mt-16">
      <h2 class="font-serif text-3xl text-wine mb-6">Customer Reviews</h2>
      <div class="grid md:grid-cols-3 gap-8 mb-8">
        <div class="card p-6 text-center h-fit">
          <p class="font-serif text-5xl text-wine">${Math.round(avg * 10) / 10}</p>
          <p class="text-gold text-xl my-2">${stars(avg)}</p>
          <p class="text-sm text-charcoal/50">${reviews.length} review${reviews.length === 1 ? '' : 's'}</p>
          <div class="mt-4 space-y-1.5 text-left">${[5, 4, 3, 2, 1].map((n, i) => { const c = dist[i], pct = reviews.length ? Math.round(c / reviews.length * 100) : 0; return `<div class="flex items-center gap-2 text-xs"><span class="w-8 text-charcoal/60">${n}★</span><div class="flex-1 h-2 bg-rose/20 rounded-full overflow-hidden"><div class="h-full bg-gold" style="width:${pct}%"></div></div><span class="w-8 text-right text-charcoal/50">${c}</span></div>` }).join('')}</div>
        </div>
        <div class="md:col-span-2">
          ${revImages.length ? `<div class="flex gap-2 mb-4 overflow-x-auto pb-1">${revImages.map(m => m.type === 'video' ? `<video src="${m.url}" class="w-20 h-20 object-cover rounded-xl shrink-0" muted onclick="this.paused?this.play():this.pause()"></video>` : `<img src="${m.url}" class="w-20 h-20 object-cover rounded-xl shrink-0 cursor-pointer" onclick="document.getElementById('mainImg').scrollIntoView({behavior:'smooth'})">`).join('')}</div>` : ''}
          <div class="space-y-4">${reviews.length ? reviews.map(r => `<div class="card p-5"><div class="flex justify-between mb-2"><span class="font-medium">${escapeHtml(r.customer_name)}</span><span class="text-gold">${stars(r.rating)}</span></div><p class="text-charcoal/70 text-sm mb-2">${escapeHtml(r.comment)}</p>${(r.media && r.media.length) ? `<div class="flex gap-2 flex-wrap">${r.media.map(m => m.type === 'video' ? `<video src="${m.url}" class="w-24 h-24 object-cover rounded-lg" controls muted></video>` : `<img src="${m.url}" class="w-24 h-24 object-cover rounded-lg">`).join('')}</div>` : ''}<p class="text-[11px] text-charcoal/40 mt-2">${new Date(r.created_at).toLocaleDateString()}</p></div>`).join('') : '<p class="text-charcoal/50">No reviews yet. Be the first to review this product!</p>'}</div>
        </div>
      </div>
      <div class="card p-6 max-w-lg"><h3 class="font-serif text-xl text-wine mb-4">Write a Review</h3>
        <input id="rvName" placeholder="Your name" class="mb-3">
        <div class="mb-3"><label class="text-xs text-charcoal/60 block mb-1">Your Rating</label><div id="rvStars" class="text-3xl text-rose cursor-pointer">${[1, 2, 3, 4, 5].map(n => `<span onclick="setRvStar(${n})" onmouseover="hoverRvStar(${n})" data-n="${n}" class="rv-star transition">☆</span>`).join('')}</div></div>
        <textarea id="rvComment" placeholder="Share your experience..." rows="3" class="mb-3"></textarea>
        <div class="mb-3"><label class="btn btn-outline px-4 py-2 text-sm cursor-pointer inline-block"><i class="fas fa-camera mr-1"></i>Add Photos / Videos<input type="file" accept="image/*,video/*" multiple class="hidden" onchange="rvUpload(event)"></label><div id="rvMediaPreview" class="flex gap-2 flex-wrap mt-2"></div></div>
        <button onclick="submitReview(${p.id})" class="btn btn-primary px-6 py-2.5">Submit Review</button></div>
    </section>
    <section class="mt-16"><h2 class="font-serif text-3xl text-wine mb-6">You May Also Like</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-5">${related.filter(r => r.id != id).slice(0, 4).map(productCard).join('')}</div></section>
  </div>${footer()}`
}
function stars(v) { const full = Math.round(v); return '★'.repeat(full) + '☆'.repeat(5 - full) }
let _qty = 1, _rvRating = 0, _rvMedia = [], _variants = [], _vsel = []
window.qadj = (d) => { _qty = Math.max(1, _qty + d); $('#qty').textContent = _qty }
window.pickVariant = (vi, oi) => {
  _vsel[vi] = oi
  document.querySelectorAll('.vopt-' + vi).forEach((b, i) => { b.classList.toggle('ring-2', i === oi); b.classList.toggle('ring-mauve', i === oi); b.classList.toggle('border-mauve', i === oi) })
  const o = _variants[vi].options[oi]
  const lbl = $('#vsel' + vi); if (lbl) lbl.textContent = o.label
}
function selectedVariant() {
  if (!_variants.length) return { label: '', priceOverride: null }
  const parts = _variants.map((v, vi) => { const o = v.options[_vsel[vi] || 0]; return { type: v.type, label: o.label, price: o.price } })
  const label = parts.map(p => p.label).join(' / ')
  const priceOverride = parts.reduce((acc, p) => p.price != null ? p.price : acc, null)
  return { label, priceOverride }
}
window.addProduct = async (id) => { const { data: p } = await axios.get('/api/products/' + id); const sv = selectedVariant(); Cart.add(p, _qty, sv) }
window.buyNow = async (id) => { const { data: p } = await axios.get('/api/products/' + id); const sv = selectedVariant(); Cart.add(p, _qty, sv); location.href = '/checkout' }
window.togglePfaq = (i) => { const el = $('#pfaq' + i), ic = $('#pfaqi' + i); el.classList.toggle('hidden'); ic.classList.toggle('fa-plus'); ic.classList.toggle('fa-minus') }
window.setRvStar = (n) => { _rvRating = n; paintRvStars(n) }
window.hoverRvStar = (n) => paintRvStars(n)
function paintRvStars(n) { document.querySelectorAll('.rv-star').forEach(s => { s.textContent = (+s.dataset.n <= n) ? '★' : '☆'; s.classList.toggle('text-gold', +s.dataset.n <= n) }) }
window.rvUpload = async (ev) => {
  const files = [...ev.target.files]; ev.target.value = ''
  for (const file of files.slice(0, 5)) {
    const isVideo = file.type.startsWith('video')
    if (isVideo && file.size > 6000000) { toast('Video too large (max 6MB)', 'err'); continue }
    try {
      const url = isVideo ? await fileToRawDataUrl(file) : await fileToDataUrlImg(file)
      _rvMedia.push({ type: isVideo ? 'video' : 'image', url })
    } catch { toast('Failed to add media', 'err') }
  }
  renderRvMedia()
}
function renderRvMedia() {
  const box = $('#rvMediaPreview'); if (!box) return
  box.innerHTML = _rvMedia.map((m, i) => `<div class="relative">${m.type === 'video' ? `<video src="${m.url}" class="w-16 h-16 object-cover rounded-lg" muted></video>` : `<img src="${m.url}" class="w-16 h-16 object-cover rounded-lg">`}<button onclick="rmRvMedia(${i})" class="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs">×</button></div>`).join('')
}
window.rmRvMedia = (i) => { _rvMedia.splice(i, 1); renderRvMedia() }
function fileToRawDataUrl(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file) }) }
function fileToDataUrlImg(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => { const img = new Image(); img.onload = () => { const max = 800; let { width: w, height: h } = img; if (w > max || h > max) { const r = Math.min(max / w, max / h); w = Math.round(w * r); h = Math.round(h * r) } const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h); resolve(cv.toDataURL('image/jpeg', 0.8)) }; img.onerror = reject; img.src = reader.result }
    reader.onerror = reject; reader.readAsDataURL(file)
  })
}
window.submitReview = async (id) => {
  const name = $('#rvName').value.trim(), comment = $('#rvComment').value.trim()
  if (!name || !comment) return toast('Please fill name and comment', 'err')
  if (!_rvRating) return toast('Please select a star rating', 'err')
  await axios.post('/api/reviews', { product_id: id, customer_name: name, rating: _rvRating, comment, media: _rvMedia })
  _rvRating = 0; _rvMedia = []; toast('Thank you for your review!'); render()
}

function pageCart() {
  const items = Cart.get(), sub = Cart.subtotal()
  const thr = +(SETTINGS.free_shipping_threshold || 999), fee = +(SETTINGS.shipping_fee || 49)
  const ship = sub >= thr ? 0 : fee
  return `${nav()}<div class="max-w-5xl mx-auto px-5 py-10">
    <h1 class="font-serif text-5xl text-wine mb-8">Shopping Bag</h1>
    ${items.length ? `<div class="grid md:grid-cols-3 gap-8"><div class="md:col-span-2 space-y-4">
      ${items.map(i => { const k = i.key || i.id; return `<div class="card p-4 flex gap-4 items-center"><img src="${i.image}" class="w-24 h-28 object-cover rounded-2xl" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x500/F7E7E4/8C5A5A?text=Nuvéllé'"><div class="flex-1"><h3 class="font-medium">${i.name}</h3>${i.variant ? `<p class="text-xs text-mauve">${i.variant}</p>` : ''}<p class="text-wine font-serif text-lg">${money(i.price)}</p><div class="flex items-center gap-3 mt-2"><div class="flex items-center border border-rose/40 rounded-full text-sm"><button onclick="cartQty('${k}',${i.qty - 1})" class="px-3 py-1">−</button><span class="px-2">${i.qty}</span><button onclick="cartQty('${k}',${i.qty + 1})" class="px-3 py-1">+</button></div><button onclick="cartRemove('${k}')" class="text-red-400 text-sm hover:text-red-600"><i class="fas fa-trash"></i></button></div></div><p class="font-serif text-xl text-wine">${money(i.price * i.qty)}</p></div>` }).join('')}</div>
      <div class="card p-6 h-fit"><h3 class="font-serif text-2xl text-wine mb-4">Order Summary</h3>
        <div class="flex justify-between mb-2 text-sm"><span>Subtotal</span><span>${money(sub)}</span></div>
        <div class="flex justify-between mb-2 text-sm"><span>Shipping</span><span>${ship === 0 ? '<span class="text-green-600">FREE</span>' : money(ship)}</span></div>
        ${ship > 0 ? `<p class="text-xs text-mauve mb-2">Add ${money(thr - sub)} more for free shipping!</p>` : ''}
        <div class="flex justify-between font-serif text-xl text-wine border-t border-rose/20 pt-3 mt-3"><span>Total</span><span>${money(sub + ship)}</span></div>
        <a href="/checkout" class="btn btn-primary w-full py-3.5 mt-5 block text-center">Proceed to Checkout</a>
        <a href="/shop" class="block text-center text-mauve text-sm mt-3 hover:text-wine">Continue Shopping</a></div></div>`
      : `<div class="text-center py-20 text-charcoal/50"><i class="fas fa-bag-shopping text-6xl mb-4 text-rose"></i><p class="text-xl mb-6">Your bag is empty</p><a href="/shop" class="btn btn-primary px-8 py-3">Start Shopping</a></div>`}
  </div>${footer()}`
}
window.cartQty = (k, q) => { Cart.setQty(k, q); render() }
window.cartRemove = (k) => { Cart.remove(k); render() }

function pageCheckout() {
  const items = Cart.get(), sub = Cart.subtotal()
  const thr = +(SETTINGS.free_shipping_threshold || 999), fee = +(SETTINGS.shipping_fee || 49)
  const ship = sub >= thr ? 0 : fee
  if (!items.length) return `${nav()}<div class="text-center py-32"><p class="text-xl text-charcoal/50 mb-4">Your bag is empty</p><a href="/shop" class="btn btn-primary px-8 py-3">Shop Now</a></div>${footer()}`
  return `${nav()}<div class="max-w-5xl mx-auto px-5 py-10"><h1 class="font-serif text-5xl text-wine mb-8">Checkout</h1>
    <div class="grid md:grid-cols-2 gap-10">
      <div class="card p-6"><h3 class="font-serif text-2xl text-wine mb-5">Shipping Details</h3>
        <div class="grid grid-cols-2 gap-3 mb-3"><input id="coName" placeholder="Full Name *"><input id="coPhone" placeholder="Phone *" inputmode="tel"></div>
        <input id="coEmail" type="email" placeholder="Email *" class="mb-3">
        <input id="coAddress" placeholder="House / Flat No., Building, Street *" class="mb-3">
        <input id="coLandmark" placeholder="Landmark / Area (optional)" class="mb-3">
        <div class="grid grid-cols-2 gap-3 mb-3"><input id="coCity" placeholder="City *"><input id="coState" placeholder="State *"></div>
        <div class="grid grid-cols-2 gap-3 mb-3"><input id="coPincode" placeholder="PIN Code *" inputmode="numeric" maxlength="6"><input id="coCountry" value="India" placeholder="Country"></div>
        <div class="bg-softpink rounded-2xl p-4 text-sm"><i class="fas fa-lock text-mauve mr-2"></i>Secure payment powered by <b>PayU</b> · Cash on Delivery available</div>
      </div>
      <div class="card p-6 h-fit"><h3 class="font-serif text-2xl text-wine mb-4">Order Summary</h3>
        ${items.map(i => `<div class="flex justify-between text-sm mb-2"><span>${i.name} ×${i.qty}</span><span>${money(i.price * i.qty)}</span></div>`).join('')}
        <div class="border-t border-rose/20 mt-3 pt-3"><div class="flex justify-between text-sm mb-1"><span>Subtotal</span><span>${money(sub)}</span></div><div class="flex justify-between text-sm mb-1"><span>Shipping</span><span>${ship === 0 ? 'FREE' : money(ship)}</span></div><div class="flex justify-between font-serif text-2xl text-wine mt-2"><span>Total</span><span>${money(sub + ship)}</span></div></div>
        <button onclick="placeOrder()" class="btn btn-primary w-full py-4 mt-5 text-lg"><i class="fas fa-lock mr-2"></i>Pay ${money(sub + ship)}</button>
      </div>
    </div></div>${footer()}`
}
window.placeOrder = async () => {
  const g = id => ($('#' + id) ? $('#' + id).value.trim() : '')
  const name = g('coName'), email = g('coEmail'), phone = g('coPhone'), line = g('coAddress'), landmark = g('coLandmark'), city = g('coCity'), state = g('coState'), pincode = g('coPincode'), country = g('coCountry') || 'India'
  if (!name || !email || !phone || !line || !city || !state || !pincode) return toast('Please fill all required fields', 'err')
  if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Please enter a valid email', 'err')
  if (!/^\d{10}$/.test(phone.replace(/\D/g, '').slice(-10))) return toast('Please enter a valid 10-digit phone', 'err')
  if (!/^\d{6}$/.test(pincode)) return toast('Please enter a valid 6-digit PIN code', 'err')
  const address = `${line}${landmark ? ', ' + landmark : ''}, ${city}, ${state} - ${pincode}, ${country}`
  const items = Cart.get(), sub = Cart.subtotal()
  const { data } = await axios.post('/api/checkout', { name, email, phone, address, city, state, pincode, country, items, subtotal: sub })
  if (data.success) {
    localStorage.removeItem('diva_cart'); updateCartCount()
    document.getElementById('app').innerHTML = `${nav()}<div class="max-w-lg mx-auto px-5 py-24 text-center"><div class="card p-10"><i class="fas fa-circle-check text-6xl text-green-500 mb-5"></i><h1 class="font-serif text-4xl text-wine mb-3">Order Confirmed!</h1><p class="text-charcoal/70 mb-2">Order <b>${data.order_number}</b></p><p class="text-charcoal/70 mb-6">Total paid: <b>${money(data.total)}</b></p><p class="text-sm text-charcoal/50 mb-6">A confirmation email has been sent. Redirecting to PayU for payment...</p><a href="/shop" class="btn btn-primary px-8 py-3">Continue Shopping</a></div></div>${footer()}`
    window.scrollTo(0, 0)
  }
}

function pageAbout() {
  return `${nav()}<div class="hero-grad"><div class="max-w-4xl mx-auto px-5 py-24 text-center"><p class="text-mauve tracking-widest mb-3">OUR STORY</p><h1 class="font-serif text-6xl text-wine mb-6">The Nuvéllé Philosophy</h1><p class="text-lg text-charcoal/70 leading-relaxed">${SETTINGS.about_text||'Born from a passion for timeless elegance, Nuvéllé curates the finest beauty, jewelry & fashion.'}</p></div></div>
  <div class="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-8 text-center">
    <div class="card p-8"><i class="fas fa-gem text-4xl text-mauve mb-4"></i><h3 class="font-serif text-2xl text-wine mb-2">Curated Luxury</h3><p class="text-charcoal/60 text-sm">Hand-picked premium products from trusted global brands.</p></div>
    <div class="card p-8"><i class="fas fa-heart text-4xl text-mauve mb-4"></i><h3 class="font-serif text-2xl text-wine mb-2">Made With Love</h3><p class="text-charcoal/60 text-sm">Every detail crafted to make you feel confident and beautiful.</p></div>
    <div class="card p-8"><i class="fas fa-earth-asia text-4xl text-mauve mb-4"></i><h3 class="font-serif text-2xl text-wine mb-2">Global Standards</h3><p class="text-charcoal/60 text-sm">International quality, authentic products, worldwide inspiration.</p></div>
  </div>${footer()}`
}

function pageFaq() {
  const faqs = [
    ['How long does delivery take?', 'Standard delivery takes 3-7 business days across India. Metro cities usually receive orders within 2-4 days. Express delivery is available at checkout.'],
    ['What is your return policy?', 'We offer a 7-day easy return policy from the date of delivery. Items must be unused, in original packaging with tags intact. Beauty and personal-care products that have been opened cannot be returned for hygiene reasons.'],
    ['How do I return or exchange an item?', 'Contact us via the Contact page or email within 7 days of delivery. Our team will arrange a pickup. Refunds are processed within 5-7 business days to your original payment method after quality check.'],
    ['Are your products authentic?', 'Absolutely. Every product on Nuvéllé is 100% authentic and sourced directly from authorized brands and distributors. We guarantee genuine luxury.'],
    ['What payment methods do you accept?', 'We accept all major credit/debit cards, UPI, net banking and wallets, securely processed through PayU. All transactions are encrypted and safe.'],
    ['Is shipping free?', `Yes! We offer free shipping on all orders above ${money(SETTINGS.free_shipping_threshold || 999)}. Below that, a flat shipping fee of ${money(SETTINGS.shipping_fee || 49)} applies.`],
    ['Do you ship internationally?', 'Currently we ship across India. International shipping is coming soon — subscribe to our newsletter to be notified!'],
    ['How can I track my order?', 'Once your order ships, you will receive a tracking link via email and SMS. You can track your package in real time.']
  ]
  return `${nav()}<div class="max-w-3xl mx-auto px-5 py-14"><h1 class="font-serif text-5xl text-wine text-center mb-3">Frequently Asked Questions</h1><p class="text-center text-charcoal/60 mb-10">Everything you need to know about shopping with Nuvéllé</p>
    <div class="space-y-3">${faqs.map((f, i) => `<div class="card overflow-hidden"><button onclick="toggleFaq(${i})" class="w-full flex justify-between items-center p-5 text-left font-medium"><span>${f[0]}</span><i id="faqi${i}" class="fas fa-plus text-mauve transition"></i></button><div id="faq${i}" class="hidden px-5 pb-5 text-charcoal/70 text-sm leading-relaxed">${f[1]}</div></div>`).join('')}</div></div>${footer()}`
}
window.toggleFaq = (i) => { const el = $('#faq' + i), ic = $('#faqi' + i); el.classList.toggle('hidden'); ic.classList.toggle('fa-plus'); ic.classList.toggle('fa-minus') }

function pageShipping() {
  return `${nav()}<div class="max-w-3xl mx-auto px-5 py-14 prose">
    <h1 class="font-serif text-5xl text-wine mb-8">Shipping & Returns</h1>
    <div class="card p-8 mb-6"><h2 class="font-serif text-2xl text-wine mb-3"><i class="fas fa-truck-fast text-mauve mr-2"></i>Shipping Policy</h2>
      <ul class="space-y-2 text-charcoal/70 text-sm list-disc pl-5"><li>Free shipping on orders above ${money(SETTINGS.free_shipping_threshold || 999)}.</li><li>Flat ${money(SETTINGS.shipping_fee || 49)} shipping on orders below the threshold.</li><li>Standard delivery: 3-7 business days pan-India.</li><li>Orders are processed within 24-48 hours (excluding weekends & holidays).</li><li>You will receive tracking details via email & SMS once dispatched.</li></ul></div>
    <div class="card p-8 mb-6"><h2 class="font-serif text-2xl text-wine mb-3"><i class="fas fa-rotate-left text-mauve mr-2"></i>Returns & Refunds</h2>
      <ul class="space-y-2 text-charcoal/70 text-sm list-disc pl-5"><li><b>7-day return window</b> from the date of delivery.</li><li>Items must be unused, unworn, with original tags & packaging.</li><li>For hygiene reasons, opened beauty & personal-care items are non-returnable.</li><li>Refunds are processed within 5-7 business days after quality inspection.</li><li>Refunds are issued to the original payment method.</li><li>Exchange available for size/defect issues at no extra cost.</li></ul></div>
    <div class="card p-8"><h2 class="font-serif text-2xl text-wine mb-3"><i class="fas fa-shield-heart text-mauve mr-2"></i>Damaged or Wrong Item?</h2><p class="text-charcoal/70 text-sm">If you receive a damaged or incorrect product, contact us within 48 hours with photos. We'll arrange a free replacement or full refund immediately.</p></div>
  </div>${footer()}`
}

function pageContact() {
  return `${nav()}<div class="max-w-2xl mx-auto px-5 py-14"><h1 class="font-serif text-5xl text-wine text-center mb-3">Get in Touch</h1><p class="text-center text-charcoal/60 mb-10">We'd love to hear from you</p>
    <div class="grid grid-cols-3 gap-4 mb-8 text-center"><div class="card p-5"><i class="fas fa-envelope text-mauve text-xl mb-2"></i><p class="text-xs">${SETTINGS.contact_email||'care@nuvelle.com'}</p></div><div class="card p-5"><i class="fas fa-phone text-mauve text-xl mb-2"></i><p class="text-xs">${SETTINGS.contact_phone||'+91 98765 43210'}</p></div><div class="card p-5"><i class="fab fa-whatsapp text-mauve text-xl mb-2"></i><p class="text-xs">Chat with us</p></div></div>
    <div class="card p-8"><input placeholder="Your Name" class="mb-3"><input placeholder="Email" class="mb-3"><textarea placeholder="Your Message" rows="4" class="mb-3"></textarea><button onclick="toast('Message sent! We will reply within 24 hours ✨')" class="btn btn-primary w-full py-3.5">Send Message</button></div>
  </div>${footer()}`
}

// ==================== AI LIVE CHAT SUPPORT (Nuvi) ====================
let CHAT = { open: false, loading: false, history: [] }
function mountChat() {
  if (document.getElementById('nuvi-widget')) return
  const w = document.createElement('div')
  w.id = 'nuvi-widget'
  document.body.appendChild(w)
  renderChat()
}
function renderChat() {
  const w = document.getElementById('nuvi-widget'); if (!w) return
  const msgs = CHAT.history.length ? CHAT.history : [{ role: 'assistant', content: `Hi! I'm Nuvi 💕 your ${SETTINGS.store_name || 'Nuvéllé'} assistant. Ask me about products, orders, shipping, returns — anything!` }]
  w.innerHTML = `
    <button onclick="toggleChat()" class="fixed bottom-6 right-6 z-[90] w-16 h-16 rounded-full btn-primary shadow-2xl flex items-center justify-center text-2xl text-white ${CHAT.open ? 'hidden' : ''}" style="background:linear-gradient(135deg,var(--rose),var(--mauve))" aria-label="Chat support"><i class="fas fa-comment-dots"></i><span class="absolute -top-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></span></button>
    <div class="fixed bottom-6 right-6 z-[95] w-[92vw] max-w-sm ${CHAT.open ? '' : 'hidden'}">
      <div class="card !rounded-3xl overflow-hidden flex flex-col" style="height:min(70vh,560px)">
        <div class="p-4 text-white flex items-center justify-between" style="background:linear-gradient(135deg,var(--mauve),var(--wine))">
          <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><i class="fas fa-headset"></i></div><div><p class="font-serif text-lg leading-tight">Nuvi Support</p><p class="text-[11px] opacity-80"><span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>Online · replies instantly</p></div></div>
          <button onclick="toggleChat()" class="text-xl hover:opacity-70"><i class="fas fa-chevron-down"></i></button>
        </div>
        <div id="nuvi-msgs" class="flex-1 overflow-y-auto p-4 space-y-3 bg-cream">
          ${msgs.map(m => chatBubble(m)).join('')}
          ${CHAT.loading ? `<div class="flex gap-1 pl-2"><span class="w-2 h-2 bg-mauve rounded-full animate-bounce"></span><span class="w-2 h-2 bg-mauve rounded-full animate-bounce" style="animation-delay:.15s"></span><span class="w-2 h-2 bg-mauve rounded-full animate-bounce" style="animation-delay:.3s"></span></div>` : ''}
        </div>
        <div class="p-2 border-t border-rose/20 bg-white">
          ${CHAT.history.length === 0 ? `<div class="flex flex-wrap gap-1.5 px-1 pb-2">${['Track my order', 'Return policy', 'Shipping info', 'Best sellers'].map(q => `<button onclick="quickAsk('${q}')" class="chip text-xs px-3 py-1">${q}</button>`).join('')}</div>` : ''}
          <div class="flex gap-2"><input id="nuvi-input" placeholder="Type your message..." class="!py-2.5 text-sm" onkeydown="if(event.key==='Enter')sendChat()"><button onclick="sendChat()" class="btn btn-primary px-4"><i class="fas fa-paper-plane"></i></button></div>
        </div>
      </div>
    </div>`
  const box = document.getElementById('nuvi-msgs'); if (box) box.scrollTop = box.scrollHeight
}
function chatBubble(m) {
  if (m.role === 'user') return `<div class="flex justify-end"><div class="bg-mauve text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%]">${escapeHtml(m.content)}</div></div>`
  return `<div class="flex gap-2"><div class="w-7 h-7 rounded-full bg-rose/40 flex items-center justify-center text-mauve text-xs shrink-0 mt-1"><i class="fas fa-sparkles"></i></div><div class="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[80%] shadow-sm text-charcoal/90">${formatReply(m.content)}</div></div>`
}
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) }
function formatReply(s) { return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>') }
window.toggleChat = () => { CHAT.open = !CHAT.open; renderChat(); if (CHAT.open) setTimeout(() => document.getElementById('nuvi-input')?.focus(), 100) }
window.quickAsk = (q) => { document.getElementById('nuvi-input').value = q; sendChat() }
window.sendChat = async () => {
  const inp = document.getElementById('nuvi-input'); const text = inp.value.trim(); if (!text || CHAT.loading) return
  CHAT.history.push({ role: 'user', content: text }); inp.value = ''; CHAT.loading = true; renderChat()
  try {
    const { data } = await axios.post('/api/chat', { messages: CHAT.history.slice(-8) })
    CHAT.history.push({ role: 'assistant', content: data.reply || 'Sorry, please try again.' })
  } catch {
    CHAT.history.push({ role: 'assistant', content: `I'm having trouble connecting. Please email ${SETTINGS.contact_email || 'care@nuvelle.com'}.` })
  }
  CHAT.loading = false; renderChat()
}

// ---------- Router ----------
function currentPage() {
  const p = location.pathname.replace(/\/$/, '')
  if (p === '' || p === '/index.html') return 'home'
  if (p.startsWith('/product/')) return 'product'
  const seg = p.slice(1)
  if (['shop', 'cart', 'checkout', 'about', 'faq', 'shipping', 'contact'].includes(seg)) return seg
  return 'home'
}
async function render() {
  const app = $('#app'); const page = currentPage()
  app.innerHTML = `<div class="min-h-screen flex items-center justify-center"><i class="fas fa-spinner spin text-4xl text-mauve"></i></div>`
  try {
    let html = ''
    if (page === 'home') html = await pageHome()
    else if (page === 'shop') html = await pageShop()
    else if (page === 'product') html = await pageProduct()
    else if (page === 'cart') html = pageCart()
    else if (page === 'checkout') html = pageCheckout()
    else if (page === 'about') html = pageAbout()
    else if (page === 'faq') html = pageFaq()
    else if (page === 'shipping') html = pageShipping()
    else if (page === 'contact') html = pageContact()
    app.innerHTML = html; updateCartCount(); window.scrollTo(0, 0)
  } catch (e) { app.innerHTML = `${nav()}<div class="text-center py-32"><p class="text-xl text-charcoal/50">Something went wrong. <a href="/" class="text-mauve">Go Home</a></p></div>`; console.error(e) }
}

function applyTheme() {
  const r = document.documentElement.style
  if (SETTINGS.theme_primary) r.setProperty('--rose', SETTINGS.theme_primary)
  if (SETTINGS.theme_secondary) r.setProperty('--mauve', SETTINGS.theme_secondary)
  if (SETTINGS.theme_dark) r.setProperty('--wine', SETTINGS.theme_dark)
  if (SETTINGS.theme_accent) r.setProperty('--gold', SETTINGS.theme_accent)
  // override tailwind color utility classes to follow theme vars
  let st = document.getElementById('theme-vars'); if (!st) { st = document.createElement('style'); st.id = 'theme-vars'; document.head.appendChild(st) }
  st.textContent = `.text-mauve{color:var(--mauve)!important}.text-wine{color:var(--wine)!important}.text-gold{color:var(--gold)!important}.text-rose{color:var(--rose)!important}
  .bg-mauve{background:var(--mauve)!important}.bg-wine{background:var(--wine)!important}.bg-rose{background:var(--rose)!important}.bg-gold{background:var(--gold)!important}
  .border-mauve{border-color:var(--mauve)!important}`
}
async function boot() {
  try { const [{ data: s }, { data: cats }] = await Promise.all([axios.get('/api/settings'), axios.get('/api/categories')]); SETTINGS = s; CATS = cats } catch { }
  applyTheme()
  render()
  mountChat()
}
boot()
