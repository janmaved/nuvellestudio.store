// ==================== DIVA ADMIN ====================
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
      <h1 class="font-serif text-3xl text-wine mb-1">DIVA Admin</h1>
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
  const tabs = [['dashboard', 'fa-chart-line', 'Dashboard'], ['products', 'fa-box', 'Products'], ['orders', 'fa-receipt', 'Orders'], ['categories', 'fa-tags', 'Categories'], ['settings', 'fa-gear', 'Settings']]
  return `<div class="flex min-h-screen">
    <aside class="w-60 bg-wine text-blush p-5 hidden md:block">
      <div class="font-serif text-3xl text-white mb-8 tracking-widest">DIVA</div>
      <nav class="space-y-1">${tabs.map(t => `<button onclick="setTab('${t[0]}')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${TAB === t[0] ? 'bg-white/15 text-white' : 'hover:bg-white/10'}"><i class="fas ${t[1]} w-5"></i>${t[2]}</button>`).join('')}</nav>
      <div class="mt-8 pt-6 border-t border-white/10"><a href="/" target="_blank" class="block px-4 py-2 text-sm hover:text-white"><i class="fas fa-store mr-2"></i>View Store</a><button onclick="logout()" class="w-full text-left px-4 py-2 text-sm hover:text-white"><i class="fas fa-sign-out-alt mr-2"></i>Logout</button></div>
    </aside>
    <main class="flex-1 bg-cream">
      <header class="glass sticky top-0 z-40 px-6 py-4 flex justify-between items-center md:hidden"><span class="font-serif text-2xl text-wine">DIVA Admin</span><select onchange="setTab(this.value)" class="!w-auto text-sm">${tabs.map(t => `<option value="${t[0]}" ${TAB === t[0] ? 'selected' : ''}>${t[2]}</option>`).join('')}</select></header>
      <div class="p-6 max-w-6xl">${content}</div>
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
      <td class="p-3 flex items-center gap-3"><img src="${img}" class="w-12 h-14 object-cover rounded-lg"><div><p class="font-medium">${p.name}</p><p class="text-xs text-charcoal/50">${p.brand || ''}</p></div></td>
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
      <div class="md:col-span-2"><label class="text-xs text-charcoal/60">Image URLs (one per line)</label><textarea id="f_images" rows="3" placeholder="https://...">${(p.images || []).join('\n')}</textarea></div>
      <div class="md:col-span-2 bg-softpink rounded-xl p-4">
        <label class="flex items-center gap-2 mb-2"><input type="checkbox" id="f_affiliate" class="!w-auto" ${p.is_affiliate ? 'checked' : ''} onchange="document.getElementById('affBox').classList.toggle('hidden',!this.checked)"> <span class="text-sm font-medium">This is an Affiliate Product</span></label>
        <div id="affBox" class="${p.is_affiliate ? '' : 'hidden'} space-y-2">
          <div class="flex gap-2"><input id="f_affurl" placeholder="Affiliate/Product URL" value="${p.affiliate_url || ''}"><button onclick="fetchPrice()" class="btn btn-outline px-4 whitespace-nowrap text-sm">Fetch Price</button></div>
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" id="f_autoprice" class="!w-auto" ${p.auto_price_fetch ? 'checked' : ''}> Auto-update price from link</label>
        </div>
      </div>
      <label class="flex items-center gap-2"><input type="checkbox" id="f_featured" class="!w-auto" ${p.featured ? 'checked' : ''}> <span class="text-sm">Featured</span></label>
      <label class="flex items-center gap-2"><input type="checkbox" id="f_active" class="!w-auto" ${p.active !== 0 ? 'checked' : ''}> <span class="text-sm">Active (visible)</span></label>
    </div>
    <button onclick="saveProduct(${id || 'null'})" class="btn btn-primary w-full py-3 mt-5"><i class="fas fa-save mr-2"></i>Save Product</button>
  </div></div>`
  document.body.appendChild(modal)
}
window.fetchPrice = async () => {
  const url = $('#f_affurl').value.trim(); if (!url) return toast('Enter URL first', 'err')
  toast('Fetching...'); const { data } = await api.post('/fetch-price', { url })
  if (data.price) { $('#f_price').value = data.price; toast('Price fetched: ' + money(data.price)) }
  if (data.title && !$('#f_name').value) $('#f_name').value = data.title
  if (data.image && !$('#f_images').value) $('#f_images').value = data.image
  if (!data.price) toast('Could not auto-detect price, please enter manually', 'err')
}
window.saveProduct = async (id) => {
  const payload = {
    name: $('#f_name').value.trim(), description: $('#f_desc').value, category: $('#f_cat').value, brand: $('#f_brand').value,
    price: +$('#f_price').value, compare_price: +$('#f_compare').value, stock: +$('#f_stock').value, tags: $('#f_tags').value,
    images: $('#f_images').value.split('\n').map(s => s.trim()).filter(Boolean),
    is_affiliate: $('#f_affiliate').checked ? 1 : 0, affiliate_url: $('#f_affurl').value.trim(), auto_price_fetch: $('#f_autoprice').checked ? 1 : 0,
    featured: $('#f_featured').checked ? 1 : 0, active: $('#f_active').checked ? 1 : 0
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
async function viewSettings() {
  const { data: s } = await api.get('/settings')
  const f = (k, label, hint = '') => `<div><label class="text-xs text-charcoal/60">${label}</label><input id="s_${k}" value="${(s[k] || '').replace(/"/g, '&quot;')}">${hint ? `<p class="text-xs text-charcoal/40 mt-1">${hint}</p>` : ''}</div>`
  return `<h1 class="font-serif text-4xl text-wine mb-6">Store Settings</h1>
    <div class="card p-6 max-w-2xl grid md:grid-cols-2 gap-4">
      ${f('store_name', 'Store Name')}${f('store_tagline', 'Tagline')}
      <div class="md:col-span-2">${f('hero_title', 'Homepage Hero Title')}</div>
      <div class="md:col-span-2"><label class="text-xs text-charcoal/60">Hero Subtitle</label><textarea id="s_hero_subtitle" rows="2">${s.hero_subtitle || ''}</textarea></div>
      ${f('free_shipping_threshold', 'Free Shipping Above (₹)')}${f('shipping_fee', 'Shipping Fee (₹)')}
      <div class="md:col-span-2">${f('payu_key', 'PayU Merchant Key', 'Your PayU key for payment processing')}</div>
      <div class="md:col-span-2"><button onclick="saveSettings()" class="btn btn-primary px-8 py-3"><i class="fas fa-save mr-2"></i>Save Settings</button></div>
    </div>`
}
window.saveSettings = async () => {
  const keys = ['store_name', 'store_tagline', 'hero_title', 'hero_subtitle', 'free_shipping_threshold', 'shipping_fee', 'payu_key']
  const payload = {}; keys.forEach(k => { const el = $('#s_' + k); if (el) payload[k] = el.value })
  await api.post('/settings', payload); toast('Settings saved')
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
    else if (TAB === 'orders') content = await viewOrders()
    else if (TAB === 'categories') content = await viewCategories()
    else if (TAB === 'settings') content = await viewSettings()
  } catch (e) { content = '<p class="text-red-500">Error loading. Please retry.</p>'; console.error(e) }
  $('#admin-app').innerHTML = shell(content)
}
renderAdmin()
