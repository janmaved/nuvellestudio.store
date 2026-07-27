// Sandbox preview: local emulator of Netlify (static + /api function + SPA redirects).
// Production deploy target is Netlify (netlify.toml). This is dev-only.
module.exports = {
  apps: [{
    name: 'nuvelle',
    script: 'node',
    args: 'local-dev-server.mjs',
    env: { NODE_ENV: 'development', PORT: 3000 },
    watch: false, instances: 1, exec_mode: 'fork'
  }]
}
