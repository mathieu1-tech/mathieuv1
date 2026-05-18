require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const db = require('./db');
const {
  hashPassword,
  verifyPassword,
  createToken,
  setAuthCookie,
  clearAuthCookie,
  requireAdmin,
  csrfProtection
} = require('./auth');
const { sanitizeSiteData, parseDefaultSiteData, toSiteDataJs, makeCsrfToken } = require('./utils');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8080';

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === FRONTEND_ORIGIN || origin.startsWith('http://localhost')) return callback(null, true);
    return callback(new Error('CORS blocked'));
  },
  credentials: true
}));

app.use(express.static(path.join(__dirname, 'public')));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' }
});

function audit(adminId, action, metadata, req) {
  db.prepare('INSERT INTO audit_log (admin_user_id, action, metadata_json, ip_address) VALUES (?, ?, ?, ?)')
    .run(adminId || null, action, metadata ? JSON.stringify(metadata) : null, req.ip);
}

async function ensureSeeded() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM admin_users').get().count;
  if (count === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD;
    if (!password || password === 'change-this-password-before-deploying') {
      console.warn('WARNING: Set ADMIN_PASSWORD in .env before deploying. Using temporary local password: admin12345');
    }
    const passwordHash = await hashPassword(password && password !== 'change-this-password-before-deploying' ? password : 'admin12345');
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
    console.log(`Seeded admin user: ${username}`);
  }

  const siteRow = db.prepare('SELECT id FROM site_data WHERE id = 1').get();
  if (!siteRow) {
    const defaultData = parseDefaultSiteData();
    db.prepare('INSERT INTO site_data (id, data_json) VALUES (1, ?)').run(JSON.stringify(defaultData));
    console.log('Seeded default site data.');
  }
}

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'mathieu-admin-api' }));

app.get('/api/auth/csrf', (req, res) => {
  const token = makeCsrfToken();
  const secure = process.env.NODE_ENV === 'production';
  res.cookie('mks_csrf_token', token, {
    httpOnly: false,
    secure,
    sameSite: secure ? 'none' : 'lax',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/'
  });
  res.json({ csrfToken: token });
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const LoginSchema = z.object({ username: z.string().min(1).max(80), password: z.string().min(1).max(200) });
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid login request.' });

  const { username, password } = parsed.data;
  const user = db.prepare('SELECT id, username, password_hash FROM admin_users WHERE username = ?').get(username);
  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  if (!ok) return res.status(401).json({ error: 'Invalid username or password.' });

  const token = createToken(user);
  setAuthCookie(res, token);
  audit(user.id, 'login', null, req);
  res.json({ ok: true, user: { id: user.id, username: user.username } });
});

app.post('/api/auth/logout', requireAdmin, csrfProtection, (req, res) => {
  audit(req.admin.id, 'logout', null, req);
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get('/api/auth/session', requireAdmin, (req, res) => {
  res.json({ ok: true, user: req.admin });
});

app.post('/api/auth/change-password', requireAdmin, csrfProtection, async (req, res) => {
  const Schema = z.object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(8).max(200).regex(/[A-Za-z]/).regex(/[0-9]/)
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'New password must be at least 8 characters and include a letter and a number.' });

  const row = db.prepare('SELECT password_hash FROM admin_users WHERE id = ?').get(req.admin.id);
  const valid = await verifyPassword(parsed.data.currentPassword, row.password_hash);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

  const newHash = await hashPassword(parsed.data.newPassword);
  db.prepare("UPDATE admin_users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(newHash, req.admin.id);
  audit(req.admin.id, 'change_password', null, req);
  clearAuthCookie(res);
  res.json({ ok: true, message: 'Password changed. Please log in again.' });
});

app.get('/api/public/site-data', (req, res) => {
  const row = db.prepare('SELECT data_json, updated_at FROM site_data WHERE id = 1').get();
  res.json({ data: JSON.parse(row.data_json), updatedAt: row.updated_at });
});

app.get('/api/site-data', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT data_json, updated_at FROM site_data WHERE id = 1').get();
  res.json({ data: JSON.parse(row.data_json), updatedAt: row.updated_at });
});

app.put('/api/site-data', requireAdmin, csrfProtection, (req, res) => {
  try {
    const data = sanitizeSiteData(req.body.data);
    db.prepare("UPDATE site_data SET data_json = ?, updated_at = datetime('now'), updated_by = ? WHERE id = 1")
      .run(JSON.stringify(data), req.admin.id);
    audit(req.admin.id, 'update_site_data', { keys: Object.keys(data) }, req);
    res.json({ ok: true, data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/site-data.js', (req, res) => {
  const row = db.prepare('SELECT data_json FROM site_data WHERE id = 1').get();
  res.type('application/javascript').send(toSiteDataJs(JSON.parse(row.data_json)));
});

function getSiteDataObject() {
  const row = db.prepare('SELECT data_json FROM site_data WHERE id = 1').get();
  return JSON.parse(row.data_json);
}
function saveSiteDataObject(data, adminId) {
  db.prepare("UPDATE site_data SET data_json = ?, updated_at = datetime('now'), updated_by = ? WHERE id = 1")
    .run(JSON.stringify(data), adminId);
}

app.get('/api/products', requireAdmin, (req, res) => {
  const data = getSiteDataObject();
  res.json({ products: data.products || [] });
});
app.post('/api/products', requireAdmin, csrfProtection, (req, res) => {
  const data = getSiteDataObject();
  data.products = Array.isArray(data.products) ? data.products : [];
  const product = { id: `product-${Date.now()}`, ...req.body };
  data.products.push(product);
  saveSiteDataObject(data, req.admin.id);
  audit(req.admin.id, 'create_product', { id: product.id, name: product.name }, req);
  res.status(201).json({ ok: true, product });
});
app.put('/api/products/:id', requireAdmin, csrfProtection, (req, res) => {
  const data = getSiteDataObject();
  const products = Array.isArray(data.products) ? data.products : [];
  const index = products.findIndex(p => String(p.id || p.name) === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found.' });
  products[index] = { ...products[index], ...req.body };
  data.products = products;
  saveSiteDataObject(data, req.admin.id);
  audit(req.admin.id, 'update_product', { id: req.params.id }, req);
  res.json({ ok: true, product: products[index] });
});
app.delete('/api/products/:id', requireAdmin, csrfProtection, (req, res) => {
  const data = getSiteDataObject();
  const before = Array.isArray(data.products) ? data.products : [];
  data.products = before.filter(p => String(p.id || p.name) !== req.params.id);
  if (data.products.length === before.length) return res.status(404).json({ error: 'Product not found.' });
  saveSiteDataObject(data, req.admin.id);
  audit(req.admin.id, 'delete_product', { id: req.params.id }, req);
  res.json({ ok: true });
});

app.get('/api/gallery', requireAdmin, (req, res) => {
  const data = getSiteDataObject();
  res.json({ gallery: data.gallery || data.projectGallery || [] });
});
app.post('/api/gallery', requireAdmin, csrfProtection, (req, res) => {
  const data = getSiteDataObject();
  data.gallery = Array.isArray(data.gallery) ? data.gallery : [];
  const image = { id: `gallery-${Date.now()}`, ...req.body };
  data.gallery.push(image);
  saveSiteDataObject(data, req.admin.id);
  audit(req.admin.id, 'create_gallery_image', { id: image.id }, req);
  res.status(201).json({ ok: true, image });
});
app.delete('/api/gallery/:id', requireAdmin, csrfProtection, (req, res) => {
  const data = getSiteDataObject();
  const before = Array.isArray(data.gallery) ? data.gallery : [];
  data.gallery = before.filter(item => String(item.id || item.image || item.src) !== req.params.id);
  saveSiteDataObject(data, req.admin.id);
  audit(req.admin.id, 'delete_gallery_image', { id: req.params.id }, req);
  res.json({ ok: true });
});

app.get('/api/audit-log', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT action, metadata_json, ip_address, created_at FROM audit_log ORDER BY id DESC LIMIT 50').all();
  res.json({ rows });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error.' });
});

ensureSeeded().then(() => {
  app.listen(PORT, () => console.log(`Mathieu admin API running on http://localhost:${PORT}`));
}).catch(error => {
  console.error(error);
  process.exit(1);
});
