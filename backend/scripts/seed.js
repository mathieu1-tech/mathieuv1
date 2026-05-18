require('dotenv').config();
const db = require('../db');
const { hashPassword } = require('../auth');
const { parseDefaultSiteData } = require('../utils');

(async () => {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('Set ADMIN_PASSWORD in .env before running seed.');
  const passwordHash = await hashPassword(password);
  db.prepare('INSERT OR REPLACE INTO admin_users (id, username, password_hash, updated_at) VALUES ((SELECT id FROM admin_users WHERE username = ?), ?, ?, datetime(\'now\'))')
    .run(username, username, passwordHash);

  const exists = db.prepare('SELECT id FROM site_data WHERE id = 1').get();
  if (!exists) {
    db.prepare('INSERT INTO site_data (id, data_json) VALUES (1, ?)').run(JSON.stringify(parseDefaultSiteData()));
  }
  console.log('Seed complete.');
})();
