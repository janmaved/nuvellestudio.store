// ==================== Nuvéllé ADMIN ====================
const $ = (s, e = document) => e.querySelector(s)
const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
let PIN = sessionStorage.getItem('diva_pin') || ''
let TAB = 'dashboard', CATS = []

const api = axios.create({ baseURL: '/api/admin' })
api.interceptors.request.use(c => { c.headers['X-Admin-Pin'] = PIN; return c })

function toast(msg, type = 'ok') {
  const t = document.createElement('div')
  t.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full text-white shadow-xl ${type === 'ok' ? 'bg-mauve' : 'bg-red-500'}`
  t.innerHTML = `<i class="fas fa-${type === 'ok' ? 'check' : 'xmark'}-circle mr-2"></i>${msg}`
  document.body.appendChild(t); setTimeout(() => t.remove(), 2500)
}

function loginScreen() {
  return `<div class="min-h-screen flex items-center justify-center hero-grad px-5">
    <div class="card p-10 w-full max-w-sm text-center">
      <div class="w-16 h-16 mx-auto rounded-full bg-mauve flex items-center justify-center mb-5"><i class="fas fa-crown text-2xl text-white"></i></div>
      <h1 class="font-serif text-3xl text-wine mb-1">Nuvéllé Admin</h1>
      <p class="text-charcoal/50 text-sm mb-6">Enter your PIN to continue</p>
      <input id="pinInput" type="password" placeholder="••••" maxlength="10" class="text-center text-2xl tracking-widest mb-4" onkeydown="if(event.key==='Enter')doLogin()">
      <button onclick="doLogin()" class="btn btn-primary w-full py-3">Unlock Dashboard</button>
      <p id="loginErr" class="text-red-500 text-sm mt-3 hidden">Invalid PIN. Try again.</p>
    </div></div>`
}
window.doLogin = async () => {
  PIN = $('#pinInput').value.trim()
  try { await api.get('/verify'); sessionStorage.setItem('diva_pin', PIN); renderAdmin() }
  catch { $('#loginErr').classList.remove('hidden') }
}
window.logout = () => { sessionStorage.removeItem('diva_pin'); PIN = ''; renderAdmin() }

function shell(content) {
  const tabs = [['dashboard', 'fa-chart-line', 'Dashboard'], ['products', 'fa-box', 'Products'], ['reels', 'fa-clapperboard', 'Reels'], ['sections', 'fa-layer-group', 'Store Builder'], ['orders', 'fa-receipt', 'Orders'], ['categories', 'fa-tags', 'Categories'], ['settings', 'fa-gear', 'Settings']]
  return `<div class="flex min-h-screen">
    <aside class="w-60 bg-wine text-blush p-5 hidden md:block">
      <div class="font-serif text-3xl text-white mb-8 tracking-widest">Nuvéllé</div>
      <nav class="space-y-1">${tabs.map(t => `<button onclick="setTab('${t[0]}')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${TAB === t[0] ? 'bg-white/15 text-white' : 'hover:bg-white/10'}"><i class="fas ${t[1]} w-5"></i>${t[2]}</button>`).join('')}</nav>
      <div class="mt-8 pt-6 border-t border-white/10"><a href="/" target="_blank" class="block px-4 py-2 text-sm hover:text-white"><i class="fas fa-store mr-2"></i>View Store</a><button onclick="logout()" class="w-full text-left px-4 py-2 text-sm hover:text-white"><i class="fas fa-sign-out-alt mr-2"></i>Logout</button></div>
    </aside>
    <main class="flex-1 bg-cream">
      <header class="glass sticky top-0 z-40 px-6 py-4 flex justify-between items-center md:hidden"><span class="font-serif text-2xl text-wine">Nuvéllé Admin</span><select onchange="setTab(this.value)" class="!w-auto text-sm">${tabs.map(t => `<option value="${t[0]}" ${TAB === t[0] ? 'selected' : ''}>${t[2]}</option>`).join('')}</select></header>
      <div class="p-6 ${TAB === 'sections' ? 'max-w-none' : 'max-w-6xl'}">${content}</div>
    </main></div>`
}
window.setTab = (t) => { TAB = t; renderAdmin() }

// ---------- Dashboard ----------
async function viewDashboard() {
  const { data: s } = await api.get('/stats')
  const cards = [['Products', s.products, 'fa-box', 'bg-rose'], ['Orders', s.orders, 'fa-receipt', 'bg-mauve'], ['Revenue', money(s.revenue), 'fa-indian-rupee-sign', 'bg-gold'], ['Pending', s.pending, 'fa-clock', 'bg-wine']]
  return `<h1 class="font-serif text-4xl text-wine mb-6">Dashboard</h1>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">${cards.map(c => `<div class="card p-6"><div class="w-12 h-12 rounded-full ${c[3]} text-white flex items-center justify-center mb-3"><i class="fas ${c[2]}"></i></div><p class="text-3xl font-serif text-wine">${c[1]}</p><p class="text-sm text-charcoal/60">${c[0]}</p></div>`).join('')}</div>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="card p-6"><h3 class="font-serif text-xl text-wine mb-4">Engagement</h3><div class="space-y-3"><div class="flex justify-between"><span class="text-charcoal/60"><i class="fas fa-eye text-mauve mr-2"></i>Product Views</span><span class="font-medium">${s.views}</span></div><div class="flex justify-between"><span class="text-charcoal/60"><i class="fas fa-external-link text-mauve mr-2"></i>Affiliate Clicks</span><span class="font-medium">${s.affiliate_clicks}</span></div></div></div>
      <div class="card p-6"><h3 class="font-serif text-xl text-wine mb-4">Top Viewed Products</h3>${(s.topProducts || []).length ? s.topProducts.map(p => `<div class="flex justify-between text-sm py-1.5 border-b border-rose/10"><span>${p.name}</span><span class="text-mauve">${p.views} views</span></div>`).join('') : '<p class="text-charcoal/40 text-sm">No data yet</p>'}</div>
    </div>`
}

// ---------- Products ----------
async function viewProducts() {
  const { data: products } = await api.get('/products')
  return `<div class="flex justify-between items-center mb-6"><h1 class="font-serif text-4xl text-wine">Products</h1><div class="flex gap-2"><button onclick="refreshPrices()" class="btn btn-outline px-4 py-2.5 text-sm"><i class="fas fa-sync mr-1"></i>Refresh Affiliate Prices</button><button onclick="editProduct()" class="btn btn-primary px-5 py-2.5"><i class="fas fa-plus mr-1"></i>Add Product</button></div></div>
    <div class="card overflow-hidden"><table class="w-full text-sm"><thead class="bg-softpink text-wine"><tr><th class="text-left p-3">Product</th><th class="p-3">Category</th><th class="p-3">Price</th><th class="p-3">Stock</th><th class="p-3">Type</th><th class="p-3">Actions</th></tr></thead>
    <tbody>${products.map(p => { const img = (JSON.parse(p.images || '[]')[0] || ''); return `<tr class="border-t border-rose/10 hover:bg-softpink/40">
      <td class="p-3 flex items-center gap-3"><img src="${img}" class="w-12 h-14 object-cover rounded-lg" onerror="this.onerror=null;this.src='https://via.placeholder.com/48x56/F7E7E4/8C5A5A?text=Nuvéllé'"><div><p class="font-medium">${p.name}</p><p class="text-xs text-charcoal/50">${p.brand || ''}</p></div></td>
      <td class="p-3 text-center">${p.category}</td><td class="p-3 text-center font-medium text-wine">${money(p.price)}</td><td class="p-3 text-center">${p.stock}</td>
      <td class="p-3 text-center">${p.is_affiliate ? '<span class="badge-gold text-xs px-2 py-0.5 rounded-full">Affiliate</span>' : '<span class="bg-rose/30 text-wine text-xs px-2 py-0.5 rounded-full">Own</span>'}${p.featured ? ' <i class="fas fa-star text-gold"></i>' : ''}</td>
      <td class="p-3 text-center whitespace-nowrap"><button onclick="editProduct(${p.id})" class="text-mauve hover:text-wine mr-3"><i class="fas fa-edit"></i></button><button onclick="delProduct(${p.id})" class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button></td></tr>` }).join('')}</tbody></table></div>`
}
window.refreshPrices = async () => { toast('Refreshing prices...'); const { data } = await api.post('/refresh-prices'); toast(`${data.updated} affiliate prices updated`); renderAdmin() }
window.delProduct = async (id) => { if (!confirm('Delete this product?')) return; await api.delete('/products/' + id); toast('Product deleted'); renderAdmin() }

window.editProduct = async (id) => {
  let p = { images: [], price: 0, stock: 100, category: CATS[0]?.slug || 'makeup', currency: 'INR', active: 1 }
  if (id) { const { data } = await api.get('/products'); p = data.find(x => x.id === id); p.images = JSON.parse(p.images || '[]') }
  const modal = document.createElement('div')
  modal.id = 'pmodal'; modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto'
  modal.innerHTML = `<div class="card w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto"><div class="p-6">
    <div class="flex justify-between items-center mb-5"><h2 class="font-serif text-2xl text-wine">${id ? 'Edit' : 'Add'} Product</h2><button onclick="document.getElementById('pmodal').remove()"><i class="fas fa-times text-xl"></i></button></div>
    <div class="grid md:grid-cols-2 gap-3">
      <div class="md:col-span-2"><label class="text-xs text-charcoal/60">Name *</label><input id="f_name" value="${(p.name || '').replace(/"/g, '&quot;')}"></div>
      <div class="md:col-span-2"><label class="text-xs text-charcoal/60">Description</label><textarea id="f_desc" rows="2">${p.description || ''}</textarea></div>
      <div><label class="text-xs text-charcoal/60">Category *</label><select id="f_cat">${CATS.map(c => `<option value="${c.slug}" ${p.category === c.slug ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
      <div><label class="text-xs text-charcoal/60">Brand</label><input id="f_brand" value="${p.brand || ''}"></div>
      <div><label class="text-xs text-charcoal/60">Price (₹) *</label><input id="f_price" type="number" value="${p.price || 0}"></div>
      <div><label class="text-xs text-charcoal/60">Compare Price (₹)</label><input id="f_compare" type="number" value="${p.compare_price || 0}"></div>
      <div><label class="text-xs text-charcoal/60">Stock</label><input id="f_stock" type="number" value="${p.stock ?? 100}"></div>
      <div><label class="text-xs text-charcoal/60">Tags (comma)</label><input id="f_tags" value="${p.tags || ''}"></div>
      <div class="md:col-span-2"><label class="text-xs text-charcoal/60">Product Images</label>
        <div class="flex flex-wrap gap-2 mb-2" id="imgPreview"></div>
        <div class="flex gap-2 mb-2">
          <label class="btn btn-outline px-4 py-2 text-sm cursor-pointer flex-1 text-center"><i class="fas fa-upload mr-1"></i>Upload from Computer<input type="file" accept="image/*" multiple class="hidden" onchange="uploadImages(event)"></label>
        </div>
        <textarea id="f_images" rows="3" placeholder="Or paste image URLs (one per line)" oninput="renderImgPreview()">${(p.images || []).join('\n')}</textarea>
        <p class="text-xs text-charcoal/40 mt-1">Upload photos from your computer, or paste URLs. For affiliate products use "Fetch Price" to auto-pull images.</p>
      </div>
      <div class="md:col-span-2 bg-softpink rounded-xl p-4">
        <label class="flex items-center gap-2 mb-2"><input type="checkbox" id="f_affiliate" class="!w-auto" ${p.is_affiliate ? 'checked' : ''} onchange="document.getElementById('affBox').classList.toggle('hidden',!this.checked)"> <span class="text-sm font-medium">This is an Affiliate Product</span></label>
        <div id="affBox" class="${p.is_affiliate ? '' : 'hidden'} space-y-2">
          <div class="flex gap-2"><input id="f_affurl" placeholder="Affiliate/Product URL" value="${p.affiliate_url || ''}"><button onclick="fetchPrice()" class="btn btn-outline px-4 whitespace-nowrap text-sm">Fetch Price</button></div>
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" id="f_autoprice" class="!w-auto" ${p.auto_price_fetch ? 'checked' : ''}> Auto-update price from link</label>
        </div>
      </div>
      <div class="md:col-span-2"><label class="text-xs text-charcoal/60">Product Highlights (one per line, shown as bullet points — optional)</label><textarea id="f_highlights" rows="3" placeholder="e.g.&#10;Long-lasting 12hr wear&#10;Cruelty-free &amp; vegan&#10;Suitable for all skin types">${p.highlights || ''}</textarea></div>
      <div class="md:col-span-2 bg-softpink rounded-xl p-4">
        <div class="flex justify-between items-center mb-2"><span class="text-sm font-medium"><i class="fas fa-swatchbook text-mauve mr-1"></i>Variants / Color Swatches (optional)</span><button type="button" onclick="addVarGroup()" class="btn btn-outline px-3 py-1.5 text-xs"><i class="fas fa-plus mr-1"></i>Add Variant Type</button></div>
        <div id="varGroups" class="space-y-3"></div>
        <p class="text-xs text-charcoal/40 mt-1">e.g. "Shade" with color swatches, or "Size" with options. Add a color OR an image per option. Optional price overrides the base price.</p>
      </div>
      <div class="md:col-span-2 bg-softpink rounded-xl p-4">
        <div class="flex justify-between items-center mb-2"><span class="text-sm font-medium"><i class="fas fa-circle-question text-mauve mr-1"></i>Product FAQ (optional)</span><button type="button" onclick="addFaqRow()" class="btn btn-outline px-3 py-1.5 text-xs"><i class="fas fa-plus mr-1"></i>Add FAQ</button></div>
        <div id="faqRows" class="space-y-2"></div>
        <p class="text-xs text-charcoal/40 mt-1">Add question &amp; answer pairs. Leave empty to hide the FAQ section on the product page.</p>
      </div>
      <label class="flex items-center gap-2"><input type="checkbox" id="f_featured" class="!w-auto" ${p.featured ? 'checked' : ''}> <span class="text-sm">Featured</span></label>
      <label class="flex items-center gap-2"><input type="checkbox" id="f_active" class="!w-auto" ${p.active !== 0 ? 'checked' : ''}> <span class="text-sm">Active (visible)</span></label>
    </div>
    <button onclick="saveProduct(${id || 'null'})" class="btn btn-primary w-full py-3 mt-5"><i class="fas fa-save mr-2"></i>Save Product</button>
  </div></div>`
  document.body.appendChild(modal)
  renderImgPreview()
  const faqs = Array.isArray(p.faqs) ? p.faqs : []
  if (faqs.length) faqs.forEach(f => addFaqRow(f.q, f.a)); else addFaqRow()
  const variants = Array.isArray(p.variants) ? p.variants : []
  variants.forEach(v => addVarGroup(v.type, v.options))
}

window.addVarGroup = (type = '', options = null) => {
  const box = $('#varGroups'); if (!box) return
  const g = document.createElement('div')
  g.className = 'var-group bg-white rounded-lg p-3 border border-rose/20'
  g.innerHTML = `<div class="flex gap-2 items-center mb-2"><input class="var-type text-sm flex-1" placeholder="Variant type (e.g. Shade, Size)" value="${(type || '').replace(/"/g, '&quot;')}"><button type="button" onclick="addVarOpt(this.closest('.var-group'))" class="btn btn-outline px-2 py-1 text-xs whitespace-nowrap">+ Option</button><button type="button" onclick="this.closest('.var-group').remove()" class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button></div><div class="var-opts space-y-2"></div>`
  box.appendChild(g)
  const opts = Array.isArray(options) && options.length ? options : [{ label: '', color: '', image: '', price: '' }, { label: '', color: '', image: '', price: '' }]
  opts.forEach(o => addVarOpt(g, o))
}
window.addVarOpt = (group, o = {}) => {
  const box = group.querySelector('.var-opts')
  const row = document.createElement('div')
  row.className = 'var-opt flex gap-2 items-center'
  row.innerHTML = `<input class="vo-label text-sm flex-1" placeholder="Label" value="${(o.label || '').replace(/"/g, '&quot;')}">
    <input type="color" class="vo-color !w-10 !h-9 !p-1 cursor-pointer" value="${o.color || '#E8B4B8'}" title="Swatch color">
    <label class="text-xs text-charcoal/40"><input type="checkbox" class="vo-usecolor !w-auto mr-1" ${o.color ? 'checked' : ''}>color</label>
    <input class="vo-image text-xs flex-1" placeholder="or image URL" value="${(o.image || '').replace(/"/g, '&quot;')}">
    <input class="vo-price text-xs !w-20" type="number" placeholder="₹ price" value="${o.price != null && o.price !== '' ? o.price : ''}">
    <button type="button" onclick="this.closest('.var-opt').remove()" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button>`
  box.appendChild(row)
}
function getVariants() {
  return Array.from(document.querySelectorAll('#varGroups .var-group')).map(g => ({
    type: g.querySelector('.var-type').value.trim() || 'Variant',
    options: Array.from(g.querySelectorAll('.var-opt')).map(r => {
      const useColor = r.querySelector('.vo-usecolor').checked
      const priceVal = r.querySelector('.vo-price').value
      return { label: r.querySelector('.vo-label').value.trim(), color: useColor ? r.querySelector('.vo-color').value : '', image: r.querySelector('.vo-image').value.trim(), price: priceVal !== '' ? +priceVal : null }
    }).filter(o => o.label)
  })).filter(g => g.options.length)
}

window.addFaqRow = (q = '', a = '') => {
  const box = $('#faqRows'); if (!box) return
  const row = document.createElement('div')
  row.className = 'faq-row bg-white rounded-lg p-2 border border-rose/20'
  row.innerHTML = `<div class="flex gap-2 items-start"><div class="flex-1 space-y-1">
    <input class="faq-q text-sm" placeholder="Question" value="${(q || '').replace(/"/g, '&quot;')}">
    <textarea class="faq-a text-sm" rows="2" placeholder="Answer">${a || ''}</textarea>
    </div><button type="button" onclick="this.closest('.faq-row').remove()" class="text-red-400 hover:text-red-600 mt-1"><i class="fas fa-trash"></i></button></div>`
  box.appendChild(row)
}
function getFaqs() {
  return Array.from(document.querySelectorAll('#faqRows .faq-row')).map(r => ({
    q: r.querySelector('.faq-q').value.trim(), a: r.querySelector('.faq-a').value.trim()
  })).filter(f => f.q)
}

function getImgs() { return $('#f_images').value.split('\n').map(s => s.trim()).filter(Boolean) }
function setImgs(arr) { $('#f_images').value = arr.join('\n'); renderImgPreview() }
window.renderImgPreview = () => {
  const box = $('#imgPreview'); if (!box) return
  const imgs = getImgs()
  box.innerHTML = imgs.map((u, i) => `<div class="relative"><img src="${u}" class="w-16 h-20 object-cover rounded-lg border border-rose/30" onerror="this.src='https://via.placeholder.com/64x80?text=X'"><button onclick="removeImg(${i})" class="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs">×</button></div>`).join('')
}
window.removeImg = (i) => { const a = getImgs(); a.splice(i, 1); setImgs(a) }

// Upload images from computer -> compress to data URL and store in the images list
window.uploadImages = async (ev) => {
  const files = [...ev.target.files]; if (!files.length) return
  toast('Processing image(s)...')
  const arr = getImgs()
  for (const file of files) {
    try { arr.push(await fileToDataUrl(file)) } catch { toast('Failed one image', 'err') }
  }
  setImgs(arr); toast(files.length + ' image(s) added')
  ev.target.value = ''
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 900; let { width: w, height: h } = img
        if (w > max || h > max) { const r = Math.min(max / w, max / h); w = Math.round(w * r); h = Math.round(h * r) }
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h
        cv.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(cv.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = reject; img.src = reader.result
    }
    reader.onerror = reject; reader.readAsDataURL(file)
  })
}

window.fetchPrice = async () => {
  const url = $('#f_affurl').value.trim(); if (!url) return toast('Enter URL first', 'err')
  toast('Fetching product details...')
  const { data } = await api.post('/fetch-price', { url })
  if (data.price) { $('#f_price').value = data.price; toast('Price fetched: ' + money(data.price)) }
  if (data.title && !$('#f_name').value.trim()) $('#f_name').value = data.title
  // Fetch images and proxy them to base64 so they always display (no hotlink/broken images)
  const fetched = (data.images && data.images.length ? data.images : (data.image ? [data.image] : []))
  if (fetched.length) {
    toast('Fetching product images...')
    const arr = getImgs()
    for (const u of fetched.slice(0, 4)) {
      try { const { data: pr } = await api.post('/proxy-image', { url: u }); arr.push(pr.success && pr.dataUrl ? pr.dataUrl : u) }
      catch { arr.push(u) }
    }
    setImgs([...new Set(arr)])
    toast('Product images added ✓')
  } else if (!data.price) {
    toast('Could not auto-detect — enter details manually', 'err')
  }
}
window.saveProduct = async (id) => {
  const payload = {
    name: $('#f_name').value.trim(), description: $('#f_desc').value, category: $('#f_cat').value, brand: $('#f_brand').value,
    price: +$('#f_price').value, compare_price: +$('#f_compare').value, stock: +$('#f_stock').value, tags: $('#f_tags').value,
    images: $('#f_images').value.split('\n').map(s => s.trim()).filter(Boolean),
    is_affiliate: $('#f_affiliate').checked ? 1 : 0, affiliate_url: $('#f_affurl').value.trim(), auto_price_fetch: $('#f_autoprice').checked ? 1 : 0,
    featured: $('#f_featured').checked ? 1 : 0, active: $('#f_active').checked ? 1 : 0,
    highlights: ($('#f_highlights')?.value || '').trim(), faqs: getFaqs(), variants: getVariants()
  }
  if (!payload.name) return toast('Name required', 'err')
  if (id) await api.put('/products/' + id, payload); else await api.post('/products', payload)
  toast('Product saved'); $('#pmodal').remove(); renderAdmin()
}

// ---------- Orders ----------
async function viewOrders() {
  const { data: orders } = await api.get('/orders')
  return `<h1 class="font-serif text-4xl text-wine mb-6">Orders</h1>
    ${orders.length ? `<div class="space-y-3">${orders.map(o => { const items = JSON.parse(o.items || '[]'); return `<div class="card p-5">
      <div class="flex flex-wrap justify-between items-start gap-3"><div><p class="font-medium text-wine">${o.order_number}</p><p class="text-sm text-charcoal/60">${o.customer_name} · ${o.customer_email} · ${o.customer_phone || ''}</p><p class="text-xs text-charcoal/40 mt-1">${new Date(o.created_at).toLocaleString()}</p></div>
        <div class="text-right"><p class="font-serif text-2xl text-wine">${money(o.total)}</p><div class="flex gap-2 mt-2"><select onchange="updateOrder(${o.id},'status',this.value)" class="!w-auto text-xs !py-1"><option ${o.status === 'pending' ? 'selected' : ''}>pending</option><option ${o.status === 'processing' ? 'selected' : ''}>processing</option><option ${o.status === 'shipped' ? 'selected' : ''}>shipped</option><option ${o.status === 'delivered' ? 'selected' : ''}>delivered</option><option ${o.status === 'cancelled' ? 'selected' : ''}>cancelled</option></select>
        <select onchange="updateOrder(${o.id},'payment_status',this.value)" class="!w-auto text-xs !py-1"><option ${o.payment_status === 'pending' ? 'selected' : ''}>unpaid</option><option ${o.payment_status === 'paid' ? 'selected' : ''}>paid</option></select></div></div></div>
      <div class="mt-3 pt-3 border-t border-rose/10 text-sm text-charcoal/70">${items.map(i => `${i.name} ×${i.qty}`).join(', ')}</div>
      <div class="mt-2 text-xs text-charcoal/50">${o.shipping_address || ''}</div></div>` }).join('')}</div>` : '<div class="card p-10 text-center text-charcoal/50"><i class="fas fa-receipt text-4xl mb-3"></i><p>No orders yet</p></div>'}`
}
window.updateOrder = async (id, field, val) => { const v = field === 'payment_status' ? (val === 'paid' ? 'paid' : 'pending') : val; await api.put('/orders/' + id, { [field]: v }); toast('Order updated') }

// ---------- Categories ----------
async function viewCategories() {
  const { data: cats } = await api.get('/settings').then(() => axios.get('/api/categories'))
  return `<div class="flex justify-between items-center mb-6"><h1 class="font-serif text-4xl text-wine">Categories</h1></div>
    <div class="grid md:grid-cols-3 gap-4 mb-8">${cats.map(c => `<div class="card p-5 flex items-center justify-between"><span><i class="fas ${c.icon} text-mauve mr-2"></i>${c.name}</span><button onclick="delCat(${c.id})" class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button></div>`).join('')}</div>
    <div class="card p-6 max-w-md"><h3 class="font-serif text-xl text-wine mb-4">Add Category</h3>
      <input id="c_name" placeholder="Name" class="mb-3" oninput="document.getElementById('c_slug').value=this.value.toLowerCase().replace(/[^a-z0-9]+/g,'-')">
      <input id="c_slug" placeholder="slug" class="mb-3"><input id="c_icon" placeholder="Icon (e.g. fa-gem)" class="mb-3">
      <button onclick="addCat()" class="btn btn-primary w-full py-2.5">Add Category</button></div>`
}
window.addCat = async () => { const name = $('#c_name').value.trim(), slug = $('#c_slug').value.trim(), icon = $('#c_icon').value.trim() || 'fa-tag'; if (!name || !slug) return toast('Fill name & slug', 'err'); await api.post('/categories', { name, slug, icon }); toast('Category added'); renderAdmin() }
window.delCat = async (id) => { if (!confirm('Delete category?')) return; await api.delete('/categories/' + id); toast('Deleted'); renderAdmin() }

// ---------- Settings ----------
const SETTING_KEYS = ['store_name', 'store_tagline', 'hero_title', 'hero_subtitle', 'hero_cta', 'hero_image', 'announcement', 'free_shipping_threshold', 'shipping_fee', 'payu_key', 'theme_primary', 'theme_secondary', 'theme_dark', 'theme_accent', 'about_text', 'contact_email', 'contact_phone', 'social_instagram', 'social_facebook', 'social_pinterest', 'footer_text']
async function viewSettings() {
  const { data: s } = await api.get('/settings')
  const f = (k, label, hint = '') => `<div><label class="text-xs text-charcoal/60">${label}</label><input id="s_${k}" value="${(s[k] || '').replace(/"/g, '&quot;')}">${hint ? `<p class="text-xs text-charcoal/40 mt-1">${hint}</p>` : ''}</div>`
  const ta = (k, label) => `<div class="md:col-span-2"><label class="text-xs text-charcoal/60">${label}</label><textarea id="s_${k}" rows="2">${s[k] || ''}</textarea></div>`
  const color = (k, label) => `<div><label class="text-xs text-charcoal/60">${label}</label><div class="flex gap-2 items-center"><input type="color" id="s_${k}" value="${s[k] || '#E8B4B8'}" class="!w-14 !h-11 !p-1 cursor-pointer"><input value="${s[k] || ''}" oninput="document.getElementById('s_${k}').value=this.value" class="flex-1"></div></div>`
  return `<h1 class="font-serif text-4xl text-wine mb-6">Store Settings</h1>
    <div class="space-y-6 max-w-3xl">
      <div class="card p-6"><h3 class="font-serif text-xl text-wine mb-4"><i class="fas fa-store text-mauve mr-2"></i>Brand</h3><div class="grid md:grid-cols-2 gap-4">${f('store_name', 'Store Name')}${f('store_tagline', 'Tagline')}${ta('footer_text', 'Footer Note (optional)')}</div></div>
      <div class="card p-6"><h3 class="font-serif text-xl text-wine mb-4"><i class="fas fa-image text-mauve mr-2"></i>Homepage Hero & Banner</h3><div class="grid md:grid-cols-2 gap-4"><div class="md:col-span-2">${f('hero_title', 'Hero Title')}</div>${ta('hero_subtitle', 'Hero Subtitle')}${f('hero_cta', 'Hero Button Text')}${f('hero_image', 'Hero Image URL')}${ta('announcement', 'Top Announcement Bar Text')}</div></div>
      <div class="card p-6"><h3 class="font-serif text-xl text-wine mb-4"><i class="fas fa-palette text-mauve mr-2"></i>Theme Colors</h3><div class="grid grid-cols-2 md:grid-cols-4 gap-4">${color('theme_primary', 'Primary')}${color('theme_secondary', 'Secondary')}${color('theme_dark', 'Dark / Text')}${color('theme_accent', 'Accent / Gold')}</div><p class="text-xs text-charcoal/40 mt-2">Changes apply across the whole website instantly after saving.</p></div>
      <div class="card p-6"><h3 class="font-serif text-xl text-wine mb-4"><i class="fas fa-truck text-mauve mr-2"></i>Shipping & Payment</h3><div class="grid md:grid-cols-2 gap-4">${f('free_shipping_threshold', 'Free Shipping Above (₹)')}${f('shipping_fee', 'Shipping Fee (₹)')}<div class="md:col-span-2">${f('payu_key', 'PayU Merchant Key', 'Your PayU key for payments')}</div></div></div>
      <div class="card p-6"><h3 class="font-serif text-xl text-wine mb-4"><i class="fas fa-address-book text-mauve mr-2"></i>Contact & Social</h3><div class="grid md:grid-cols-2 gap-4">${ta('about_text', 'About Us Text')}${f('contact_email', 'Contact Email')}${f('contact_phone', 'Contact Phone')}${f('social_instagram', 'Instagram URL')}${f('social_facebook', 'Facebook URL')}${f('social_pinterest', 'Pinterest URL')}</div></div>
      <div class="sticky bottom-4"><button onclick="saveSettings()" class="btn btn-primary w-full py-4 text-lg shadow-xl"><i class="fas fa-save mr-2"></i>Save All Settings</button></div>
    </div>`
}
window.saveSettings = async () => {
  const payload = {}; SETTING_KEYS.forEach(k => { const el = $('#s_' + k); if (el) payload[k] = el.value })
  await api.post('/settings', payload); toast('Settings saved — refresh store to see changes')
}

// ---------- Store Builder (Homepage Sections) ----------
const BLOCK_META = {
  hero: ['fa-star', 'Hero Banner'], 'category-grid': ['fa-th', 'Category Grid'], products: ['fa-box', 'Product Row'],
  banner: ['fa-image', 'Promo Banner'], features: ['fa-icons', 'Feature Highlights'], newsletter: ['fa-envelope', 'Newsletter'], custom: ['fa-wand-magic-sparkles', 'AI / Custom Block'], reels: ['fa-clapperboard', 'Instagram Reels']
}

// ---------- Reels (Instagram) ----------
async function viewReels() {
  const [{ data: s }, { data: reels }, { data: products }] = await Promise.all([api.get('/settings'), api.get('/reels'), api.get('/products')])
  window._reelProducts = products
  const connected = s.instagram_connected === '1'
  return `<h1 class="font-serif text-4xl text-wine mb-1">Instagram Reels</h1>
  <p class="text-charcoal/60 text-sm mb-6">Connect your Instagram and showcase reels at the top of your homepage — each with shoppable products that redirect to their (affiliate) links.</p>
  <div class="card p-6 mb-6 ${connected ? 'bg-softpink' : ''}">
    <h3 class="font-serif text-xl text-wine mb-3"><i class="fab fa-instagram text-mauve mr-2"></i>Instagram Account</h3>
    <div class="grid md:grid-cols-2 gap-4 items-end">
      <div><label class="text-xs text-charcoal/60">Your Instagram Username</label><div class="flex items-center gap-1"><span class="text-charcoal/50">@</span><input id="ig_handle" value="${(s.instagram_handle || '').replace('@', '').replace(/"/g, '&quot;')}" placeholder="nuvelle.store"></div></div>
      <div class="flex gap-2">${connected ? `<span class="btn bg-green-500 text-white px-4 py-2.5 flex-1 text-center"><i class="fas fa-check mr-1"></i>Connected</span><button onclick="disconnectIg()" class="btn btn-outline px-4 py-2.5">Disconnect</button>` : `<button onclick="connectIg()" class="btn btn-primary px-4 py-2.5 flex-1"><i class="fab fa-instagram mr-1"></i>Connect Instagram</button>`}</div>
    </div>
    <p class="text-xs text-charcoal/40 mt-2">Add your reels below (upload video/image + link products). They appear at the very top of your homepage.</p>
  </div>
  <div class="flex justify-between items-center mb-4"><h3 class="font-serif text-xl text-wine">Your Reels (${reels.length})</h3><button onclick="editReel()" class="btn btn-primary px-4 py-2.5 text-sm"><i class="fas fa-plus mr-1"></i>Add Reel</button></div>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    ${reels.length ? reels.map(r => `<div class="card overflow-hidden">
      <div class="aspect-[9/16] bg-black relative">${r.media_type === 'video' ? `<video src="${r.media_url}" class="w-full h-full object-cover" muted></video>` : `<img src="${r.media_url}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://via.placeholder.com/200x360/F7E7E4/8C5A5A?text=Reel'">`}<div class="absolute top-2 left-2 text-white text-[10px] bg-black/40 px-2 py-0.5 rounded-full"><i class="fab fa-instagram"></i> ${(r.product_ids || []).length} product${(r.product_ids || []).length === 1 ? '' : 's'}</div></div>
      <div class="p-3"><p class="text-xs text-charcoal/60 line-clamp-2 mb-2 h-8">${r.caption || ''}</p><div class="flex gap-2"><button onclick="editReel(${r.id})" class="btn btn-outline flex-1 py-1.5 text-xs"><i class="fas fa-pen"></i></button><button onclick="delReel(${r.id})" class="btn btn-outline py-1.5 px-3 text-xs text-red-500"><i class="fas fa-trash"></i></button></div></div>
    </div>`).join('') : '<div class="col-span-full card p-10 text-center text-charcoal/40"><i class="fas fa-clapperboard text-4xl mb-3"></i><p>No reels yet. Click "Add Reel" to create your first shoppable reel!</p></div>'}
  </div>`
}
window.connectIg = async () => { const h = $('#ig_handle').value.trim().replace('@', ''); if (!h) return toast('Enter your Instagram username', 'err'); await api.post('/settings', { instagram_handle: h, instagram_connected: '1' }); toast('Instagram connected ✓'); renderAdmin() }
window.disconnectIg = async () => { await api.post('/settings', { instagram_connected: '' }); toast('Disconnected'); renderAdmin() }
window.delReel = async (id) => { if (!confirm('Delete this reel?')) return; await api.delete('/reels/' + id); toast('Reel deleted'); renderAdmin() }
window.editReel = async (id) => {
  let r = { media_type: 'image', media_url: '', caption: '', product_ids: [] }
  if (id) { const { data } = await api.get('/reels'); r = data.find(x => x.id === id) || r }
  const products = window._reelProducts || (await api.get('/products')).data
  const modal = document.createElement('div')
  modal.id = 'reelmodal'; modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto'
  modal.innerHTML = `<div class="card w-full max-w-lg my-8 p-6"><div class="flex justify-between items-center mb-4"><h2 class="font-serif text-2xl text-wine">${id ? 'Edit' : 'Add'} Reel</h2><button onclick="document.getElementById('reelmodal').remove()"><i class="fas fa-times text-xl"></i></button></div>
    <label class="text-xs text-charcoal/60">Reel Media (video or image)</label>
    <div id="reelPreview" class="mb-2 mt-1">${r.media_url ? (r.media_type === 'video' ? `<video src="${r.media_url}" class="w-32 aspect-[9/16] object-cover rounded-xl" muted controls></video>` : `<img src="${r.media_url}" class="w-32 aspect-[9/16] object-cover rounded-xl">`) : ''}</div>
    <label class="btn btn-outline px-4 py-2 text-sm cursor-pointer inline-block mb-2"><i class="fas fa-upload mr-1"></i>Upload from Computer<input type="file" accept="image/*,video/*" class="hidden" onchange="uploadReel(event)"></label>
    <input id="rl_url" value="${(r.media_url || '').replace(/"/g, '&quot;')}" placeholder="or paste video/image URL" class="mb-1 text-sm" oninput="reelPreviewUrl()">
    <input type="hidden" id="rl_type" value="${r.media_type}">
    <div class="mb-3 mt-3"><label class="text-xs text-charcoal/60">Caption</label><textarea id="rl_caption" rows="2" placeholder="Reel caption...">${r.caption || ''}</textarea></div>
    <div class="mb-3"><label class="text-xs text-charcoal/60">Linked Products (shown under the reel — click redirects to their affiliate/product link)</label>
      <div class="max-h-48 overflow-y-auto border border-rose/20 rounded-xl p-2 mt-1 space-y-1">${products.map(p => `<label class="flex items-center gap-2 text-sm p-1.5 rounded-lg hover:bg-softpink cursor-pointer"><input type="checkbox" class="rl-prod !w-auto" value="${p.id}" ${(r.product_ids || []).includes(p.id) ? 'checked' : ''}><img src="${JSON.parse(p.images || '[]')[0] || ''}" class="w-8 h-8 rounded object-cover" onerror="this.style.visibility='hidden'"><span class="flex-1 truncate">${p.name}</span><span class="text-wine text-xs">${money(p.price)}</span>${p.is_affiliate ? '<i class="fas fa-link text-mauve text-xs" title="affiliate"></i>' : ''}</label>`).join('')}</div>
    </div>
    <button onclick="saveReel(${id || 'null'})" class="btn btn-primary w-full py-3"><i class="fas fa-save mr-2"></i>Save Reel</button></div>`
  document.body.appendChild(modal)
}
window.reelPreviewUrl = () => { const u = $('#rl_url').value.trim(); const isV = /\.(mp4|webm|mov)(\?|$)/i.test(u) || u.startsWith('data:video'); $('#rl_type').value = isV ? 'video' : 'image'; $('#reelPreview').innerHTML = u ? (isV ? `<video src="${u}" class="w-32 aspect-[9/16] object-cover rounded-xl" muted controls></video>` : `<img src="${u}" class="w-32 aspect-[9/16] object-cover rounded-xl">`) : '' }
window.uploadReel = async (ev) => {
  const file = ev.target.files[0]; if (!file) return
  const isVideo = file.type.startsWith('video')
  if (isVideo && file.size > 6000000) return toast('Video too large (max 6MB)', 'err')
  toast('Uploading...')
  try {
    const url = isVideo ? await fileToRaw(file) : await fileToDataUrl(file)
    $('#rl_url').value = url; $('#rl_type').value = isVideo ? 'video' : 'image'
    $('#reelPreview').innerHTML = isVideo ? `<video src="${url}" class="w-32 aspect-[9/16] object-cover rounded-xl" muted controls></video>` : `<img src="${url}" class="w-32 aspect-[9/16] object-cover rounded-xl">`
    toast('Media added ✓')
  } catch { toast('Upload failed', 'err') }
}
function fileToRaw(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file) }) }
window.saveReel = async (id) => {
  const media_url = $('#rl_url').value.trim(); if (!media_url) return toast('Add a reel image or video', 'err')
  const payload = { media_url, media_type: $('#rl_type').value, caption: $('#rl_caption').value, product_ids: Array.from(document.querySelectorAll('.rl-prod:checked')).map(c => +c.value) }
  if (id) await api.put('/reels/' + id, payload); else await api.post('/reels', payload)
  toast('Reel saved ✓'); $('#reelmodal').remove(); renderAdmin()
}
let _previewDevice = 'desktop'
async function viewSections() {
  const { data: blocks } = await api.get('/blocks')
  const sorted = [...blocks].sort((a, b) => a.sort - b.sort)
  const origin = location.origin
  return `<div class="flex flex-wrap justify-between items-center gap-3 mb-1"><h1 class="font-serif text-4xl text-wine">Store Builder</h1>
    <div class="flex gap-2"><button onclick="openThemeQuick()" class="btn btn-outline px-4 py-2.5 text-sm"><i class="fas fa-palette mr-1"></i>Theme</button><button onclick="openAiBlock()" class="btn btn-primary px-5 py-2.5"><i class="fas fa-wand-magic-sparkles mr-1"></i>AI Block Generator</button></div></div>
  <p class="text-charcoal/60 text-sm mb-4">Edit sections on the left, see your store update <b>live</b> on the right — just like Shopify. Drag to reorder.</p>
  <div class="grid xl:grid-cols-[minmax(0,420px)_1fr] gap-6 items-start">
    <div class="space-y-4">
      <div class="card p-4">
        <h3 class="font-serif text-lg text-wine mb-3">Homepage Sections</h3>
        <div id="blockList" class="space-y-2.5">${sorted.map(b => blockRow(b)).join('')}</div>
        <div class="mt-4 pt-3 border-t border-rose/10"><p class="text-xs text-charcoal/50 mb-2">Add section:</p><div class="flex flex-wrap gap-2">
          <button onclick="addBlock('banner')" class="btn btn-outline px-3 py-1.5 text-xs"><i class="fas fa-plus mr-1"></i>Banner</button>
          <button onclick="addBlock('products')" class="btn btn-outline px-3 py-1.5 text-xs"><i class="fas fa-plus mr-1"></i>Product Row</button>
          <button onclick="addBlock('category-grid')" class="btn btn-outline px-3 py-1.5 text-xs"><i class="fas fa-plus mr-1"></i>Categories</button>
          <button onclick="addBlock('newsletter')" class="btn btn-outline px-3 py-1.5 text-xs"><i class="fas fa-plus mr-1"></i>Newsletter</button>
          <button onclick="addBlock('features')" class="btn btn-outline px-3 py-1.5 text-xs"><i class="fas fa-plus mr-1"></i>Features</button>
        </div></div>
      </div>
      <div id="blockEditor" class="card p-5"><p class="text-charcoal/40 text-center py-8"><i class="fas fa-hand-pointer text-3xl mb-3 block"></i>Click a section's <i class="fas fa-pen text-mauve"></i> to edit it here</p></div>
    </div>
    <div class="card p-3 sticky top-4">
      <div class="flex items-center justify-between mb-3 px-1">
        <span class="text-sm font-medium text-wine"><i class="fas fa-eye text-mauve mr-1"></i>Live Preview</span>
        <div class="flex gap-1">
          <button onclick="setPreviewDevice('desktop')" id="pvDesktop" class="px-3 py-1.5 rounded-lg text-sm ${_previewDevice === 'desktop' ? 'bg-mauve text-white' : 'text-charcoal/50'}"><i class="fas fa-desktop"></i></button>
          <button onclick="setPreviewDevice('mobile')" id="pvMobile" class="px-3 py-1.5 rounded-lg text-sm ${_previewDevice === 'mobile' ? 'bg-mauve text-white' : 'text-charcoal/50'}"><i class="fas fa-mobile-screen"></i></button>
          <button onclick="reloadPreview()" class="px-3 py-1.5 rounded-lg text-sm text-charcoal/50 hover:text-mauve" title="Refresh"><i class="fas fa-rotate-right"></i></button>
          <a href="/" target="_blank" class="px-3 py-1.5 rounded-lg text-sm text-charcoal/50 hover:text-mauve" title="Open in new tab"><i class="fas fa-up-right-from-square"></i></a>
        </div>
      </div>
      <div class="bg-cream rounded-xl overflow-hidden flex justify-center" style="height:72vh">
        <iframe id="storePreview" src="${origin}/?preview=1" class="border-0 bg-white transition-all duration-300 ${_previewDevice === 'mobile' ? 'w-[390px]' : 'w-full'}" style="height:100%"></iframe>
      </div>
    </div>
  </div>`
}
window.setPreviewDevice = (d) => { _previewDevice = d; const f = $('#storePreview'); if (f) { f.classList.toggle('w-[390px]', d === 'mobile'); f.classList.toggle('w-full', d === 'desktop') } $('#pvDesktop')?.classList.toggle('bg-mauve', d === 'desktop'); $('#pvDesktop')?.classList.toggle('text-white', d === 'desktop'); $('#pvMobile')?.classList.toggle('bg-mauve', d === 'mobile'); $('#pvMobile')?.classList.toggle('text-white', d === 'mobile') }
window.reloadPreview = () => { const f = $('#storePreview'); if (f) f.src = f.src.split('?')[0] + '?preview=1&t=' + Date.now() }
function blockRow(b) {
  const m = BLOCK_META[b.type] || ['fa-cube', b.type]
  const title = (b.data && b.data.title) || m[1]
  return `<div class="block-row card p-4 flex items-center gap-3 cursor-move ${b.enabled === 0 ? 'opacity-50' : ''}" draggable="true" data-id="${b.id}" data-type="${b.type}">
    <i class="fas fa-grip-vertical text-charcoal/30"></i>
    <div class="w-9 h-9 rounded-lg bg-softpink flex items-center justify-center"><i class="fas ${m[0]} text-mauve"></i></div>
    <div class="flex-1 min-w-0"><p class="font-medium text-sm truncate">${title}</p><p class="text-xs text-charcoal/50">${m[1]}</p></div>
    <button onclick="editBlock(${b.id})" class="text-mauve hover:text-wine px-2"><i class="fas fa-pen"></i></button>
    <button onclick="toggleBlock(${b.id},${b.enabled === 0 ? 1 : 0})" class="text-charcoal/40 hover:text-wine px-2" title="Show/Hide"><i class="fas fa-eye${b.enabled === 0 ? '-slash' : ''}"></i></button>
    <button onclick="delBlock(${b.id})" class="text-red-400 hover:text-red-600 px-2"><i class="fas fa-trash"></i></button>
  </div>`
}
let _blocksCache = []
async function loadBlocks() { const { data } = await api.get('/blocks'); _blocksCache = data; return data }
async function refreshSectionList() {
  await loadBlocks()
  const list = $('#blockList'); if (list) { list.innerHTML = [..._blocksCache].sort((a, b) => a.sort - b.sort).map(b => blockRow(b)).join(''); initBlockDnd() }
  reloadPreview()
}
window.addBlock = async (type) => {
  const defaults = {
    banner: { title: 'New Promo Banner', subtitle: 'Add your message here', cta: 'Shop Now', link: '/shop', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200', align: 'left' },
    products: { title: 'Featured Products', filter: 'featured', limit: 8 },
    'category-grid': { title: 'Shop by Category' },
    newsletter: { title: 'Join Our Circle', subtitle: 'Get exclusive offers & new drops.' },
    features: {}
  }
  const { data } = await api.post('/blocks', { type, data: defaults[type] || {} })
  toast('Section added'); await refreshSectionList(); editBlock(data.id)
}
window.toggleBlock = async (id, en) => { await api.put('/blocks/' + id, { enabled: en }); toast(en ? 'Section shown' : 'Section hidden'); await refreshSectionList() }
window.delBlock = async (id) => { if (!confirm('Delete this section?')) return; await api.delete('/blocks/' + id); toast('Section deleted'); await refreshSectionList(); const be = $('#blockEditor'); if (be) be.innerHTML = '<p class="text-charcoal/40 text-center py-8">Section deleted.</p>' }
window.editBlock = async (id) => {
  if (!_blocksCache.length) await loadBlocks()
  const b = _blocksCache.find(x => x.id == id); if (!b) return
  const d = b.data || {}
  const box = $('#blockEditor')
  const inp = (k, label, val = '') => `<div class="mb-3"><label class="text-xs text-charcoal/60">${label}</label><input id="bf_${k}" value="${String(val).replace(/"/g, '&quot;')}"></div>`
  const tar = (k, label, val = '') => `<div class="mb-3"><label class="text-xs text-charcoal/60">${label}</label><textarea id="bf_${k}" rows="2">${val || ''}</textarea></div>`
  let fields = ''
  if (b.type === 'hero') fields = inp('title', 'Hero Title', d.title || SETTINGS_HERO('hero_title')) + tar('subtitle', 'Subtitle', d.subtitle) + inp('cta', 'Button Text', d.cta) + inp('link', 'Button Link', d.link || '/shop') + inp('image', 'Hero Image URL', d.image)
  else if (b.type === 'banner') fields = inp('title', 'Title', d.title) + tar('subtitle', 'Subtitle', d.subtitle) + inp('cta', 'Button Text', d.cta) + inp('link', 'Button Link', d.link) + inp('image', 'Background Image URL', d.image) + `<div class="mb-3"><label class="text-xs text-charcoal/60">Text Alignment</label><select id="bf_align"><option value="left" ${d.align !== 'right' ? 'selected' : ''}>Left</option><option value="right" ${d.align === 'right' ? 'selected' : ''}>Right</option></select></div>` + `<label class="btn btn-outline px-4 py-2 text-sm cursor-pointer inline-block mb-3"><i class="fas fa-upload mr-1"></i>Upload Banner Image<input type="file" accept="image/*" class="hidden" onchange="uploadBlockImg(event)"></label>`
  else if (b.type === 'products') fields = inp('title', 'Section Title', d.title) + `<div class="mb-3"><label class="text-xs text-charcoal/60">Show</label><select id="bf_filter"><option value="featured" ${d.filter === 'featured' ? 'selected' : ''}>Featured / Bestsellers</option><option value="newest" ${d.filter === 'newest' ? 'selected' : ''}>Newest Arrivals</option><option value="category" ${d.filter === 'category' ? 'selected' : ''}>Specific Category</option></select></div>` + `<div class="mb-3"><label class="text-xs text-charcoal/60">Category (if selected above)</label><select id="bf_category"><option value="">—</option>${CATS.map(c => `<option value="${c.slug}" ${d.category === c.slug ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>` + inp('limit', 'Max Products', d.limit || 8)
  else if (b.type === 'category-grid') fields = inp('title', 'Section Title', d.title)
  else if (b.type === 'newsletter') fields = inp('title', 'Title', d.title) + tar('subtitle', 'Subtitle', d.subtitle)
  else if (b.type === 'features') fields = '<p class="text-sm text-charcoal/60">Feature highlights use your shipping & store settings automatically.</p>'
  else if (b.type === 'reels') fields = inp('title', 'Section Title', d.title) + '<p class="text-sm text-charcoal/60 mt-2">Manage your reels & linked products in the <b>Reels</b> tab.</p>'
  else if (b.type === 'custom') fields = tar('html', 'Block HTML (AI-generated — editable)', d.html) + `<div class="rounded-xl border border-rose/20 p-3 mt-2"><p class="text-xs text-charcoal/50 mb-2">Live Preview:</p><div class="scale-90 origin-top-left">${d.html || ''}</div></div>`
  box.innerHTML = `<div class="flex justify-between items-center mb-4"><h3 class="font-serif text-xl text-wine"><i class="fas ${(BLOCK_META[b.type] || ['fa-cube'])[0]} text-mauve mr-2"></i>${(BLOCK_META[b.type] || ['', b.type])[1]}</h3></div>${fields}<button onclick="saveBlock(${b.id})" class="btn btn-primary w-full py-2.5 mt-2"><i class="fas fa-save mr-2"></i>Save Section</button>`
}
function SETTINGS_HERO(k) { return '' }
window.uploadBlockImg = async (ev) => {
  const file = ev.target.files[0]; if (!file) return
  toast('Uploading...'); try { const url = await fileToDataUrl(file); $('#bf_image').value = url; toast('Image added') } catch { toast('Failed', 'err') }
}
window.saveBlock = async (id) => {
  const b = _blocksCache.find(x => x.id == id); if (!b) return
  const data = { ...b.data }
  document.querySelectorAll('[id^="bf_"]').forEach(el => { data[el.id.replace('bf_', '')] = el.value })
  if (data.limit) data.limit = +data.limit || 8
  await api.put('/blocks/' + id, { data }); toast('Section saved ✓'); await refreshSectionList(); editBlock(id)
}
window.openThemeQuick = async () => {
  const { data: s } = await api.get('/settings')
  const modal = document.createElement('div')
  modal.id = 'thememodal'; modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto'
  const col = (k, label) => `<div><label class="text-xs text-charcoal/60">${label}</label><div class="flex gap-2 items-center"><input type="color" id="tq_${k}" value="${s[k] || '#E8B4B8'}" class="!w-12 !h-10 !p-1 cursor-pointer"><input value="${s[k] || ''}" oninput="document.getElementById('tq_${k}').value=this.value" class="flex-1 text-sm"></div></div>`
  modal.innerHTML = `<div class="card w-full max-w-lg p-6 my-8"><div class="flex justify-between items-center mb-4"><h2 class="font-serif text-2xl text-wine"><i class="fas fa-palette text-mauve mr-2"></i>Theme & Hero</h2><button onclick="document.getElementById('thememodal').remove()"><i class="fas fa-times text-xl"></i></button></div>
    <div class="grid grid-cols-2 gap-3 mb-4">${col('theme_primary', 'Primary (Rose)')}${col('theme_secondary', 'Secondary (Mauve)')}${col('theme_dark', 'Dark / Wine')}${col('theme_accent', 'Accent / Gold')}</div>
    <div class="space-y-3 mb-4">
      <div><label class="text-xs text-charcoal/60">Hero Title</label><input id="tq_hero_title" value="${(s.hero_title || '').replace(/"/g, '&quot;')}"></div>
      <div><label class="text-xs text-charcoal/60">Hero Subtitle</label><textarea id="tq_hero_subtitle" rows="2">${s.hero_subtitle || ''}</textarea></div>
      <div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-charcoal/60">Hero Button</label><input id="tq_hero_cta" value="${(s.hero_cta || '').replace(/"/g, '&quot;')}"></div><div><label class="text-xs text-charcoal/60">Announcement Bar</label><input id="tq_announcement" value="${(s.announcement || '').replace(/"/g, '&quot;')}"></div></div>
      <div><label class="text-xs text-charcoal/60">Hero Image URL</label><input id="tq_hero_image" value="${(s.hero_image || '').replace(/"/g, '&quot;')}"></div>
    </div>
    <button onclick="saveThemeQuick()" class="btn btn-primary w-full py-3"><i class="fas fa-save mr-2"></i>Save & Preview</button></div>`
  document.body.appendChild(modal)
}
window.saveThemeQuick = async () => {
  const keys = ['theme_primary', 'theme_secondary', 'theme_dark', 'theme_accent', 'hero_title', 'hero_subtitle', 'hero_cta', 'announcement', 'hero_image']
  const payload = {}; keys.forEach(k => { const el = $('#tq_' + k); if (el) payload[k] = el.value })
  await api.post('/settings', payload); toast('Theme saved ✓'); $('#thememodal').remove(); reloadPreview()
}
window.openAiBlock = () => {
  const modal = document.createElement('div')
  modal.id = 'aimodal'; modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto'
  modal.innerHTML = `<div class="card w-full max-w-lg p-6"><div class="flex justify-between items-center mb-4"><h2 class="font-serif text-2xl text-wine"><i class="fas fa-wand-magic-sparkles text-mauve mr-2"></i>AI Block Generator</h2><button onclick="document.getElementById('aimodal').remove()"><i class="fas fa-times text-xl"></i></button></div>
    <p class="text-sm text-charcoal/60 mb-3">Describe the section you want. AI will design it in your store's theme colors and add it to your homepage.</p>
    <textarea id="aiPrompt" rows="4" placeholder="e.g. A festive Diwali sale banner with a gold gradient, a 'Up to 50% Off' headline, and a Shop Now button" class="mb-2"></textarea>
    <div class="flex flex-wrap gap-2 mb-3 text-xs">${['A luxury gift-with-purchase promo strip', 'A 3-step "How it works" section with icons', 'A customer testimonials showcase', 'A skincare routine guide banner'].map(s => `<button onclick="document.getElementById('aiPrompt').value='${s.replace(/'/g, "\\'")}'" class="chip px-3 py-1.5">${s}</button>`).join('')}</div>
    <div id="aiPreview" class="hidden rounded-xl border border-rose/20 p-3 mb-3 max-h-64 overflow-auto"></div>
    <div class="flex gap-2"><button onclick="genAiBlock()" id="aiGenBtn" class="btn btn-primary flex-1 py-3"><i class="fas fa-sparkles mr-1"></i>Generate</button><button id="aiAddBtn" onclick="addAiBlock()" class="btn btn-outline flex-1 py-3 hidden"><i class="fas fa-plus mr-1"></i>Add to Homepage</button></div></div>`
  document.body.appendChild(modal)
}
let _aiHtml = ''
window.genAiBlock = async () => {
  const prompt = $('#aiPrompt').value.trim(); if (!prompt) return toast('Describe the block first', 'err')
  const btn = $('#aiGenBtn'); btn.innerHTML = '<i class="fas fa-spinner spin mr-1"></i>Designing...'; btn.disabled = true
  try {
    const { data } = await api.post('/ai-block', { prompt })
    if (data.success && data.html) { _aiHtml = data.html; const pv = $('#aiPreview'); pv.classList.remove('hidden'); pv.innerHTML = data.html; $('#aiAddBtn').classList.remove('hidden'); toast('Block generated! Preview below.') }
    else toast('Generation failed, try again', 'err')
  } catch { toast('Error generating block', 'err') }
  btn.innerHTML = '<i class="fas fa-sparkles mr-1"></i>Regenerate'; btn.disabled = false
}
window.addAiBlock = async () => {
  if (!_aiHtml) return
  await api.post('/blocks', { type: 'custom', data: { title: 'AI Block', html: _aiHtml } })
  _aiHtml = ''; $('#aimodal').remove(); toast('Added to homepage!'); await refreshSectionList()
}
// Drag reorder
function initBlockDnd() {
  const list = $('#blockList'); if (!list) return
  let dragEl = null
  list.querySelectorAll('.block-row').forEach(row => {
    row.addEventListener('dragstart', () => { dragEl = row; setTimeout(() => row.classList.add('opacity-30'), 0) })
    row.addEventListener('dragend', async () => {
      row.classList.remove('opacity-30')
      const order = Array.from(list.querySelectorAll('.block-row')).map(r => +r.dataset.id)
      await api.post('/blocks/reorder', { order }); toast('Order saved'); reloadPreview()
    })
    row.addEventListener('dragover', (e) => { e.preventDefault(); const after = getDragAfter(list, e.clientY); if (after == null) list.appendChild(dragEl); else list.insertBefore(dragEl, after) })
  })
}
function getDragAfter(list, y) {
  const els = [...list.querySelectorAll('.block-row:not(.opacity-30)')]
  return els.reduce((closest, child) => { const box = child.getBoundingClientRect(); const offset = y - box.top - box.height / 2; if (offset < 0 && offset > closest.offset) return { offset, element: child }; return closest }, { offset: -Infinity }).element
}

// ---------- Render ----------
async function renderAdmin() {
  const app = $('#admin-app')
  if (!PIN) { app.innerHTML = loginScreen(); return }
  try { await api.get('/verify') } catch { PIN = ''; sessionStorage.removeItem('diva_pin'); app.innerHTML = loginScreen(); return }
  if (!CATS.length) { try { const { data } = await axios.get('/api/categories'); CATS = data } catch { } }
  app.innerHTML = shell('<div class="flex items-center justify-center py-20"><i class="fas fa-spinner spin text-3xl text-mauve"></i></div>')
  let content = ''
  try {
    if (TAB === 'dashboard') content = await viewDashboard()
    else if (TAB === 'products') content = await viewProducts()
    else if (TAB === 'reels') content = await viewReels()
    else if (TAB === 'sections') { await loadBlocks(); content = await viewSections() }
    else if (TAB === 'orders') content = await viewOrders()
    else if (TAB === 'categories') content = await viewCategories()
    else if (TAB === 'settings') content = await viewSettings()
  } catch (e) { content = '<p class="text-red-500">Error loading. Please retry.</p>'; console.error(e) }
  $('#admin-app').innerHTML = shell(content)
  if (TAB === 'sections') initBlockDnd()
}
renderAdmin()
