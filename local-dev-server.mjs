// LOCAL DEV ONLY — emulates Netlify (static + /api function + redirects) for sandbox preview.
// Production uses Netlify Functions + Netlify Blobs (see netlify/functions/api.mjs).
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUB = path.join(__dirname, 'public')

// Load .dev.vars into process.env for local dev (e.g. GROQ_API_KEY)
try {
  const dv = path.join(__dirname, '.dev.vars')
  if (fs.existsSync(dv)) for (const line of fs.readFileSync(dv, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch { }

// in-memory blob mock persisted to a local json file
const DBFILE = path.join(__dirname, '.local-data.json')
const mem = {}
if (fs.existsSync(DBFILE)) { try { mem.data = fs.readFileSync(DBFILE, 'utf8') } catch { } }
globalThis.__localStore = {
  async get(k, o) { const v = mem[k]; return v ? (o?.type === 'json' ? JSON.parse(v) : v) : null },
  async setJSON(k, val) { mem[k] = JSON.stringify(val); if (k === 'data') fs.writeFileSync(DBFILE, mem[k]) },
  async set(k, val) { mem[k] = val }
}

// load the function with blobs mocked
let src = fs.readFileSync(path.join(__dirname, 'netlify/functions/api.mjs'), 'utf8')
src = src.replace("import { getStore } from '@netlify/blobs'", "const getStore = () => globalThis.__localStore;")
src = src.replace("export const config = { path: '/api/*' }", "")
const tmp = path.join(__dirname, '.api-local.mjs')
fs.writeFileSync(tmp, src)
const { default: apiHandler } = await import('./.api-local.mjs?' + Date.now())

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' }

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost')
  const p = u.pathname

  // API -> function
  if (p.startsWith('/api/')) {
    let bodyChunks = []
    req.on('data', c => bodyChunks.push(c))
    req.on('end', async () => {
      const body = Buffer.concat(bodyChunks).toString()
      const fetchReq = new Request('http://localhost' + req.url, { method: req.method, headers: req.headers, body: (req.method === 'GET' || req.method === 'HEAD') ? undefined : body })
      const fnRes = await apiHandler(fetchReq)
      const txt = await fnRes.text()
      res.writeHead(fnRes.status, { 'Content-Type': 'application/json' })
      res.end(txt)
    })
    return
  }

  // static files
  let filePath
  if (p === '/admin' || p === '/admin/') filePath = path.join(PUB, 'admin.html')
  else if (p === '/' ) filePath = path.join(PUB, 'index.html')
  else filePath = path.join(PUB, p)

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' })
    return res.end(fs.readFileSync(filePath))
  }
  // SPA fallback
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(fs.readFileSync(path.join(PUB, 'index.html')))
})
server.listen(3000, '0.0.0.0', () => console.log('Local Netlify emulator on :3000'))
