const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const COOKIE_NAME = process.env.COOKIE_NAME || 'mks_admin_session';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const SESSION_TTL = '8h';

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function createToken(user) {
  return jwt.sign(
    { sub: String(user.id), username: user.username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: SESSION_TTL }
  );
}

function setAuthCookie(res, token) {
  const secure = String(process.env.COOKIE_SECURE || '').toLowerCase() === 'true' || process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/'
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

function requireAdmin(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, username FROM admin_users WHERE id = ?').get(Number(payload.sub));
    if (!user) return res.status(401).json({ error: 'Invalid session.' });
    req.admin = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const headerToken = req.get('x-csrf-token');
  const cookieToken = req.cookies.mks_csrf_token;
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: 'Invalid CSRF token.' });
  }
  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  createToken,
  setAuthCookie,
  clearAuthCookie,
  requireAdmin,
  csrfProtection
};
