const http = require('http');
const fs = require('fs');
const path = require('path');
const localtunnel = require('localtunnel');

const PORT = process.env.PORT || 3000;

// MIME Types Mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Normalize request path
  let safePath = path.normalize(req.url.split('?')[0]);
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(__dirname, safePath);

  // Security check: ensure path is within current directory
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found - Pusat Kretek Holistic');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Cache policy
    res.setHeader('Content-Type', contentType);
    if (ext === '.png' || ext === '.jpg' || ext === '.svg') {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, async () => {
  console.log('====================================================');
  console.log('🌿 PUSAT KRETEK HOLISTIC - SERVER AKTIF');
  console.log(`🏠 Akses Lokal  : http://localhost:${PORT}`);
  console.log('====================================================');

  // Launch public tunnel if requested or automatically
  const shouldTunnel = process.argv.includes('--tunnel') || true;
  if (shouldTunnel) {
    console.log('🌐 Membuka secure public tunnel untuk akses jarak jauh...');
    try {
      const tunnel = await localtunnel({ 
        port: PORT,
        subdomain: 'pusat-kretek-holistic-' + Math.floor(1000 + Math.random() * 9000)
      });

      console.log('----------------------------------------------------');
      console.log('🚀 URL PUBLIK (BISA DIBUKA KLIEN DARI MANA SAJA):');
      console.log(`🔗 ${tunnel.url}`);
      console.log('----------------------------------------------------');
      console.log('💡 Tips: Jika membuka via Localtunnel untuk pertama kali,');
      console.log('   layar prompt mungkin meminta IP publik Anda.');

      tunnel.on('close', () => {
        console.log('⚠️ Public tunnel terputus.');
      });
    } catch (err) {
      console.error('❌ Gagal mengaktifkan tunnel otomatis:', err.message);
      console.log('👉 Anda dapat menjalankan "npx localtunnel --port 3000" secara manual.');
    }
  }
});
