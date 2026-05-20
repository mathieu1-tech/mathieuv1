const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const text = (value) => (value == null ? '' : String(value));
const catalogFallback = 'assets/catalog/PREFAB-CATALOG-MKS-CO-LTD-2026_compressed.pdf';
let analyticsSettings = { provider: 'none', debug: false };
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function initPageLoader() {
  const loader = $('#siteLoader');
  if (!loader) return;
  let done = false;
  const hide = () => {
    if (done) return;
    done = true;
    document.body.classList.add('is-loaded');
    window.setTimeout(() => loader.remove(), 650);
  };
  if (document.readyState === 'complete') {
    window.setTimeout(hide, 220);
  } else {
    window.addEventListener('load', () => window.setTimeout(hide, 220), { once: true });
  }
  window.setTimeout(hide, 2800);
}

function setText(selector, value) {
  const node = $(selector);
  if (node) node.textContent = text(value);
}

function setImage(selector, src, alt) {
  const img = $(selector);
  if (!img || !src) return;
  img.src = src;
  img.alt = alt || img.alt || 'Mathieu Konstruct Solutions prefab visual';
}

function appendText(parent, tag, value, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text(value);
  parent.appendChild(node);
  return node;
}

function picture(src, alt, eager = false) {
  const stem = String(src || '').split('/').pop().replace(/\.[^.]+$/, '');
  const wrapper = document.createElement('picture');
  if (stem) {
    const avif = document.createElement('source');
    avif.type = 'image/avif';
    avif.srcset = `assets/images/optimized/${stem}-1200.avif`;
    wrapper.appendChild(avif);
    const webp = document.createElement('source');
    webp.type = 'image/webp';
    webp.srcset = `assets/images/optimized/${stem}-1200.webp`;
    wrapper.appendChild(webp);
  }
  const img = document.createElement('img');
  img.src = src || 'assets/images/logo.png';
  img.alt = alt || 'Mathieu Konstruct Solutions prefab visual';
  img.width = 1200;
  img.height = 900;
  img.decoding = 'async';
  if (!eager) img.loading = 'lazy';
  if (eager) img.fetchPriority = 'high';
  wrapper.appendChild(img);
  return wrapper;
}

function normalizePhone(phone) {
  let cleaned = text(phone).replace(/[^+\d]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  if (cleaned.startsWith('0')) cleaned = `63${cleaned.slice(1)}`;
  return cleaned;
}

function slugify(value) {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';
}

function productPageHref(product) {
  return product?.pageUrl || `products/${product?.slug || product?.id || slugify(product?.title)}.html`;
}

function findProduct(products, id) {
  const key = text(id);
  return (products || []).find((item) => [item.id, item.slug, item.title].map(text).includes(key));
}

function trackEvent(name, params = {}) {
  const payload = Object.assign({ event_category: 'MKS Website' }, params);
  if (analyticsSettings.provider === 'google' && typeof window.gtag === 'function') {
    window.gtag('event', name, payload);
  } else if (analyticsSettings.provider === 'plausible' && typeof window.plausible === 'function') {
    window.plausible(name, { props: params });
  } else if (analyticsSettings.debug || location.hostname === 'localhost' || location.protocol === 'file:') {
    console.debug('[mks-event]', name, params);
  }
}

function initAnalytics(siteData) {
  analyticsSettings = Object.assign({ provider: 'none', googleMeasurementId: '', plausibleDomain: '', debug: false }, siteData.analytics || {});
  const provider = analyticsSettings.provider;
  if (provider === 'google' && analyticsSettings.googleMeasurementId && !$('#mksGoogleAnalytics')) {
    const script = document.createElement('script');
    script.id = 'mksGoogleAnalytics';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsSettings.googleMeasurementId)}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', analyticsSettings.googleMeasurementId);
  }
  if (provider === 'plausible' && analyticsSettings.plausibleDomain && !$('#mksPlausibleAnalytics')) {
    const script = document.createElement('script');
    script.id = 'mksPlausibleAnalytics';
    script.defer = true;
    script.dataset.domain = analyticsSettings.plausibleDomain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }
}

function telHref(phone) {
  const cleaned = text(phone).replace(/[^+\d]/g, '');
  return cleaned ? `tel:${cleaned}` : '#';
}

function renderList(parent, items, itemClass) {
  parent.replaceChildren();
  (items || []).forEach((item) => appendText(parent, 'span', item, itemClass));
}

function renderCards(siteData) {
  const servicesGrid = $('#servicesGrid');
  if (servicesGrid) {
    servicesGrid.replaceChildren();
    (siteData.services || []).forEach((service) => {
      const card = document.createElement('article');
      card.className = 'service-card reveal';
      const icon = appendText(card, 'span', service.icon || 'MKS');
      icon.setAttribute('aria-hidden', 'true');
      appendText(card, 'h3', service.name);
      appendText(card, 'p', service.description);
      servicesGrid.appendChild(card);
    });
  }

  const productsGrid = $('#productsGrid');
  if (productsGrid) {
    productsGrid.replaceChildren();
    (siteData.products || []).forEach((product) => {
      const card = document.createElement('article');
      card.className = 'product-card reveal';
      card.dataset.productId = product.id;
      card.dataset.category = product.category || 'Prefab';
      card.dataset.search = [product.title, product.description, product.category, ...(product.highlights || [])].join(' ').toLowerCase();
      appendText(card, 'span', product.category || 'Prefab', 'product-badge');
      const imageWrap = document.createElement('div');
      imageWrap.className = 'product-image-wrap';
      imageWrap.appendChild(picture(product.image, product.alt || product.title));
      card.appendChild(imageWrap);
      const body = document.createElement('div');
      body.className = 'product-card-body';
      appendText(body, 'h3', product.title);
      appendText(body, 'p', product.description);
      appendText(body, 'p', product.bestUse, 'product-best-use');
      const highlights = document.createElement('ul');
      highlights.className = 'product-highlights';
      (product.highlights || []).forEach((item) => appendText(highlights, 'li', item));
      body.appendChild(highlights);
      const actions = document.createElement('div');
      actions.className = 'product-actions';
      const detailsLink = appendText(actions, 'a', 'View Details', 'btn btn-primary product-detail-link');
      detailsLink.href = productPageHref(product);
      detailsLink.dataset.productId = product.id;
      detailsLink.setAttribute('aria-label', `View details for ${product.title}`);
      const details = appendText(actions, 'button', 'Quick View', 'btn btn-outline product-view-btn');
      details.type = 'button';
      details.dataset.productId = product.id;
      const quote = appendText(actions, 'button', 'Request Quote', 'btn btn-outline product-quote-btn');
      quote.type = 'button';
      quote.dataset.productId = product.id;
      body.appendChild(actions);
      card.appendChild(body);
      productsGrid.appendChild(card);
    });
  }

  const comparison = $('#useCaseComparison');
  if (comparison) {
    comparison.replaceChildren();
    (siteData.trust?.recommendations || []).forEach((item) => {
      const row = document.createElement('article');
      row.className = 'comparison-row reveal';
      appendText(row, 'strong', item.need);
      appendText(row, 'span', item.product);
      appendText(row, 'p', item.reason);
      comparison.appendChild(row);
    });
  }

  const process = $('#processSteps');
  if (process) {
    process.replaceChildren();
    (siteData.trust?.processSteps || []).forEach((item, index) => {
      const step = document.createElement('article');
      step.className = 'process-step reveal';
      appendText(step, 'span', String(index + 1).padStart(2, '0'));
      appendText(step, 'p', item);
      process.appendChild(step);
    });
  }

  const specGrid = $('#specGrid');
  if (specGrid) {
    specGrid.replaceChildren();
    (siteData.specifications || []).forEach((spec) => {
      const item = document.createElement('div');
      appendText(item, 'h3', spec.title);
      appendText(item, 'p', spec.content);
      specGrid.appendChild(item);
    });
  }

  const materialsGrid = $('#materialsGrid');
  if (materialsGrid) {
    materialsGrid.replaceChildren();
    (siteData.materials || []).forEach((material) => {
      const card = document.createElement('article');
      card.className = 'material-card reveal';
      const wrap = document.createElement('div');
      wrap.className = 'material-image-wrap';
      wrap.appendChild(picture(material.image, material.name));
      card.appendChild(wrap);
      appendText(card, 'h3', material.name);
      appendText(card, 'p', material.properties);
      materialsGrid.appendChild(card);
    });
  }

  const gallery = siteData.gallery || [];
  renderGallery('#featureGalleryGrid', gallery.filter((item) => item.category === 'Feature Details'), 'feature-gallery-card');
  renderGallery('#sampleLayoutGrid', gallery.filter((item) => item.category === 'Sample Layout'), 'sample-layout-card');
  const appsGrid = $('#applicationsGrid');
  if (appsGrid) {
    appsGrid.replaceChildren();
    gallery.filter((item) => item.category === 'Applications').forEach((item) => {
      const card = document.createElement('article');
      card.className = 'app-card reveal';
      card.appendChild(picture(item.image, item.alt || item.title));
      appendText(card, 'h3', item.title);
      appsGrid.appendChild(card);
    });
  }
}

function renderGallery(selector, items, extraClass) {
  const grid = $(selector);
  if (!grid) return;
  grid.replaceChildren();
  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `gallery-item ${extraClass} ${selector === '#sampleLayoutGrid' && index < 2 ? 'large' : 'small'} reveal`;
    button.dataset.full = item.image;
    const wrap = document.createElement('div');
    wrap.className = selector === '#sampleLayoutGrid' ? 'sample-layout-image-wrap' : 'feature-gallery-image-wrap';
    wrap.appendChild(picture(item.image, item.alt || item.title));
    button.appendChild(wrap);
    if (selector !== '#sampleLayoutGrid') appendText(button, 'div', item.title, 'feature-gallery-caption');
    grid.appendChild(button);
  });
}

function renderSiteContent(siteData) {
  const { brand, hero, about, visionMission, servicesIntro, prefab, productsIntro, specificationsIntro, materialsIntro, galleryIntro, customize, advantages, contact, seo } = siteData;
  initAnalytics(siteData);
  if (seo?.pageTitle) document.title = seo.pageTitle;
  [['meta[name="description"]', seo?.metaDescription], ['meta[name="keywords"]', seo?.metaKeywords], ['meta[property="og:title"]', seo?.ogTitle], ['meta[property="og:description"]', seo?.ogDescription], ['meta[property="og:image"]', seo?.ogImage], ['meta[name="twitter:image"]', seo?.ogImage]].forEach(([selector, value]) => {
    const node = $(selector);
    if (node && value) node.setAttribute('content', value);
  });

  setImage('#brandLogo', brand.logo, `${brand.companyName} logo`);
  setText('#brandText', brand.shortName || brand.companyName);
  setText('#brandTagline', brand.tagline);
  setImage('#footerLogo', brand.logo, `${brand.companyName} logo`);
  setText('#footerCompany', brand.companyName);
  setText('#footerTagline', brand.tagline);
  setText('#copyrightCompany', brand.companyName);

  setText('#heroEyebrow', hero.eyebrow);
  setText('#heroHeadline', hero.headline);
  setText('#heroText', hero.supportingText);
  setText('#heroPrimaryCta', hero.ctaPrimary);
  setText('#heroSecondaryCta', hero.ctaSecondary);
  setImage('#heroImage', hero.heroImage, hero.headline);
  const heroStats = $('#heroStats');
  if (heroStats) {
    heroStats.replaceChildren();
    (hero.stats || []).forEach((stat) => {
      const item = document.createElement('div');
      appendText(item, 'strong', stat.value);
      appendText(item, 'span', stat.label);
      heroStats.appendChild(item);
    });
  }

  setText('#aboutEyebrow', about.eyebrow);
  setText('#aboutHeading', about.heading);
  setText('#aboutBody', about.body);
  setText('#aboutWhatTitle', about.whatWeDoTitle);
  setText('#aboutWhatBody', about.whatWeDoBody);
  setImage('#aboutImage', about.image, about.heading);
  setText('#visionTitle', visionMission.visionTitle);
  setText('#visionText', visionMission.visionText);
  setText('#missionTitle', visionMission.missionTitle);
  setText('#missionText', visionMission.missionText);

  setText('#servicesEyebrow', servicesIntro.eyebrow);
  setText('#servicesHeading', servicesIntro.heading);
  setText('#servicesBody', servicesIntro.body);
  setImage('#servicesBlueprint', servicesIntro.blueprintImage, 'Prefab modular unit blueprint');
  setText('#prefabEyebrow', prefab.eyebrow);
  setText('#prefabHeading', prefab.heading);
  setImage('#prefabImage', prefab.image, prefab.heading);
  if ($('#prefabFeatures')) renderList($('#prefabFeatures'), prefab.features);
  setText('#productsEyebrow', productsIntro.eyebrow);
  setText('#productsHeading', productsIntro.heading);
  setText('#productsBody', productsIntro.body);
  setText('#specEyebrow', specificationsIntro.eyebrow);
  setText('#specHeading', specificationsIntro.heading);
  setImage('#specImage', specificationsIntro.image, specificationsIntro.heading);
  setText('#materialsEyebrow', materialsIntro.eyebrow);
  setText('#materialsHeading', materialsIntro.heading);
  setText('#materialsBody', materialsIntro.body);
  setText('#featureEyebrow', galleryIntro.featureEyebrow);
  setText('#featureHeading', galleryIntro.featureHeading);
  setText('#featureBody', galleryIntro.featureBody);
  setText('#sampleEyebrow', galleryIntro.sampleEyebrow);
  setText('#sampleHeading', galleryIntro.sampleHeading);
  setText('#applicationsEyebrow', galleryIntro.applicationsEyebrow);
  setText('#applicationsHeading', galleryIntro.applicationsHeading);
  setText('#applicationsBody', galleryIntro.applicationsBody);
  setText('#customEyebrow', customize.eyebrow);
  setText('#customHeading', customize.heading);
  setImage('#containerSizesImage', customize.containerImage, 'Container sizes');
  setImage('#sprayColorsImage', customize.sprayImage, 'Spray colors');
  setText('#additionalOptions', customize.additionalOptions);
  setText('#advantagesEyebrow', advantages.eyebrow);
  setText('#advantagesHeading', advantages.heading);
  setText('#processTitle', siteData.trust?.processTitle);
  setText('#comparisonTitle', siteData.trust?.comparisonTitle);
  setText('#durabilityTitle', siteData.trust?.durabilityTitle);
  if ($('#durabilityPoints')) renderList($('#durabilityPoints'), siteData.trust?.durabilityPoints || []);
  if ($('#advantagesList')) renderList($('#advantagesList'), advantages.items);
  setText('#scheduleHeading', advantages.scheduleHeading);

  const timeline = $('#timelineGrid');
  if (timeline) {
    timeline.replaceChildren();
    (advantages.schedule || []).forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'timeline-card reveal';
      appendText(card, 'span', String(index + 1).padStart(2, '0'));
      appendText(card, 'h3', item);
      timeline.appendChild(card);
    });
  }

  renderCards(siteData);
  renderFaq(siteData.faq);
  setupContact(contact);
  setupCatalog(siteData.catalog?.url || catalogFallback);
  $('#currentYear') && ($('#currentYear').textContent = new Date().getFullYear());
}

function renderFaq(faq) {
  const list = $('.faq-list');
  if (!list || !Array.isArray(faq)) return;
  list.replaceChildren();
  faq.forEach((item, index) => {
    const details = document.createElement('details');
    if (index === 0) details.open = true;
    appendText(details, 'summary', item.question);
    appendText(details, 'p', item.answer);
    list.appendChild(details);
  });
}

function setupContact(contact) {
  const email = contact.email || contact.formRecipient || 'mathieukonstructsolutions@gmail.com';
  const phone1 = contact.phone1 || '';
  const phone2 = contact.phone2 || '';
  const office = text(contact.office).trim() || 'Main office details available upon inquiry.';
  const warehouse = text(contact.warehouse).trim() || 'Warehouse and site visits by appointment.';
  const hours = text(contact.businessHours).trim() || 'Monday to Saturday, by appointment.';
  const emailTargets = ['#contactEmailLink', '#footerEmailLink'];
  emailTargets.forEach((selector) => {
    const link = $(selector);
    if (link) {
      link.textContent = email;
      link.href = `mailto:${email}`;
    }
  });
  const phoneOne = $('#contactPhone1');
  if (phoneOne) {
    phoneOne.textContent = phone1 || 'Call details available upon inquiry';
    phoneOne.href = phone1 ? telHref(phone1) : '#contactForm';
  }
  const phoneTwo = $('#contactPhone2');
  if (phoneTwo) {
    phoneTwo.textContent = phone2;
    phoneTwo.href = phone2 ? telHref(phone2) : '#contactForm';
    phoneTwo.hidden = !phone2;
  }
  setText('#contactOffice', office);
  setText('#contactWarehouse', warehouse);
  setText('#contactBusinessHours', hours);
  setText('#footerPhone', `${phone1} / ${phone2}`);
  setText('#footerOffice', office);
  const emailUs = $('#emailUsBtn');
  if (emailUs) emailUs.href = `mailto:${email}`;
  const callNow = $('#callNowBtn');
  if (callNow) callNow.href = telHref(phone1);
  const wa = $('#floatingWhatsapp');
  const phone = normalizePhone(phone1 || phone2);
  if (wa && phone) wa.href = `https://wa.me/${phone}?text=${encodeURIComponent('Hello Mathieu Konstruct Solutions, I would like to inquire about prefab modular units.')}`;
}

function setupCatalog(url) {
  $$('.catalog-download-link').forEach((link) => {
    link.href = url;
    link.download = url.split('/').pop();
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    if (!link.dataset.trackingReady) {
      link.dataset.trackingReady = 'true';
      link.addEventListener('click', () => trackEvent('catalog_download_click', { link_text: text(link.textContent).trim(), href: url }));
    }
  });
}

function initThemeToggle() {
  const button = $('#themeToggle');
  const icon = $('.theme-icon');
  const label = $('.theme-label');
  const apply = (mode) => {
    const dark = mode === 'dark';
    document.body.classList.toggle('dark-theme', dark);
    if (icon) icon.textContent = dark ? 'Sun' : 'Moon';
    if (label) label.textContent = dark ? 'Light Mode' : 'Dark Mode';
    button?.setAttribute('aria-pressed', String(dark));
  };
  apply(localStorage.getItem('mksTheme') || 'light');
  button?.addEventListener('click', () => {
    const next = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    localStorage.setItem('mksTheme', next);
    apply(next);
    trackEvent('dark_mode_toggle', { mode: next });
  });
}

function initNavigation() {
  const toggle = $('.nav-toggle');
  const links = $('#primaryNav') || $('.nav-links');
  if (links) links.hidden = false;
  const close = () => {
    links?.classList.remove('open');
    document.body.classList.remove('nav-open');
    toggle?.setAttribute('aria-expanded', 'false');
    if (links) links.inert = window.innerWidth <= 980;
  };
  const open = () => {
    links?.classList.add('open');
    document.body.classList.add('nav-open');
    toggle?.setAttribute('aria-expanded', 'true');
    if (links) links.inert = false;
  };
  close();
  toggle?.addEventListener('click', () => (links?.classList.contains('open') ? close() : open()));
  $$('.nav-links a').forEach((link) => link.addEventListener('click', close));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && links) links.inert = false;
    if (window.innerWidth <= 980 && !links?.classList.contains('open') && links) links.inert = true;
  });
}

function initRevealAndScroll() {
  const reveals = $$('.reveal');
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-links a[href^="#"]');
  const setActiveNav = (id) => {
    if (!id) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  };
  $$('main section').forEach((section) => {
    $$('.reveal', section).forEach((node, index) => {
      node.classList.add('stagger-item');
      node.style.setProperty('--reveal-delay', `${Math.min(index * 70, 280)}ms`);
      node.style.setProperty('--reveal-distance', `${Math.min(28 + index * 2, 42)}px`);
    });
  });
  $$('.hero .reveal').forEach((node, index) => {
    node.classList.add(index % 2 ? 'reveal-from-right' : 'reveal-from-left');
    node.style.setProperty('--reveal-delay', `${index * 120}ms`);
  });
  if (prefersReducedMotion()) {
    reveals.forEach((node) => node.classList.add('visible', 'reveal-visible'));
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible', 'reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.14 });
    reveals.forEach((node) => observer.observe(node));
  } else {
    reveals.forEach((node) => node.classList.add('visible', 'reveal-visible'));
  }
  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActiveNav(visible.target.id);
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0.08, 0.18, 0.32] });
    sections.forEach((section) => navObserver.observe(section));
  }
  const header = $('.site-header');
  const back = $('.back-to-top');
  const updateChrome = () => {
    header?.classList.toggle('scrolled', window.scrollY > 12);
    back?.classList.toggle('show', window.scrollY > 500);
  };
  updateChrome();
  window.addEventListener('scroll', () => {
    updateChrome();
  }, { passive: true });
  back?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));
}

function trapFocus(dialog, closeCallback) {
  const previous = document.activeElement;
  const focusables = () => $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', dialog).filter((node) => node.offsetParent !== null);
  const handler = (event) => {
    if (event.key === 'Escape') closeCallback();
    if (event.key !== 'Tab') return;
    const nodes = focusables();
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', handler);
  focusables()[0]?.focus();
  return () => {
    document.removeEventListener('keydown', handler);
    previous?.focus?.();
  };
}

function initLightbox() {
  const lightbox = $('.lightbox');
  const image = $('.lightbox img');
  const closeBtn = $('.lightbox-close');
  const prevBtn = $('.lightbox-prev');
  const nextBtn = $('.lightbox-next');
  let items = [];
  let active = 0;
  let releaseFocus = null;
  const fallbackImage = 'assets/images/logo.png';
  const isImageUrl = (value) => {
    const source = text(value).trim();
    if (!source || source === window.location.href) return false;
    return /\.(avif|webp|png|jpe?g|gif|svg)(\?.*)?$/i.test(source);
  };
  const resolveImageSource = (img) => {
    if (!img) return '';
    const full = img.closest('[data-full]')?.dataset.full;
    const candidates = [full, img.currentSrc, img.getAttribute('src'), img.src].map(text).filter(Boolean);
    return candidates.find(isImageUrl) || '';
  };
  const collect = () => {
    items = $$('main img, .product-modal-image img').filter((img) => !img.closest('a, .lightbox') && resolveImageSource(img));
    items.forEach((img) => {
      if (img.dataset.lightboxReady) return;
      img.dataset.lightboxReady = 'true';
      img.classList.add('lightbox-clickable-image');
      if (img.closest('[data-full]')) {
        img.removeAttribute('tabindex');
        return;
      }
      img.tabIndex = 0;
      img.addEventListener('click', () => open(items.indexOf(img)));
      img.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open(items.indexOf(img));
        }
      });
    });
    $$('[data-full]').forEach((trigger) => {
      if (trigger.dataset.lightboxTriggerReady) return;
      const triggerImage = $('img', trigger);
      if (!triggerImage || !resolveImageSource(triggerImage)) return;
      trigger.dataset.lightboxTriggerReady = 'true';
      trigger.addEventListener('click', () => {
        collect();
        open(items.indexOf(triggerImage));
      });
    });
  };
  const show = (index) => {
    if (!items.length || !image) return;
    active = (index + items.length) % items.length;
    const source = items[active];
    const resolved = resolveImageSource(source) || fallbackImage;
    if (!prefersReducedMotion()) {
      image.classList.add('is-changing');
      image.addEventListener('load', () => image.classList.remove('is-changing'), { once: true });
      window.setTimeout(() => image.classList.remove('is-changing'), 420);
    }
    image.src = resolved;
    image.alt = source.alt || 'Expanded gallery image';
    image.onerror = () => {
      if (!image.src.endsWith(fallbackImage)) image.src = fallbackImage;
      image.alt = 'Mathieu Konstruct Solutions image preview unavailable';
      image.classList.remove('is-changing');
    };
  };
  const open = (index) => {
    collect();
    if (!lightbox || !image || index < 0 || !items.length) return;
    show(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    releaseFocus = trapFocus(lightbox, close);
  };
  const close = () => {
    lightbox?.classList.remove('open');
    lightbox?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (image) image.src = '';
    releaseFocus?.();
    releaseFocus = null;
  };
  collect();
  closeBtn?.addEventListener('click', close);
  prevBtn?.addEventListener('click', () => show(active - 1));
  nextBtn?.addEventListener('click', () => show(active + 1));
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
}

function initProducts(siteData) {
  const products = siteData.products || [];
  const select = $('#quoteProductType');
  if (select && select.options.length <= 1) {
    products.forEach((product) => {
      const option = document.createElement('option');
      option.value = product.title;
      option.textContent = product.title;
      select.appendChild(option);
    });
  }
  const filters = $('#productFilters');
  const search = $('#productSearch');
  const categories = ['All', ...new Set(products.map((product) => product.category || 'Prefab'))];
  if (filters) {
    filters.replaceChildren();
    categories.forEach((category, index) => {
      const button = appendText(filters, 'button', category);
      button.type = 'button';
      button.dataset.filter = category;
      button.classList.toggle('active', index === 0);
    });
  }
  let activeFilter = 'All';
  const apply = () => {
    const query = text(search?.value).trim().toLowerCase();
    $$('#productsGrid .product-card').forEach((card) => {
      const visible = (activeFilter === 'All' || card.dataset.category === activeFilter) && (!query || card.dataset.search.includes(query));
      card.classList.toggle('hidden-by-filter', !visible);
    });
  };
  filters?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    activeFilter = button.dataset.filter;
    $$('button', filters).forEach((item) => item.classList.toggle('active', item === button));
    apply();
  });
  search?.addEventListener('input', apply);

  const modal = $('#productInquiryModal');
  let releaseFocus = null;
  let activeProduct = null;
  const closeModal = () => {
    modal?.classList.add('closing');
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    releaseFocus?.();
    releaseFocus = null;
    window.setTimeout(() => modal?.classList.remove('closing'), prefersReducedMotion() ? 0 : 260);
  };
  const openModal = (id) => {
    const product = findProduct(products, id);
    if (!product || !modal) return;
    trackEvent('product_quick_view', { product_id: product.id, product_name: product.title });
    activeProduct = product;
    setImage('#modalProductImage', product.image, product.alt || product.title);
    setText('#modalProductTitle', product.title);
    setText('#modalProductDescription', product.description);
    setText('#modalProductBestUse', product.bestUse);
    setText('#modalProductSize', product.sizeOptions);
    const featureBox = $('#modalProductFeatures');
    if (featureBox) renderList(featureBox, product.features || product.highlights || []);
    modal.classList.remove('closing');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    releaseFocus = trapFocus(modal, closeModal);
  };
  document.addEventListener('click', (event) => {
    const detailLink = event.target.closest('.product-detail-link');
    const details = event.target.closest('.product-view-btn');
    const quote = event.target.closest('.product-quote-btn');
    if (detailLink) trackEvent('product_detail_click', { product_id: detailLink.dataset.productId, href: detailLink.href });
    if (details) openModal(details.dataset.productId);
    if (quote) {
      event.preventDefault();
      const card = quote.closest('.product-card');
      const product = findProduct(products, quote.dataset.productId || card?.dataset.productId);
      trackEvent('product_inquiry_click', { product_id: product?.id, product_name: product?.title });
      prefillQuote(product, siteData.contact);
    }
  });
  $('.product-modal-close')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  $('#modalRequestQuote')?.addEventListener('click', () => {
    prefillQuote(activeProduct, siteData.contact);
    closeModal();
  });
  const requestedProduct = new URLSearchParams(window.location.search).get('product');
  if (requestedProduct && location.hash === '#quote') {
    window.setTimeout(() => {
      const product = findProduct(products, requestedProduct);
      if (product) {
        trackEvent('product_detail_inquiry_landing', { product_id: product.id, product_name: product.title });
        prefillQuote(product, siteData.contact);
      }
    }, 250);
  }
}

function buildInquiry(form, product) {
  const data = new FormData(form);
  return [
    `Name: ${data.get('name') || ''}`,
    `Contact Number: ${data.get('phone') || ''}`,
    `Email: ${data.get('email') || ''}`,
    `Product Type: ${data.get('productType') || product?.title || ''}`,
    `Quantity: ${data.get('quantity') || ''}`,
    `Project Location: ${data.get('location') || ''}`,
    '',
    'Message:',
    data.get('message') || ''
  ].join('\n');
}

function visibleFormData(form) {
  const data = new FormData(form);
  data.delete(form.dataset.honeypotName || 'company_website');
  data.delete('submittedAt');
  data.delete('formStartedAt');
  return data;
}

async function copyText(value) {
  const content = text(value);
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {}
  }
  const textarea = document.createElement('textarea');
  textarea.value = content;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-999px';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  textarea.remove();
  return ok;
}

async function submitConfiguredForm(form, endpoint, method) {
  const data = visibleFormData(form);
  const response = await fetch(endpoint, {
    method: method || 'POST',
    body: data,
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) throw new Error('The form endpoint did not accept the inquiry.');
  return response;
}

function formSpamBlocked(form, formsConfig) {
  const honeypot = $(`[name="${formsConfig.honeypotName || 'company_website'}"]`, form);
  if (honeypot?.value) return true;
  const started = Number(form.dataset.startedAt || 0);
  const minMs = Number(formsConfig.minimumSubmitSeconds || 0) * 1000;
  return Boolean(started && minMs && Date.now() - started < minMs);
}

function scrollToTarget(target) {
  if (!target) return;
  const headerHeight = $('.site-header')?.offsetHeight || 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 18;
  window.scrollTo({ top: Math.max(top, 0), behavior: prefersReduced ? 'auto' : 'smooth' });
}

function prefillQuote(product, contact) {
  const form = $('#quoteForm');
  if (!form || !product) return;
  form.productType.value = product.title;
  if (!form.message.value) form.message.value = `I would like to inquire about ${product.title}. Best use: ${product.bestUse || ''}`;
  form.dataset.startedAt = String(Date.now() - 4000);
  updateWhatsAppLink(contact);
  scrollToTarget($('#quote'));
  window.setTimeout(() => form.productType.focus({ preventScroll: true }), 320);
}

function updateWhatsAppLink(contact) {
  const form = $('#quoteForm');
  const link = $('#whatsappQuoteBtn');
  const phone = normalizePhone(contact?.phone1 || contact?.phone2);
  if (!form || !link || !phone) return;
  link.href = `https://wa.me/${phone}?text=${encodeURIComponent(buildInquiry(form))}`;
}

function initForms(siteData) {
  const recipient = siteData.contact?.formRecipient || siteData.contact?.email || 'mathieukonstructsolutions@gmail.com';
  const formsConfig = Object.assign({ provider: 'mailto', quoteEndpoint: '', contactEndpoint: '', method: 'POST', honeypotName: 'company_website', minimumSubmitSeconds: 3 }, siteData.forms || {});
  const startTracking = (form, eventName) => {
    if (!form) return;
    form.dataset.startedAt = String(Date.now());
    form.dataset.honeypotName = formsConfig.honeypotName;
    $$('.honeypot-field input', form).forEach((input) => {
      input.name = formsConfig.honeypotName || 'company_website';
      input.tabIndex = -1;
      input.autocomplete = 'off';
    });
    let started = false;
    form.addEventListener('input', () => {
      if (started) return;
      started = true;
      trackEvent(eventName, { form_id: form.id });
    }, { once: true });
  };
  const pulseSubmit = (form) => {
    const button = $('button[type="submit"]', form);
    button?.classList.add('is-sending');
    form.setAttribute('aria-busy', 'true');
    window.setTimeout(() => {
      button?.classList.remove('is-sending');
      form.removeAttribute('aria-busy');
    }, 1500);
  };
  const quote = $('#quoteForm');
  startTracking(quote, 'quote_form_started');
  quote?.addEventListener('input', () => updateWhatsAppLink(siteData.contact));
  quote?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!quote.checkValidity()) return quote.reportValidity();
    if (formSpamBlocked(quote, formsConfig)) {
      announce(quote, 'Please wait a moment before sending your inquiry.', true);
      return;
    }
    pulseSubmit(quote);
    const endpoint = formsConfig.quoteEndpoint;
    if (endpoint) {
      try {
        await submitConfiguredForm(quote, endpoint, formsConfig.method);
        announce(quote, 'Quote request sent. The team will review your project details.');
        trackEvent('quote_form_submitted', { method: formsConfig.provider || 'endpoint', product_type: quote.productType.value || '' });
        quote.reset();
        updateWhatsAppLink(siteData.contact);
        return;
      } catch (error) {
        announce(quote, 'Form endpoint unavailable. Opening your email app instead.', true);
      }
    }
    const subject = encodeURIComponent(`Quotation Request - ${quote.productType.value || 'Prefab Project'}`);
    trackEvent('quote_form_submitted', { method: 'mailto', product_type: quote.productType.value || '' });
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${encodeURIComponent(buildInquiry(quote))}`;
  });
  $('#copyInquiryBtn')?.addEventListener('click', async () => {
    if (!quote) return;
    const copied = await copyText(buildInquiry(quote));
    announce(quote, copied ? 'Inquiry details copied.' : 'Copy unavailable. Please select and copy the inquiry text manually.', !copied);
    trackEvent('copy_inquiry_details', { form_id: 'quoteForm' });
  });
  const contact = $('#contactForm');
  startTracking(contact, 'contact_form_started');
  contact?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contact.checkValidity()) return contact.reportValidity();
    if (formSpamBlocked(contact, formsConfig)) {
      announce(contact, 'Please wait a moment before sending your inquiry.', true);
      return;
    }
    pulseSubmit(contact);
    const data = new FormData(contact);
    const body = `Name: ${data.get('name') || ''}\nEmail: ${data.get('email') || ''}\nPhone: ${data.get('phone') || ''}\nProject Type: ${data.get('project') || ''}\n\nMessage:\n${data.get('message') || ''}`;
    if (formsConfig.contactEndpoint) {
      try {
        await submitConfiguredForm(contact, formsConfig.contactEndpoint, formsConfig.method);
        announce(contact, 'Inquiry sent. The team will respond through your contact details.');
        trackEvent('contact_form_submitted', { method: formsConfig.provider || 'endpoint' });
        contact.reset();
        return;
      } catch (error) {
        announce(contact, 'Form endpoint unavailable. Opening your email app instead.', true);
      }
    }
    trackEvent('contact_form_submitted', { method: 'mailto' });
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(`Prefab Inquiry - ${data.get('project') || 'Project'}`)}&body=${encodeURIComponent(body)}`;
  });
  $('#whatsappQuoteBtn')?.addEventListener('click', () => trackEvent('whatsapp_click', { source: 'quote_form' }));
  $$('a[href^="tel:"]').forEach((link) => link.addEventListener('click', () => trackEvent('phone_click', { href: link.href })));
  $$('a[href^="mailto:"]').forEach((link) => link.addEventListener('click', () => trackEvent('email_click', { href: link.href })));
  updateWhatsAppLink(siteData.contact);
}

function announce(form, message, error = false) {
  let status = $('.form-status', form);
  if (!status) {
    status = appendText(form, 'p', '', 'form-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
  }
  status.textContent = message;
  status.classList.toggle('error', Boolean(error));
}

function initCustomizer(siteData) {
  const state = { size: '24 ft', colorName: 'Yellow', color: '#f4d647', panel: 'PU Polyurethane' };
  const preview = $('#unitPreview');
  let renderTimer = null;
  const sizeScale = {
    '24 ft': '1',
    '20 ft': '.94',
    '16 ft': '.88',
    '10 ft': '.78',
    '8 ft': '.72'
  };
  const panelTextures = {
    'PU Polyurethane': 'linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)',
    Rockwool: 'radial-gradient(circle at 12% 24%, rgba(255,255,255,.24) 0 1px, transparent 2px), radial-gradient(circle at 72% 60%, rgba(12,31,34,.16) 0 1px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)',
    'Glass Wool': 'repeating-linear-gradient(115deg, rgba(255,255,255,.22) 0 1px, transparent 1px 8px), linear-gradient(90deg, rgba(255,255,255,.10) 1px, transparent 1px)',
    'EPS Expanded Polystyrene': 'radial-gradient(circle, rgba(255,255,255,.34) 0 1px, transparent 1.8px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)'
  };
  const accentFor = (color) => (color === '#253540' || color === '#415463' ? '#7fc7bf' : '#0b5a53');
  const setActive = (selector, activeButton) => {
    $$(selector).forEach((node) => {
      const active = node === activeButton;
      node.classList.toggle('active', active);
      node.setAttribute('aria-pressed', String(active));
    });
  };
  const triggerRender = () => {
    if (!preview) return;
    window.clearTimeout(renderTimer);
    preview.classList.remove('is-rendering');
    void preview.offsetWidth;
    preview.classList.add('is-rendering');
    renderTimer = window.setTimeout(() => preview.classList.remove('is-rendering'), 780);
  };
  const update = (animate = true) => {
    if (preview) {
      preview.style.setProperty('--unit-color', state.color);
      preview.style.setProperty('--unit-scale', sizeScale[state.size] || '1');
      preview.style.setProperty('--render-accent', accentFor(state.color));
      preview.style.setProperty('--panel-texture', panelTextures[state.panel] || panelTextures['PU Polyurethane']);
      preview.dataset.panel = state.panel;
    }
    setText('#previewSizeLabel', state.size);
    setText('#previewPanelLabel', state.panel);
    setText('#previewColorLabel', state.colorName);
    setText('#previewSizeText', state.size);
    setText('#previewPanelText', state.panel);
    setText('#previewColorText', state.colorName);
    if (animate) triggerRender();
  };
  $('#sizeOptions')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-size]');
    if (!button) return;
    state.size = button.dataset.size;
    setActive('[data-size]', button);
    update();
  });
  $('#colorOptions')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-color]');
    if (!button) return;
    state.colorName = button.dataset.color;
    state.color = button.dataset.value;
    setActive('[data-color]', button);
    update();
  });
  $('#panelOptions')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-panel]');
    if (!button) return;
    state.panel = button.dataset.panel;
    setActive('[data-panel]', button);
    update();
  });
  $('#customQuoteBtn')?.addEventListener('click', () => {
    const form = $('#quoteForm');
    if (!form) return;
    form.productType.value = 'Customized Container House';
    form.message.value = `Customize request: ${state.size}, ${state.colorName} spray color, ${state.panel} wall panel.`;
    updateWhatsAppLink(siteData.contact);
    $('#quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  setActive('[data-size]', $('[data-size].active') || $('[data-size]'));
  setActive('[data-color]', $('[data-color].active') || $('[data-color]'));
  setActive('[data-panel]', $('[data-panel].active') || $('[data-panel]'));
  update(false);
}

function initQuality() {
  $$('form input, form select, form textarea').forEach((control, index) => {
    if (control.closest('label') || control.type === 'hidden') return;
    const id = control.id || `${control.name || 'field'}-${index}`;
    control.id = id;
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.className = control.tagName === 'TEXTAREA' ? 'field-full generated-label' : 'generated-label';
    label.textContent = control.getAttribute('aria-label') || control.getAttribute('placeholder') || control.name || 'Form field';
    control.parentNode.insertBefore(label, control);
    label.appendChild(control);
    control.removeAttribute('aria-label');
  });
  $$('img').forEach((img) => {
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
    if (!img.closest('.hero-visual') && !img.hasAttribute('loading')) img.loading = 'lazy';
    if (!img.width) img.width = 1200;
    if (!img.height) img.height = 900;
  });
  $$('a[target="_blank"]').forEach((link) => {
    const rel = new Set(text(link.rel).split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.rel = Array.from(rel).join(' ');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  const siteData = window.getSiteData();
  renderSiteContent(siteData);
  initThemeToggle();
  initNavigation();
  initRevealAndScroll();
  initProducts(siteData);
  initLightbox();
  initForms(siteData);
  initCustomizer(siteData);
  initQuality();
});
