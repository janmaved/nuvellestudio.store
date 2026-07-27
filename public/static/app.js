// ==================== DIVA STOREFRONT ====================
const $ = (s, e = document) => e.querySelector(s)
const money = (n, cur = '₹') => cur + Number(n || 0).toLocaleString('en-IN')
let SETTINGS = {}, CATS = []

const Cart = {
  get() { try { return JSON.parse(localStorage.getItem('diva_cart') || '[]') } catch { return [] } },
  save(c) { localStorage.setItem('diva_cart', JSON.stringify(c)); updateCartCount() },
  add(p, qty = 1) { const c = this.get(); const i = c.find(x => x.id === p.id); if (i) i.qty += qty; else c.push({ id: p.id, name: p.name, price: p.price, image: (JSON.parse(p.images || '[]')[0] || ''), qty }); this.save(c); toast(`${p.name} added to bag`) },
  remove(id) { this.save(this.get().filter(x => x.id !== id)) },
  setQty(id, q) { const c = this.get(); const i = c.find(x => x.id === id); if (i) { i.qty = Math.max(1, q); this.save(c) } },
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
  return `<header class="glass sticky top-0 z-50">
    <div class="marquee badge-gold text-xs py-1.5 text-center"><span>✦ FREE SHIPPING OVER ${money(SETTINGS.free_shipping_threshold || 999)} ✦ NEW ARRIVALS EVERY WEEK ✦ AUTHENTIC LUXURY GUARANTEED ✦ FREE SHIPPING OVER ${money(SETTINGS.free_shipping_threshold || 999)} ✦ NEW ARRIVALS EVERY WEEK ✦ AUTHENTIC LUXURY GUARANTEED ✦</span></div>
    <nav class="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
      <button class="md:hidden text-xl text-wine" onclick="openMenu()"><i class="fas fa-bars"></i></button>
      <a href="/" class="font-serif text-3xl font-bold tracking-widest text-wine">${SETTINGS.store_name || 'DIVA'}</a>
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
      </div>
    </nav>
    <div id="searchBar" class="hidden border-t border-rose/30 px-5 py-3 bg-white/70"><div class="max-w-2xl mx-auto flex gap-2"><input id="searchInput" placeholder="Search luxury products..." onkeydown="if(event.key==='Enter')doSearch()"><button onclick="doSearch()" class="btn btn-primary px-6"><i class="fas fa-search"></i></button></div></div>
  </header>
  <aside id="mobileMenu" class="fixed inset-0 z-[60] hidden">
    <div class="overlay absolute inset-0 bg-black/40" onclick="closeMenu()"></div>
    <div class="drawer absolute left-0 top-0 h-full w-72 bg-cream p-6 -translate-x-full">
      <div class="flex justify-between items-center mb-8"><span class="font-serif text-2xl text-wine font-bold">${SETTINGS.store_name || 'DIVA'}</span><button onclick="closeMenu()"><i class="fas fa-times text-xl"></i></button></div>
      <a href="/" class="block py-3 border-b border-rose/20">Home</a><a href="/shop" class="block py-3 border-b border-rose/20">Shop</a>
      ${CATS.map(c => `<a href="/shop?category=${c.slug}" class="block py-3 border-b border-rose/20"><i class="fas ${c.icon} text-mauve mr-2"></i>${c.name}</a>`).join('')}
      <a href="/about" class="block py-3 border-b border-rose/20">About</a><a href="/faq" class="block py-3 border-b border-rose/20">FAQ</a><a href="/shipping" class="block py-3">Shipping & Returns</a>
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
      <div><h3 class="font-serif text-3xl mb-3 text-white">${SETTINGS.store_name || 'DIVA'}</h3><p class="text-sm text-blush/80">${SETTINGS.store_tagline || 'Beauty. Fashion. Luxury.'}</p>
        <div class="flex gap-4 mt-4 text-lg"><a href="#"><i class="fab fa-instagram"></i></a><a href="#"><i class="fab fa-facebook"></i></a><a href="#"><i class="fab fa-pinterest"></i></a><a href="#"><i class="fab fa-tiktok"></i></a></div></div>
      <div><h4 class="font-medium mb-4 text-white">Shop</h4><ul class="space-y-2 text-sm text-blush/80">${CATS.map(c => `<li><a href="/shop?category=${c.slug}" class="hover:text-white">${c.name}</a></li>`).join('')}</ul></div>
      <div><h4 class="font-medium mb-4 text-white">Help</h4><ul class="space-y-2 text-sm text-blush/80"><li><a href="/faq" class="hover:text-white">FAQ</a></li><li><a href="/shipping" class="hover:text-white">Shipping & Returns</a></li><li><a href="/contact" class="hover:text-white">Contact Us</a></li><li><a href="/about" class="hover:text-white">About Us</a></li></ul></div>
      <div><h4 class="font-medium mb-4 text-white">Newsletter</h4><p class="text-sm text-blush/80 mb-3">Get 10% off your first order.</p><div class="flex gap-2"><input placeholder="Email" class="!bg-white/10 !border-white/20 !text-white placeholder:!text-blush/60"><button onclick="toast('Subscribed! Welcome to DIVA ✨')" class="btn bg-gold text-white px-4 whitespace-nowrap">Join</button></div></div>
    </div>
    <div class="border-t border-white/10 py-5 text-center text-xs text-blush/70">© ${new Date().getFullYear()} ${SETTINGS.store_name || 'DIVA'}. All rights reserved. · Secure payments via PayU</div>
  </footer>`
}

// ---------- Product Card ----------
function productCard(p) {
  const imgs = JSON.parse(p.images || '[]'); const img = imgs[0] || 'https://via.placeholder.com/400x500?text=DIVA'
  const off = p.compare_price > p.price ? Math.round((1 - p.price / p.compare_price) * 100) : 0
  return `<div class="card group fade-up">
    <a href="/product/${p.id}" class="block relative">
      <div class="aspect-[4/5] overflow-hidden bg-softpink"><img src="${img}" class="pimg w-full h-full object-cover" loading="lazy" alt="${p.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x500/F7E7E4/8C5A5A?text=DIVA'"></div>
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
  const [{ data: featured }, { data: newest }] = await Promise.all([
    axios.get('/api/products?featured=1&limit=8'), axios.get('/api/products?limit=8&sort=newest')
  ])
  return `${nav()}
  <section class="hero-grad">
    <div class="max-w-7xl mx-auto px-5 py-20 md:py-32 grid md:grid-cols-2 gap-10 items-center">
      <div class="fade-up">
        <p class="text-mauve tracking-[.3em] text-sm mb-4">✦ LUXURY REDEFINED ✦</p>
        <h1 class="font-serif text-5xl md:text-7xl leading-tight text-wine mb-6">${SETTINGS.hero_title || 'Where Elegance Meets You'}</h1>
        <p class="text-charcoal/70 text-lg mb-8 max-w-md">${SETTINGS.hero_subtitle || 'Curated luxury beauty, jewelry & fashion for the modern icon.'}</p>
        <div class="flex gap-4"><a href="/shop" class="btn btn-primary px-8 py-3.5">Shop Collection</a><a href="/about" class="btn btn-outline px-8 py-3.5">Our Story</a></div>
      </div>
      <div class="fade-up grid grid-cols-2 gap-4">
        <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500" class="rounded-3xl shadow-xl h-64 w-full object-cover mt-8">
        <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500" class="rounded-3xl shadow-xl h-64 w-full object-cover">
        <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500" class="rounded-3xl shadow-xl h-64 w-full object-cover">
        <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=500" class="rounded-3xl shadow-xl h-64 w-full object-cover mt-8">
      </div>
    </div>
  </section>
  <section class="max-w-7xl mx-auto px-5 py-14">
    <h2 class="font-serif text-4xl text-center text-wine mb-10">Shop by Category</h2>
    <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
      ${CATS.map(c => `<a href="/shop?category=${c.slug}" class="card p-6 text-center group"><div class="w-16 h-16 mx-auto rounded-full bg-softpink flex items-center justify-center mb-3 group-hover:bg-rose transition"><i class="fas ${c.icon} text-2xl text-mauve group-hover:text-white"></i></div><p class="text-sm font-medium">${c.name}</p></a>`).join('')}
    </div>
  </section>
  <section class="max-w-7xl mx-auto px-5 py-8">
    <div class="flex justify-between items-end mb-8"><h2 class="font-serif text-4xl text-wine">Bestsellers</h2><a href="/shop" class="text-mauve hover:text-wine text-sm">View All <i class="fas fa-arrow-right ml-1"></i></a></div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">${featured.map(productCard).join('')}</div>
  </section>
  <section class="hero-grad my-14"><div class="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-8 text-center">
    <div><i class="fas fa-truck-fast text-3xl text-mauve mb-3"></i><h4 class="font-serif text-xl text-wine">Fast Delivery</h4><p class="text-sm text-charcoal/60">Free shipping over ${money(SETTINGS.free_shipping_threshold || 999)}</p></div>
    <div><i class="fas fa-shield-heart text-3xl text-mauve mb-3"></i><h4 class="font-serif text-xl text-wine">100% Authentic</h4><p class="text-sm text-charcoal/60">Genuine luxury products guaranteed</p></div>
    <div><i class="fas fa-rotate-left text-3xl text-mauve mb-3"></i><h4 class="font-serif text-xl text-wine">Easy Returns</h4><p class="text-sm text-charcoal/60">7-day hassle-free returns</p></div>
  </div></section>
  <section class="max-w-7xl mx-auto px-5 py-8">
    <h2 class="font-serif text-4xl text-wine mb-8">New Arrivals</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">${newest.map(productCard).join('')}</div>
  </section>
  ${footer()}`
}

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
  const imgs = JSON.parse(p.images || '[]'); if (!imgs.length) imgs.push('https://via.placeholder.com/600x750?text=DIVA')
  const off = p.compare_price > p.price ? Math.round((1 - p.price / p.compare_price) * 100) : 0
  const { data: related } = await axios.get('/api/products?category=' + p.category + '&limit=4')
  return `${nav()}
  <div class="max-w-7xl mx-auto px-5 py-10">
    <nav class="text-sm text-charcoal/50 mb-6"><a href="/" class="hover:text-mauve">Home</a> / <a href="/shop?category=${p.category}" class="hover:text-mauve">${p.category}</a> / <span class="text-wine">${p.name}</span></nav>
    <div class="grid md:grid-cols-2 gap-12">
      <div>
        <div class="card !rounded-3xl aspect-[4/5] overflow-hidden mb-4"><img id="mainImg" src="${imgs[0]}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x500/F7E7E4/8C5A5A?text=DIVA'"></div>
        <div class="flex gap-3">${imgs.map((im, i) => `<img src="${im}" onclick="document.getElementById('mainImg').src='${im}'" class="w-20 h-24 object-cover rounded-xl cursor-pointer border-2 ${i === 0 ? 'border-mauve' : 'border-transparent'} hover:border-mauve" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x500/F7E7E4/8C5A5A?text=DIVA'">`).join('')}</div>
      </div>
      <div class="fade-up">
        <p class="text-mauve uppercase tracking-widest text-sm mb-2">${p.brand || ''}</p>
        <h1 class="font-serif text-4xl md:text-5xl text-wine mb-4">${p.name}</h1>
        <div class="flex items-center gap-2 mb-5"><span class="text-gold">${'★'.repeat(Math.round(p.rating))}</span><span class="text-sm text-charcoal/60">${p.rating} · ${p.reviews_count} reviews</span></div>
        <div class="flex items-center gap-3 mb-6"><span class="font-serif text-4xl text-wine font-semibold">${money(p.price)}</span>${off ? `<span class="text-xl text-charcoal/40 line-through">${money(p.compare_price)}</span><span class="badge-gold px-3 py-1 rounded-full text-sm">Save ${off}%</span>` : ''}</div>
        <p class="text-charcoal/70 leading-relaxed mb-6">${p.description || ''}</p>
        <div class="mb-6 text-sm">${p.stock > 0 ? `<span class="text-green-600"><i class="fas fa-check-circle"></i> In Stock</span>` : `<span class="text-red-500">Out of Stock</span>`}</div>
        ${p.is_affiliate ? `<button onclick="track('affiliate_click',${p.id});window.open('${p.affiliate_url}','_blank')" class="btn btn-primary w-full py-4 text-lg mb-3"><i class="fas fa-external-link mr-2"></i>Buy Now — Best Deal</button>` : `<div class="flex gap-3 mb-3"><div class="flex items-center border-2 border-rose/40 rounded-full"><button onclick="qadj(-1)" class="px-4 py-3">−</button><span id="qty" class="px-4">1</span><button onclick="qadj(1)" class="px-4 py-3">+</button></div><button onclick="addProduct(${p.id})" class="btn btn-primary flex-1 py-4 text-lg"><i class="fas fa-bag-shopping mr-2"></i>Add to Bag</button></div>`}
        <div class="grid grid-cols-3 gap-3 text-center text-xs text-charcoal/60 mt-6 pt-6 border-t border-rose/20"><div><i class="fas fa-truck-fast text-mauve text-lg mb-1"></i><br>Free Shipping</div><div><i class="fas fa-rotate-left text-mauve text-lg mb-1"></i><br>7-Day Returns</div><div><i class="fas fa-lock text-mauve text-lg mb-1"></i><br>Secure Payment</div></div>
      </div>
    </div>
    <div class="mt-16"><h2 class="font-serif text-3xl text-wine mb-6">Customer Reviews</h2>
      <div class="space-y-4 mb-8">${(p.reviews || []).length ? p.reviews.map(r => `<div class="card p-5"><div class="flex justify-between mb-2"><span class="font-medium">${r.customer_name}</span><span class="text-gold">${'★'.repeat(r.rating)}</span></div><p class="text-charcoal/70 text-sm">${r.comment}</p></div>`).join('') : '<p class="text-charcoal/50">No reviews yet. Be the first!</p>'}</div>
      <div class="card p-6 max-w-lg"><h3 class="font-serif text-xl text-wine mb-4">Write a Review</h3>
        <input id="rvName" placeholder="Your name" class="mb-3">
        <select id="rvRating" class="mb-3"><option value="5">★★★★★ Excellent</option><option value="4">★★★★ Good</option><option value="3">★★★ Average</option><option value="2">★★ Poor</option><option value="1">★ Bad</option></select>
        <textarea id="rvComment" placeholder="Share your experience..." rows="3" class="mb-3"></textarea>
        <button onclick="submitReview(${p.id})" class="btn btn-primary px-6 py-2.5">Submit Review</button></div>
    </div>
    <div class="mt-16"><h2 class="font-serif text-3xl text-wine mb-6">You May Also Like</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-5">${related.filter(r => r.id != id).slice(0, 4).map(productCard).join('')}</div></div>
  </div>${footer()}`
}
let _qty = 1
window.qadj = (d) => { _qty = Math.max(1, _qty + d); $('#qty').textContent = _qty }
window.addProduct = async (id) => { const { data: p } = await axios.get('/api/products/' + id); Cart.add(p, _qty) }
window.submitReview = async (id) => {
  const name = $('#rvName').value.trim(), comment = $('#rvComment').value.trim(), rating = +$('#rvRating').value
  if (!name || !comment) return toast('Please fill all fields', 'err')
  await axios.post('/api/reviews', { product_id: id, customer_name: name, rating, comment }); toast('Thank you for your review!'); render()
}

function pageCart() {
  const items = Cart.get(), sub = Cart.subtotal()
  const thr = +(SETTINGS.free_shipping_threshold || 999), fee = +(SETTINGS.shipping_fee || 49)
  const ship = sub >= thr ? 0 : fee
  return `${nav()}<div class="max-w-5xl mx-auto px-5 py-10">
    <h1 class="font-serif text-5xl text-wine mb-8">Shopping Bag</h1>
    ${items.length ? `<div class="grid md:grid-cols-3 gap-8"><div class="md:col-span-2 space-y-4">
      ${items.map(i => `<div class="card p-4 flex gap-4 items-center"><img src="${i.image}" class="w-24 h-28 object-cover rounded-2xl" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x500/F7E7E4/8C5A5A?text=DIVA'"><div class="flex-1"><h3 class="font-medium">${i.name}</h3><p class="text-wine font-serif text-lg">${money(i.price)}</p><div class="flex items-center gap-3 mt-2"><div class="flex items-center border border-rose/40 rounded-full text-sm"><button onclick="cartQty(${i.id},${i.qty - 1})" class="px-3 py-1">−</button><span class="px-2">${i.qty}</span><button onclick="cartQty(${i.id},${i.qty + 1})" class="px-3 py-1">+</button></div><button onclick="cartRemove(${i.id})" class="text-red-400 text-sm hover:text-red-600"><i class="fas fa-trash"></i></button></div></div><p class="font-serif text-xl text-wine">${money(i.price * i.qty)}</p></div>`).join('')}</div>
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
window.cartQty = (id, q) => { Cart.setQty(id, q); render() }
window.cartRemove = (id) => { Cart.remove(id); render() }

function pageCheckout() {
  const items = Cart.get(), sub = Cart.subtotal()
  const thr = +(SETTINGS.free_shipping_threshold || 999), fee = +(SETTINGS.shipping_fee || 49)
  const ship = sub >= thr ? 0 : fee
  if (!items.length) return `${nav()}<div class="text-center py-32"><p class="text-xl text-charcoal/50 mb-4">Your bag is empty</p><a href="/shop" class="btn btn-primary px-8 py-3">Shop Now</a></div>${footer()}`
  return `${nav()}<div class="max-w-5xl mx-auto px-5 py-10"><h1 class="font-serif text-5xl text-wine mb-8">Checkout</h1>
    <div class="grid md:grid-cols-2 gap-10">
      <div class="card p-6"><h3 class="font-serif text-2xl text-wine mb-5">Shipping Details</h3>
        <input id="coName" placeholder="Full Name *" class="mb-3">
        <input id="coEmail" type="email" placeholder="Email *" class="mb-3">
        <input id="coPhone" placeholder="Phone *" class="mb-3">
        <textarea id="coAddress" placeholder="Full Address *" rows="3" class="mb-3"></textarea>
        <div class="bg-softpink rounded-2xl p-4 text-sm"><i class="fas fa-lock text-mauve mr-2"></i>Secure payment powered by <b>PayU</b></div>
      </div>
      <div class="card p-6 h-fit"><h3 class="font-serif text-2xl text-wine mb-4">Order Summary</h3>
        ${items.map(i => `<div class="flex justify-between text-sm mb-2"><span>${i.name} ×${i.qty}</span><span>${money(i.price * i.qty)}</span></div>`).join('')}
        <div class="border-t border-rose/20 mt-3 pt-3"><div class="flex justify-between text-sm mb-1"><span>Subtotal</span><span>${money(sub)}</span></div><div class="flex justify-between text-sm mb-1"><span>Shipping</span><span>${ship === 0 ? 'FREE' : money(ship)}</span></div><div class="flex justify-between font-serif text-2xl text-wine mt-2"><span>Total</span><span>${money(sub + ship)}</span></div></div>
        <button onclick="placeOrder()" class="btn btn-primary w-full py-4 mt-5 text-lg"><i class="fas fa-lock mr-2"></i>Pay ${money(sub + ship)}</button>
      </div>
    </div></div>${footer()}`
}
window.placeOrder = async () => {
  const name = $('#coName').value.trim(), email = $('#coEmail').value.trim(), phone = $('#coPhone').value.trim(), address = $('#coAddress').value.trim()
  if (!name || !email || !phone || !address) return toast('Please fill all required fields', 'err')
  const items = Cart.get(), sub = Cart.subtotal()
  const { data } = await axios.post('/api/checkout', { name, email, phone, address, items, subtotal: sub })
  if (data.success) {
    localStorage.removeItem('diva_cart'); updateCartCount()
    document.getElementById('app').innerHTML = `${nav()}<div class="max-w-lg mx-auto px-5 py-24 text-center"><div class="card p-10"><i class="fas fa-circle-check text-6xl text-green-500 mb-5"></i><h1 class="font-serif text-4xl text-wine mb-3">Order Confirmed!</h1><p class="text-charcoal/70 mb-2">Order <b>${data.order_number}</b></p><p class="text-charcoal/70 mb-6">Total paid: <b>${money(data.total)}</b></p><p class="text-sm text-charcoal/50 mb-6">A confirmation email has been sent. Redirecting to PayU for payment...</p><a href="/shop" class="btn btn-primary px-8 py-3">Continue Shopping</a></div></div>${footer()}`
    window.scrollTo(0, 0)
  }
}

function pageAbout() {
  return `${nav()}<div class="hero-grad"><div class="max-w-4xl mx-auto px-5 py-24 text-center"><p class="text-mauve tracking-widest mb-3">OUR STORY</p><h1 class="font-serif text-6xl text-wine mb-6">The DIVA Philosophy</h1><p class="text-lg text-charcoal/70 leading-relaxed">Born from a passion for timeless elegance, DIVA curates the world's finest beauty, jewelry & fashion. We believe every woman and man deserves to feel like an icon.</p></div></div>
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
    ['Are your products authentic?', 'Absolutely. Every product on DIVA is 100% authentic and sourced directly from authorized brands and distributors. We guarantee genuine luxury.'],
    ['What payment methods do you accept?', 'We accept all major credit/debit cards, UPI, net banking and wallets, securely processed through PayU. All transactions are encrypted and safe.'],
    ['Is shipping free?', `Yes! We offer free shipping on all orders above ${money(SETTINGS.free_shipping_threshold || 999)}. Below that, a flat shipping fee of ${money(SETTINGS.shipping_fee || 49)} applies.`],
    ['Do you ship internationally?', 'Currently we ship across India. International shipping is coming soon — subscribe to our newsletter to be notified!'],
    ['How can I track my order?', 'Once your order ships, you will receive a tracking link via email and SMS. You can track your package in real time.']
  ]
  return `${nav()}<div class="max-w-3xl mx-auto px-5 py-14"><h1 class="font-serif text-5xl text-wine text-center mb-3">Frequently Asked Questions</h1><p class="text-center text-charcoal/60 mb-10">Everything you need to know about shopping with DIVA</p>
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
    <div class="grid grid-cols-3 gap-4 mb-8 text-center"><div class="card p-5"><i class="fas fa-envelope text-mauve text-xl mb-2"></i><p class="text-xs">care@diva.com</p></div><div class="card p-5"><i class="fas fa-phone text-mauve text-xl mb-2"></i><p class="text-xs">+91 98765 43210</p></div><div class="card p-5"><i class="fab fa-whatsapp text-mauve text-xl mb-2"></i><p class="text-xs">Chat with us</p></div></div>
    <div class="card p-8"><input placeholder="Your Name" class="mb-3"><input placeholder="Email" class="mb-3"><textarea placeholder="Your Message" rows="4" class="mb-3"></textarea><button onclick="toast('Message sent! We will reply within 24 hours ✨')" class="btn btn-primary w-full py-3.5">Send Message</button></div>
  </div>${footer()}`
}

// ---------- Router ----------
async function render() {
  const app = $('#app'); const page = app.dataset.page
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

async function boot() {
  try { const [{ data: s }, { data: cats }] = await Promise.all([axios.get('/api/settings'), axios.get('/api/categories')]); SETTINGS = s; CATS = cats } catch { }
  render()
}
boot()
