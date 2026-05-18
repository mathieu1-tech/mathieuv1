
// Static demo login only. For real production admin security,
// use a backend authentication system and database.
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'mks2026';
const LOGIN_KEY = 'mksAdminLoggedIn';
let siteData = window.getSiteData();

function q(selector) { return document.querySelector(selector); }
function qa(selector) { return Array.from(document.querySelectorAll(selector)); }
function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
function savedAtText() {
  const savedAt = window.getSiteSavedAt();
  return savedAt ? new Date(savedAt).toLocaleString() : 'Not saved yet';
}
function loginState(isLoggedIn) {
  q('#loginView').classList.toggle('hidden', isLoggedIn);
  q('#adminApp').classList.toggle('hidden', !isLoggedIn);
}
function showSection(key) {
  qa('.sidebar-nav button').forEach(btn => btn.classList.toggle('active', btn.dataset.section === key));
  qa('.panel-section').forEach(panel => panel.classList.toggle('active', panel.id === `panel-${key}`));
  q('#adminPageTitle').textContent = key === 'vision' ? 'Vision & Mission' : key.charAt(0).toUpperCase() + key.slice(1);
}
function saveAll() {
  window.saveSiteData(siteData);
  renderAll();
  alert('Changes saved successfully. Preview the homepage to see updates.');
}
function field(label, id, value, type='text', placeholder='') {
  if (type === 'textarea') return `<label>${label}<textarea id="${id}" placeholder="${esc(placeholder)}">${esc(value)}</textarea></label>`;
  return `<label>${label}<input type="${type}" id="${id}" value="${esc(value)}" placeholder="${esc(placeholder)}"></label>`;
}
function card(title, inner) { return `<div class="editor-card"><h3>${title}</h3>${inner}</div>`; }

function bindSimpleFields(mappings) {
  mappings.forEach(([selector, path]) => {
    const node = q(selector);
    if (!node) return;
    node.addEventListener('input', () => {
      let ref = siteData;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path[path.length - 1]] = node.value;
      renderDashboardOnly();
    });
  });
}

function renderDashboardOnly() {
  const galleryItems = siteData.gallery || [];
  q('#panel-dashboard').innerHTML = `
    <div class="stats-grid">
      <article class="stat-card"><span>Total Products</span><strong>${(siteData.products || []).length}</strong></article>
      <article class="stat-card"><span>Total Services</span><strong>${(siteData.services || []).length}</strong></article>
      <article class="stat-card"><span>Total Gallery Images</span><strong>${galleryItems.length}</strong></article>
      <article class="stat-card"><span>Contact Info Status</span><strong>${siteData.contact?.email ? 'Complete' : 'Needs Review'}</strong></article>
      <article class="stat-card stat-wide"><span>Last Saved Time</span><strong>${savedAtText()}</strong></article>
    </div>
    <div class="notice-card">
      <h3>How it works</h3>
      <p>All edits are stored in your browser using localStorage. This is GitHub Pages friendly and requires no backend.</p>
      <p>Use <strong>Save Changes</strong> after editing content. Use <strong>Preview Website</strong> to open the homepage.</p>
    </div>`;
}

function renderBrandSection() {
  q('#panel-brand').innerHTML = card('Brand Settings', `
    <div class="form-grid two">
      ${field('Company Name', 'brand-companyName', siteData.brand.companyName)}
      ${field('Short Name', 'brand-shortName', siteData.brand.shortName)}
      ${field('Tagline', 'brand-tagline', siteData.brand.tagline)}
      ${field('Logo Path', 'brand-logo', siteData.brand.logo)}
    </div>`);
  bindSimpleFields([
    ['#brand-companyName', ['brand', 'companyName']],
    ['#brand-shortName', ['brand', 'shortName']],
    ['#brand-tagline', ['brand', 'tagline']],
    ['#brand-logo', ['brand', 'logo']]
  ]);
}

function renderHeroSection() {
  q('#panel-hero').innerHTML = card('Hero Section', `
    <div class="form-grid two">
      ${field('Eyebrow', 'hero-eyebrow', siteData.hero.eyebrow)}
      ${field('Headline', 'hero-headline', siteData.hero.headline)}
      ${field('Supporting Text', 'hero-supportingText', siteData.hero.supportingText, 'textarea')}
      ${field('Hero Image Path', 'hero-image', siteData.hero.heroImage)}
      ${field('Primary CTA Label', 'hero-cta1', siteData.hero.ctaPrimary)}
      ${field('Secondary CTA Label', 'hero-cta2', siteData.hero.ctaSecondary)}
    </div>`);
  bindSimpleFields([
    ['#hero-eyebrow', ['hero', 'eyebrow']], ['#hero-headline', ['hero', 'headline']], ['#hero-supportingText', ['hero', 'supportingText']],
    ['#hero-image', ['hero', 'heroImage']], ['#hero-cta1', ['hero', 'ctaPrimary']], ['#hero-cta2', ['hero', 'ctaSecondary']]
  ]);
}

function renderAboutSection() {
  q('#panel-about').innerHTML = card('About Section', `
    <div class="form-grid two">
      ${field('Eyebrow', 'about-eyebrow', siteData.about.eyebrow)}
      ${field('Heading', 'about-heading', siteData.about.heading)}
      ${field('About Text', 'about-body', siteData.about.body, 'textarea')}
      ${field('Image Path', 'about-image', siteData.about.image)}
      ${field('What We Do Title', 'about-what-title', siteData.about.whatWeDoTitle)}
      ${field('What We Do Text', 'about-what-body', siteData.about.whatWeDoBody, 'textarea')}
    </div>`);
  bindSimpleFields([
    ['#about-eyebrow', ['about', 'eyebrow']], ['#about-heading', ['about', 'heading']], ['#about-body', ['about', 'body']],
    ['#about-image', ['about', 'image']], ['#about-what-title', ['about', 'whatWeDoTitle']], ['#about-what-body', ['about', 'whatWeDoBody']]
  ]);
}

function renderVisionSection() {
  q('#panel-vision').innerHTML = card('Vision & Mission', `
    <div class="form-grid two">
      ${field('Vision Title', 'vision-title', siteData.visionMission.visionTitle)}
      ${field('Vision Text', 'vision-text', siteData.visionMission.visionText, 'textarea')}
      ${field('Mission Title', 'mission-title', siteData.visionMission.missionTitle)}
      ${field('Mission Text', 'mission-text', siteData.visionMission.missionText, 'textarea')}
    </div>`);
  bindSimpleFields([
    ['#vision-title', ['visionMission', 'visionTitle']], ['#vision-text', ['visionMission', 'visionText']],
    ['#mission-title', ['visionMission', 'missionTitle']], ['#mission-text', ['visionMission', 'missionText']]
  ]);
}

function arrayEditor(containerSelector, title, items, fields, options = {}) {
  const container = q(containerSelector);
  const fieldInputs = item => fields.map(f => f.type === 'textarea'
    ? `${field(f.label, `${options.key}-${f.key}`, item[f.key] || '', 'textarea')}`
    : `${field(f.label, `${options.key}-${f.key}`, item[f.key] || '')}`).join('');
  container.innerHTML = `
    <div class="array-editor-head">
      <h3>${title}</h3>
      <button class="btn primary small" id="add-${options.key}">Add Item</button>
    </div>
    <div class="array-editor-list">
      ${items.map((item, index) => `
        <div class="array-item" data-index="${index}">
          <div class="array-item-head">
            <strong>${esc(item[options.labelKey] || `${title} ${index + 1}`)}</strong>
            <div class="array-actions">
              <button class="btn small ghost" data-action="up" ${index === 0 ? 'disabled' : ''}>↑</button>
              <button class="btn small ghost" data-action="down" ${index === items.length - 1 ? 'disabled' : ''}>↓</button>
              <button class="btn small danger" data-action="delete">Delete</button>
            </div>
          </div>
          <div class="form-grid two">
            ${fields.map(f => {
              const val = item[f.key] || '';
              if (f.type === 'select') {
                return `<label>${f.label}<select data-field="${f.key}">${f.options.map(opt => `<option value="${esc(opt)}" ${opt === val ? 'selected' : ''}>${esc(opt)}</option>`).join('')}</select></label>`;
              }
              if (f.type === 'textarea') return `<label>${f.label}<textarea data-field="${f.key}">${esc(val)}</textarea></label>`;
              return `<label>${f.label}<input type="text" data-field="${f.key}" value="${esc(val)}"></label>`;
            }).join('')}
          </div>
        </div>`).join('')}
    </div>`;

  q(`#add-${options.key}`).addEventListener('click', () => {
    items.push(options.newItem());
    renderAll();
  });

  container.querySelectorAll('.array-item').forEach(itemNode => {
    const idx = Number(itemNode.dataset.index);
    itemNode.querySelectorAll('[data-field]').forEach(input => {
      input.addEventListener('input', () => {
        items[idx][input.dataset.field] = input.value;
        if (input.dataset.field === options.labelKey) renderAll();
      });
    });
    itemNode.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'delete') items.splice(idx, 1);
      if (action === 'up' && idx > 0) [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]];
      if (action === 'down' && idx < items.length - 1) [items[idx + 1], items[idx]] = [items[idx], items[idx + 1]];
      renderAll();
    }));
  });
}

function renderServicesSection() {
  q('#panel-services').innerHTML = '<div id="services-editor"></div>';
  arrayEditor('#services-editor', 'Services', siteData.services, [
    { key: 'name', label: 'Service Name' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'icon', label: 'Icon / Symbol' }
  ], { key: 'services', labelKey: 'name', newItem: () => ({ name: 'New Service', description: 'Service description', icon: '✦' }) });
}

function renderProductsSection() {
  q('#panel-products').innerHTML = '<div id="products-editor"></div>';
  arrayEditor('#products-editor', 'Products', siteData.products, [
    { key: 'title', label: 'Product Title' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'image', label: 'Image Path' }
  ], { key: 'products', labelKey: 'title', newItem: () => ({ title: 'New Product', description: 'Product description', image: 'assets/images/hero-prefab-unit.png' }) });
}

function renderSpecificationsSection() {
  q('#panel-specifications').innerHTML = '<div id="specifications-editor"></div>';
  arrayEditor('#specifications-editor', 'Specifications', siteData.specifications, [
    { key: 'title', label: 'Specification Title' },
    { key: 'content', label: 'Content', type: 'textarea' }
  ], { key: 'specs', labelKey: 'title', newItem: () => ({ title: 'New Specification', content: 'Details' }) });
}

function renderMaterialsSection() {
  q('#panel-materials').innerHTML = '<div id="materials-editor"></div>';
  arrayEditor('#materials-editor', 'Materials', siteData.materials, [
    { key: 'name', label: 'Material Name' },
    { key: 'image', label: 'Image Path' },
    { key: 'properties', label: 'Properties', type: 'textarea' }
  ], { key: 'materials', labelKey: 'name', newItem: () => ({ name: 'New Material', image: 'assets/images/logo.png', properties: 'Material properties' }) });
}

function renderGallerySection() {
  q('#panel-gallery').innerHTML = '<div id="gallery-editor"></div>';
  arrayEditor('#gallery-editor', 'Gallery', siteData.gallery, [
    { key: 'title', label: 'Image Title' },
    { key: 'image', label: 'Image Path' },
    { key: 'alt', label: 'Alt Text' },
    { key: 'category', label: 'Category', type: 'select', options: ['Feature Details', 'Sample Layout', 'Materials', 'Applications'] }
  ], { key: 'gallery', labelKey: 'title', newItem: () => ({ title: 'New Gallery Image', image: 'assets/images/logo.png', alt: 'Gallery image', category: 'Feature Details' }) });
}

function renderContactSection() {
  q('#panel-contact').innerHTML = card('Contact Information', `
    <div class="form-grid two">
      ${field('Eyebrow', 'contact-eyebrow', siteData.contact.eyebrow)}
      ${field('Heading', 'contact-heading', siteData.contact.heading)}
      ${field('Email', 'contact-email', siteData.contact.email)}
      ${field('Phone 1', 'contact-phone1', siteData.contact.phone1)}
      ${field('Phone 2', 'contact-phone2', siteData.contact.phone2)}
      ${field('Office Address', 'contact-office', siteData.contact.office, 'textarea')}
      ${field('Site Office / Warehouse', 'contact-warehouse', siteData.contact.warehouse, 'textarea')}
      ${field('Contact Form Recipient', 'contact-formRecipient', siteData.contact.formRecipient)}
    </div>`);
  bindSimpleFields([
    ['#contact-eyebrow', ['contact', 'eyebrow']], ['#contact-heading', ['contact', 'heading']], ['#contact-email', ['contact', 'email']],
    ['#contact-phone1', ['contact', 'phone1']], ['#contact-phone2', ['contact', 'phone2']], ['#contact-office', ['contact', 'office']],
    ['#contact-warehouse', ['contact', 'warehouse']], ['#contact-formRecipient', ['contact', 'formRecipient']]
  ]);
}

function renderSeoSection() {
  q('#panel-seo').innerHTML = card('SEO Settings', `
    <div class="form-grid two">
      ${field('Page Title', 'seo-pageTitle', siteData.seo.pageTitle)}
      ${field('Meta Description', 'seo-metaDescription', siteData.seo.metaDescription, 'textarea')}
      ${field('Meta Keywords', 'seo-metaKeywords', siteData.seo.metaKeywords, 'textarea')}
      ${field('Open Graph Title', 'seo-ogTitle', siteData.seo.ogTitle)}
      ${field('Open Graph Description', 'seo-ogDescription', siteData.seo.ogDescription, 'textarea')}
      ${field('Open Graph Image Path', 'seo-ogImage', siteData.seo.ogImage)}
    </div>`);
  bindSimpleFields([
    ['#seo-pageTitle', ['seo', 'pageTitle']], ['#seo-metaDescription', ['seo', 'metaDescription']], ['#seo-metaKeywords', ['seo', 'metaKeywords']],
    ['#seo-ogTitle', ['seo', 'ogTitle']], ['#seo-ogDescription', ['seo', 'ogDescription']], ['#seo-ogImage', ['seo', 'ogImage']]
  ]);
}


function renderThemeSection() {
  const savedTheme = localStorage.getItem('mksTheme') || 'light';
  q('#panel-theme').innerHTML = card('Website Theme Preference', `
    <p class="muted">Choose the public website theme preference. This saves to <strong>mksTheme</strong> in localStorage and is used by the homepage toggle.</p>
    <label>Theme Mode
      <select id="theme-mode">
        <option value="light" ${savedTheme === 'light' ? 'selected' : ''}>Light Theme</option>
        <option value="dark" ${savedTheme === 'dark' ? 'selected' : ''}>Dark Theme</option>
        <option value="system" ${savedTheme === 'system' ? 'selected' : ''}>System Default</option>
      </select>
    </label>
  `);
  q('#theme-mode').addEventListener('change', event => {
    localStorage.setItem('mksTheme', event.target.value);
    alert('Theme preference saved. Preview the website to see it applied.');
  });
}

function renderBackupSection() {
  q('#panel-backup').innerHTML = `
    <div class="editor-card">
      <h3>Backup & Restore</h3>
      <div class="backup-actions">
        <button class="btn primary" id="resetDefaultBtn">Reset to Default Catalog Content</button>
        <button class="btn ghost" id="exportJsonBtn">Export JSON Backup</button>
        <label class="btn ghost file-btn">Import JSON Backup<input type="file" id="importJsonInput" accept="application/json" hidden></label>
        <button class="btn danger" id="clearLocalBtn">Clear Local Changes</button>
      </div>
      <p class="muted">Export the current editable data to a JSON file or import a previous backup.</p>
    </div>`;
  q('#resetDefaultBtn').addEventListener('click', () => {
    if (!confirm('Reset all content to the default catalog data?')) return;
    siteData = window.cloneSiteData(window.defaultSiteData);
    window.saveSiteData(siteData);
    renderAll();
  });
  q('#exportJsonBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mks-site-data-backup.json';
    link.click();
    URL.revokeObjectURL(link.href);
  });
  q('#importJsonInput').addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        siteData = Object.assign(window.cloneSiteData(window.defaultSiteData), JSON.parse(reader.result));
        renderAll();
        alert('Backup imported. Click Save Changes to persist it.');
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  });
  q('#clearLocalBtn').addEventListener('click', () => {
    if (!confirm('Clear locally saved changes and reload defaults?')) return;
    localStorage.removeItem(window.storageKeys.data);
    localStorage.removeItem(window.storageKeys.savedAt);
    siteData = window.cloneSiteData(window.defaultSiteData);
    renderAll();
  });
}

function renderAll() {
  renderDashboardOnly();
  renderBrandSection();
  renderHeroSection();
  renderAboutSection();
  renderVisionSection();
  renderServicesSection();
  renderProductsSection();
  renderSpecificationsSection();
  renderMaterialsSection();
  renderGallerySection();
  renderContactSection();
  renderSeoSection();
  renderThemeSection();
  renderBackupSection();
}

document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = sessionStorage.getItem(LOGIN_KEY) === 'true';
  loginState(isLoggedIn);
  if (isLoggedIn) renderAll();

  q('#loginForm').addEventListener('submit', event => {
    event.preventDefault();
    const username = q('#loginUsername').value.trim();
    const password = q('#loginPassword').value;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem(LOGIN_KEY, 'true');
      q('#loginError').textContent = '';
      loginState(true);
      renderAll();
      showSection('dashboard');
    } else {
      q('#loginError').textContent = 'Invalid username or password.';
    }
  });

  q('#sidebarNav').addEventListener('click', event => {
    const btn = event.target.closest('button[data-section]');
    if (!btn) return;
    showSection(btn.dataset.section);
  });

  q('#previewBtn').addEventListener('click', () => window.open('index.html', '_blank'));
  q('#saveAllBtn').addEventListener('click', saveAll);
  q('#logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(LOGIN_KEY);
    loginState(false);
  });
  showSection('dashboard');
});
