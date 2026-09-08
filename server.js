/**
 * SATRIA Digital - Node.js Server & REST API
 * Mengelola otorisasi admin, data terapis (CRUD), upload foto,
 * dan sinkronisasi otomatis data/therapists.json & js/therapists.js.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3700;
const DATA_FILE = path.join(__dirname, 'data', 'therapists.json');
const JS_FILE = path.join(__dirname, 'js', 'therapists.js');
const UPLOAD_DIR = path.join(__dirname, 'public', 'images');

// Admin Credentials
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'satria2026!';

// Secret key for token generation
const SECRET_KEY = process.env.SECRET_KEY || 'satria-recovery-secret-2026';
const ACTIVE_TOKENS = new Set();

// Ensure required directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// MIME Types
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

// Helper: Read Therapists Data
function readTherapists() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading therapists.json:', err);
  }
  return [];
}

// Helper: Save Therapists Data & Sync js/therapists.js

// Helper: Normalize & Fill Defaults for Therapist Data
function normalizeTherapist(item) {
  const catNames = {
    'kretek': 'Pijat Kretek / Reposisi Tulang Sendi',
    'sport-massage': 'Sport Massage & Recovery',
    'akupunktur': 'Akupunktur Medis',
    'bekam': 'Bekam Higienis',
    'bio-elektrik': 'Bio Elektrik'
  };

  item.shortCode = item.shortCode || (item.brand ? item.brand.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() : 'STR') || 'STR';
  item.regionKey = item.regionKey || (item.city ? item.city.toLowerCase().replace(/[^a-z0-9]/g, '') : 'nusantara');
  item.priceRange = item.priceRange || 'Hubungi Terapis';
  item.priceNote = item.priceNote || 'Sesuai jenis layanan & kondisi pasien';
  item.operatingHours = item.operatingHours || 'Sesuai Reservasi Janji Temu WhatsApp';
  item.landmark = item.landmark || item.address || '-';
  item.district = item.district || item.city || '-';
  item.province = item.province || '-';
  item.motto = item.motto || 'Seduluran dalam kebersamaan, profesional dalam pelayanan.';
  item.overview = item.overview || `${item.brand} melayani penanganan keluhan tulang, sendi, dan pemulihan holistik terpercaya anggota SATRIA.`;
  item.categoryTags = Array.isArray(item.categoryTags) && item.categoryTags.length > 0 ? item.categoryTags : ['kretek'];

  // Phone / WA
  if (item.phone && !item.waNumber) {
    item.waNumber = item.phone.replace(/[^0-9]/g, '');
    if (item.waNumber.startsWith('0')) {
      item.waNumber = '62' + item.waNumber.slice(1);
    }
  }

  // Primary Specialties
  if (!Array.isArray(item.primarySpecialties) || item.primarySpecialties.length === 0) {
    if (Array.isArray(item.servicesDetailed) && item.servicesDetailed.length > 0) {
      item.primarySpecialties = item.servicesDetailed
        .map(s => (s.title || '').replace(/^[^\w\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 4);
    } else {
      item.primarySpecialties = item.categoryTags.map(c => catNames[c] || c).slice(0, 4);
    }
  }

  // Complaints
  if (!Array.isArray(item.complaintsDetailed) || item.complaintsDetailed.length === 0) {
    if (Array.isArray(item.complaintsTreated) && item.complaintsTreated.length > 0) {
      item.complaintsDetailed = item.complaintsTreated;
    } else {
      item.complaintsDetailed = ['Postural Problem', 'Gangguan Persendian', 'Syaraf Terjepit', 'Kaku Otot'];
    }
  }
  item.complaintsTreated = item.complaintsDetailed;

  // Services
  if (!Array.isArray(item.servicesDetailed) || item.servicesDetailed.length === 0) {
    item.servicesDetailed = [
      { title: '🦴 Manual Terapi Reposisi Tulang Otot Sendi', desc: 'Penyesuaian biomekanika sendi dan pelepasan syaraf terjepit.' },
      { title: '🏃 Recovery Sport Injury & Pijat Holistik', desc: 'Penanganan cedera olahraga dan relaksasi ketegangan otot dalam.' }
    ];
  }

  // Action Photos
  if (!Array.isArray(item.actionPhotos) || item.actionPhotos.length === 0) {
    item.actionPhotos = [
      { url: item.avatar || 'public/images/logo-satria.png', caption: `${item.brand} - ${item.practitioner}` }
    ];
  }

  return item;
}

function saveTherapists(data) {
  try {
    data = data.map(normalizeTherapist);
    // 1. Save data/therapists.json
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

    // 2. Export and sync to js/therapists.js
    const jsContent = `/**
 * Database Terapis & Sentra Reposisi Nusantara
 * Sinkronisasi otomatis dari Admin Panel SATRIA Digital
 * Terakhir diperbarui: ${new Date().toISOString()}
 */

const THERAPISTS_DATA = ${JSON.stringify(data, null, 2)};

// Helper functions for dynamic UI
function getAllTherapists() {
  return THERAPISTS_DATA;
}

function getTherapistById(id) {
  return THERAPISTS_DATA.find(t => t.id === id) || THERAPISTS_DATA[0];
}
`;
    fs.writeFileSync(JS_FILE, jsContent, 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving therapists data:', err);
    return false;
  }
}

// Helper: Parse JSON Body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Max body size 25MB (for base64 photos)
      if (body.length > 25 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper: Generate Auth Token
function generateToken(username) {
  const payload = `${username}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${hmac}`).toString('base64');
  ACTIVE_TOKENS.add(token);
  return token;
}

// Helper: Verify Auth Token
function verifyAuth(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  
  if (ACTIVE_TOKENS.has(token)) return true;

  // Verify HMAC signature
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length < 4) return false;
    const hmacReceived = parts.pop();
    const payload = parts.join(':');
    const hmacExpected = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    if (hmacReceived === hmacExpected) {
      ACTIVE_TOKENS.add(token);
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

// Send JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // Strip prefix if reverse proxied with /pusat-kretek-holistic
  if (pathname.startsWith('/pusat-kretek-holistic')) {
    pathname = pathname.replace('/pusat-kretek-holistic', '');
  }

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // ==========================================
  // REST API ROUTES
  // ==========================================

  // 1. POST /api/auth/login
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    try {
      const body = await parseJsonBody(req);
      if (body.username === ADMIN_USER && body.password === ADMIN_PASS) {
        const token = generateToken(body.username);
        return sendJson(res, 200, {
          success: true,
          message: 'Login berhasil',
          token,
          user: { username: ADMIN_USER, name: 'Admin SATRIA' }
        });
      } else {
        return sendJson(res, 401, { success: false, message: 'Username atau password salah!' });
      }
    } catch (err) {
      return sendJson(res, 400, { success: false, message: 'Invalid request body' });
    }
  }

  // 2. GET /api/auth/verify
  if (req.method === 'GET' && pathname === '/api/auth/verify') {
    if (verifyAuth(req)) {
      return sendJson(res, 200, { valid: true, user: { username: ADMIN_USER, name: 'Admin SATRIA' } });
    } else {
      return sendJson(res, 401, { valid: false, message: 'Token tidak valid atau sudah kadaluarsa' });
    }
  }

  // 3. GET /api/therapists (Public)
  if (req.method === 'GET' && pathname === '/api/therapists') {
    const data = readTherapists();
    return sendJson(res, 200, data);
  }

  // 4. POST /api/therapists (Create new - Auth Required)
  if (req.method === 'POST' && pathname === '/api/therapists') {
    if (!verifyAuth(req)) {
      return sendJson(res, 401, { success: false, message: 'Unauthorized. Silakan login terlebih dahulu.' });
    }

    try {
      const item = await parseJsonBody(req);
      if (!item.brand || !item.practitioner || !item.city) {
        return sendJson(res, 400, { success: false, message: 'Nama brand, terapis, dan kota wajib diisi!' });
      }

      // Generate clean ID
      let baseId = (item.shortCode || item.brand)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      if (!baseId) baseId = 'terapis-' + Date.now();

      const data = readTherapists();
      let finalId = item.id || baseId;
      let counter = 1;
      while (data.some(t => t.id === finalId)) {
        finalId = `${baseId}-${counter++}`;
      }
      item.id = finalId;

      // Clean phone numbers
      if (item.phone && !item.waNumber) {
        item.waNumber = item.phone.replace(/[^0-9]/g, '');
        if (item.waNumber.startsWith('0')) {
          item.waNumber = '62' + item.waNumber.slice(1);
        }
      }

      // Add to list
      data.push(item);
      const saved = saveTherapists(data);

      if (saved) {
        return sendJson(res, 201, {
          success: true,
          message: 'Profil terapis berhasil ditambahkan!',
          therapist: item
        });
      } else {
        return sendJson(res, 500, { success: false, message: 'Gagal menyimpan data ke server.' });
      }
    } catch (err) {
      return sendJson(res, 400, { success: false, message: err.message });
    }
  }

  // 5. PUT /api/therapists/:id (Update existing - Auth Required)
  if (req.method === 'PUT' && pathname.startsWith('/api/therapists/')) {
    if (!verifyAuth(req)) {
      return sendJson(res, 401, { success: false, message: 'Unauthorized. Silakan login terlebih dahulu.' });
    }

    const id = pathname.replace('/api/therapists/', '').trim();
    try {
      const updateData = await parseJsonBody(req);
      const data = readTherapists();
      const index = data.findIndex(t => t.id === id);

      if (index === -1) {
        return sendJson(res, 404, { success: false, message: 'Terapis dengan ID tersebut tidak ditemukan!' });
      }

      // Ensure ID is preserved
      updateData.id = id;

      // Clean phone numbers
      if (updateData.phone && !updateData.waNumber) {
        updateData.waNumber = updateData.phone.replace(/[^0-9]/g, '');
        if (updateData.waNumber.startsWith('0')) {
          updateData.waNumber = '62' + updateData.waNumber.slice(1);
        }
      }

      data[index] = { ...data[index], ...updateData };
      const saved = saveTherapists(data);

      if (saved) {
        return sendJson(res, 200, {
          success: true,
          message: 'Profil terapis berhasil diperbarui!',
          therapist: data[index]
        });
      } else {
        return sendJson(res, 500, { success: false, message: 'Gagal menyimpan perubahan ke server.' });
      }
    } catch (err) {
      return sendJson(res, 400, { success: false, message: err.message });
    }
  }

  // 6. DELETE /api/therapists/:id (Delete - Auth Required)
  if (req.method === 'DELETE' && pathname.startsWith('/api/therapists/')) {
    if (!verifyAuth(req)) {
      return sendJson(res, 401, { success: false, message: 'Unauthorized. Silakan login terlebih dahulu.' });
    }

    const id = pathname.replace('/api/therapists/', '').trim();
    const data = readTherapists();
    const filtered = data.filter(t => t.id !== id);

    if (filtered.length === data.length) {
      return sendJson(res, 404, { success: false, message: 'Terapis tidak ditemukan!' });
    }

    const saved = saveTherapists(filtered);
    if (saved) {
      return sendJson(res, 200, { success: true, message: 'Profil terapis berhasil dihapus.', id });
    } else {
      return sendJson(res, 500, { success: false, message: 'Gagal menghapus data dari server.' });
    }
  }

  // 7. POST /api/upload (Upload Photo - Auth Required)
  if (req.method === 'POST' && pathname === '/api/upload') {
    if (!verifyAuth(req)) {
      return sendJson(res, 401, { success: false, message: 'Unauthorized.' });
    }

    try {
      const body = await parseJsonBody(req);
      const { filename, base64Data } = body;

      if (!base64Data) {
        return sendJson(res, 400, { success: false, message: 'File data base64 tidak boleh kosong!' });
      }

      // Clean base64 header
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let rawBase64 = base64Data;
      let ext = '.png';

      if (matches && matches.length === 3) {
        const mime = matches[1];
        rawBase64 = matches[2];
        if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('svg')) ext = '.svg';
      }

      // Clean filename
      const cleanName = (filename || 'foto-' + Date.now())
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 40);

      const targetFileName = `${cleanName}-${Date.now()}${ext}`;
      const targetFilePath = path.join(UPLOAD_DIR, targetFileName);

      const buffer = Buffer.from(rawBase64, 'base64');
      fs.writeFileSync(targetFilePath, buffer);

      const relativeUrl = `public/images/${targetFileName}`;
      return sendJson(res, 200, {
        success: true,
        message: 'Foto berhasil diunggah!',
        url: relativeUrl,
        filename: targetFileName
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, message: 'Gagal mengunggah foto: ' + err.message });
    }
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  let safePath = path.normalize(pathname);
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  } else if (safePath === '/admin' || safePath === '/admin/') {
    safePath = '/admin.html';
  }

  const filePath = path.join(__dirname, safePath);

  // Security check: restrict to project root
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found - SATRIA Digital');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('========================================================');
  console.log('🛡️  SATRIA DIGITAL - SERVER & REST API AKTIF');
  console.log(`🚀 Port Server : ${PORT}`);
  console.log(`🌐 Local URL   : http://localhost:${PORT}`);
  console.log(`🔑 Admin URL   : http://localhost:${PORT}/admin`);
  console.log('========================================================');
});
