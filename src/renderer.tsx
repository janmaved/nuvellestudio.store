const HEAD = (title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="DIVA — Premium beauty, makeup, jewelry & fashion. Curated luxury for the modern icon.">
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
<link href="/static/style.css" rel="stylesheet">
<script>
tailwind.config = {
  theme: { extend: {
    colors: {
      blush:'#F7E7E4', rose:'#E8B4B8', mauve:'#C98986', wine:'#8C5A5A',
      cream:'#FDF8F5', gold:'#C9A96A', charcoal:'#3A2E2E', softpink:'#FBEEF0'
    },
    fontFamily: { serif:['Cormorant Garamond','serif'], sans:['Poppins','sans-serif'] }
  }}
}
</script>
</head>`

export function renderer(title: string, page: string) {
  return `${HEAD(title)}
<body class="bg-cream font-sans text-charcoal antialiased">
<div id="app" data-page="${page}"></div>
<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
<script src="/static/app.js"></script>
</body></html>`
}

export function adminRenderer() {
  return `${HEAD('Admin — DIVA')}
<body class="bg-cream font-sans text-charcoal antialiased">
<div id="admin-app"></div>
<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
<script src="/static/admin.js"></script>
</body></html>`
}
