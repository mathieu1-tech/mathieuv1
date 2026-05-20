const crypto = require('crypto');

function splitLines(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return String(value || '').split(/\n+/).map(item => item.trim()).filter(Boolean);
}

function slugify(value) {
  return String(value || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'product';
}

function normalizeProduct(product, index) {
  const source = product && typeof product === 'object' ? product : {};
  const title = String(source.title || source.name || `Product ${index + 1}`).trim();
  const id = String(source.id || slugify(title) || `product-${index + 1}`);
  const slug = String(source.slug || slugify(id || title));
  const features = splitLines(source.features);
  const highlights = splitLines(source.highlights);
  return {
    ...source,
    id,
    slug,
    pageUrl: String(source.pageUrl || `products/${slug}.html`),
    title,
    category: String(source.category || 'Prefab'),
    description: String(source.description || ''),
    pageIntro: String(source.pageIntro || source.description || ''),
    image: String(source.image || 'assets/images/hero-prefab-unit.png'),
    alt: String(source.alt || title),
    bestUse: String(source.bestUse || ''),
    sizeOptions: splitLines(source.sizeOptions),
    highlights: highlights.length ? highlights : features.slice(0, 3),
    features,
    specifications: splitLines(source.specifications),
    priceLabel: String(source.priceLabel || 'Request Quote'),
    galleryImages: splitLines(source.galleryImages),
    status: String(source.status || 'active'),
    seo: {
      title: `${title} | Mathieu Konstruct Solutions`,
      description: String(source.description || ''),
      canonicalUrl: `products/${slug}.html`,
      ...(source.seo && typeof source.seo === 'object' ? source.seo : {})
    }
  };
}

function normalizeSiteData(data) {
  const clean = JSON.parse(JSON.stringify(data));
  clean.products = Array.isArray(clean.products) ? clean.products.map(normalizeProduct) : [];
  clean.analytics = {
    provider: 'none',
    googleMeasurementId: '',
    plausibleDomain: '',
    debug: false,
    ...(clean.analytics && typeof clean.analytics === 'object' ? clean.analytics : {})
  };
  clean.forms = {
    provider: 'mailto',
    quoteEndpoint: '',
    contactEndpoint: '',
    method: 'POST',
    honeypotName: 'company_website',
    minimumSubmitSeconds: 3,
    fallbackEmail: clean.contact?.email || 'mathieukonstructsolutions@gmail.com',
    ...(clean.forms && typeof clean.forms === 'object' ? clean.forms : {})
  };
  clean.trust = {
    processTitle: 'Simple prefab project process',
    processSteps: [],
    durabilityTitle: 'Built for practical project use',
    durabilityPoints: [],
    comparisonTitle: 'Choose the right prefab unit',
    recommendations: [],
    ...(clean.trust && typeof clean.trust === 'object' ? clean.trust : {})
  };
  return clean;
}

function sanitizeSiteData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Site data must be a JSON object.');
  }
  const clean = normalizeSiteData(data);
  if (!clean.brand || !clean.brand.companyName) throw new Error('Company name is required.');
  if (!clean.hero || !clean.hero.headline) throw new Error('Hero headline is required.');
  if (!clean.contact || !clean.contact.email) throw new Error('Contact email is required.');
  if (clean.catalog && !clean.catalog.url) throw new Error('Catalog URL is required.');
  clean.products.forEach((product, index) => {
    if (!product.title) throw new Error(`Product ${index + 1} is missing a title.`);
    if (!product.id) throw new Error(`Product ${index + 1} is missing an id.`);
    if (!product.image) throw new Error(`Product ${index + 1} is missing an image path.`);
  });
  (clean.faq || []).forEach((item, index) => {
    if (!item.question || !item.answer) throw new Error(`FAQ ${index + 1} needs both a question and an answer.`);
  });
  return clean;
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
  return `window.defaultSiteData = ${JSON.stringify(normalizeSiteData(data), null, 2)};

window.storageKeys = { data: 'mksSiteData', savedAt: 'mksSiteDataSavedAt' };
window.cloneSiteData = function cloneSiteData(data) {
  return JSON.parse(JSON.stringify(data));
};
function mergeSiteData(defaults, saved) {
  if (!saved || typeof saved !== 'object') return window.cloneSiteData(defaults);
  const base = window.cloneSiteData(defaults);
  Object.keys(saved).forEach(function(key) {
    if (Array.isArray(saved[key])) base[key] = saved[key];
    else if (saved[key] && typeof saved[key] === 'object' && base[key] && !Array.isArray(base[key])) base[key] = Object.assign({}, base[key], saved[key]);
    else base[key] = saved[key];
  });
  return base;
}
window.getSiteData = function getSiteData() {
  try {
    const raw = localStorage.getItem(window.storageKeys.data);
    if (!raw) return window.cloneSiteData(window.defaultSiteData);
    return mergeSiteData(window.defaultSiteData, JSON.parse(raw));
  } catch (err) {
    console.error('Failed to load site data', err);
    return window.cloneSiteData(window.defaultSiteData);
  }
};
window.saveSiteData = function saveSiteData(data) {
  const clean = window.cloneSiteData(data);
  localStorage.setItem(window.storageKeys.data, JSON.stringify(clean));
  localStorage.setItem(window.storageKeys.savedAt, new Date().toISOString());
};
window.getSiteSavedAt = function getSiteSavedAt() {
  return localStorage.getItem(window.storageKeys.savedAt) || '';
};
`;
}

function makeCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { sanitizeSiteData, parseDefaultSiteData, toSiteDataJs, makeCsrfToken, normalizeSiteData };
