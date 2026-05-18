const crypto = require('crypto');

function sanitizeSiteData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Site data must be a JSON object.');
  }
  return data;
}

function parseDefaultSiteData() {
  // default-site-data.js contains: window.defaultSiteData = {...};
  const fs = require('fs');
  const path = require('path');
  const raw = fs.readFileSync(path.join(__dirname, 'default-site-data.js'), 'utf8');
  const match = raw.match(/window\.defaultSiteData\s*=\s*([\s\S]*?);\s*\n\s*window\.storageKeys/);
  if (!match) throw new Error('Could not parse default-site-data.js');
  return JSON.parse(match[1]);
}

function toSiteDataJs(data) {
  return `window.defaultSiteData = ${JSON.stringify(data, null, 2)};\n\nwindow.storageKeys = { data: 'mksSiteData', savedAt: 'mksSiteDataSavedAt' };\nwindow.cloneSiteData = function cloneSiteData(data) {\n  return JSON.parse(JSON.stringify(data));\n};\n`;
}

function makeCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { sanitizeSiteData, parseDefaultSiteData, toSiteDataJs, makeCsrfToken };
