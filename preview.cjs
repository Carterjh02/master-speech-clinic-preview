/* Local-only preview server. No packages, no installation, no external requests.
   Run: node preview.cjs   (optional port: node preview.cjs 8001)
   Do not upload this file to the production web root. */

   // test to push
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = __dirname;
const port = Number(process.argv[2] || 8000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error('Choose a port between 1024 and 65535.');
  process.exit(1);
}
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.webp': 'image/webp',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2'
};
const server = http.createServer((req, res) => {
  const fail = (status, message) => { res.writeHead(status, {'Content-Type':'text/plain; charset=utf-8'}); res.end(message); };
  if (req.method !== 'GET' && req.method !== 'HEAD') return fail(405, 'Preview server: read only.');
  let url, decoded, file;
  try {
    url = new URL(req.url, `http://127.0.0.1:${port}`);
    decoded = decodeURIComponent(url.pathname);
    if (decoded.includes('\\') || decoded.includes('\0') || decoded.split('/').some(s => s.startsWith('.'))) return fail(404, 'Not found.');
    file = path.resolve(ROOT, '.' + decoded);

    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
      return fail(404, 'Not found.');
    }file = path.resolve(ROOT, '.' + decoded);

    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
      return fail(404, 'Not found.');
    } 
    if (fs.statSync(file).isDirectory()) {
      if (!decoded.endsWith('/')) { res.writeHead(301, { Location: url.pathname + '/' + url.search }); return res.end(); }
      file = path.join(file, 'index.html');
    }
    const type = types[path.extname(file).toLowerCase()];
    if (!type || !fs.statSync(file).isFile()) return fail(404, 'Not found.');
    const data = fs.readFileSync(file);
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': data.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options':'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) { return fail(error.code === 'ENOENT' ? 404 : 400, 'Page or resource not found.'); }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Try: node preview.cjs 8001` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Master Speech Clinic preview\nOpen http://127.0.0.1:${port}/\nPress Ctrl+C to stop.`));
