
function el(selector) { return document.querySelector(selector); }
function els(selector) { return Array.from(document.querySelectorAll(selector)); }
function nl2br(text) { return String(text || '').replace(/\n/g, '<br>'); }
function safeText(value) { return value == null ? '' : String(value); }

function applySeo(data) {
  document.title = data.pageTitle || document.title;
  const mappings = [
    ['meta[name="description"]', 'content', data.metaDescription],
    ['meta[name="keywords"]', 'content', data.metaKeywords],
    ['meta[property="og:title"]', 'content', data.ogTitle],
    ['meta[property="og:description"]', 'content', data.ogDescription],
    ['meta[property="og:image"]', 'content', data.ogImage],
    ['link[rel="icon"]', 'href', data.ogImage || 'assets/images/logo.png']
  ];
  mappings.forEach(([selector, attr, value]) => {
    const node = document.querySelector(selector);
    if (node && value) node.setAttribute(attr, value);
  });
}

function renderSiteContent(siteData) {
  const { brand, hero, about, visionMission, servicesIntro, services, prefab, productsIntro, products, specificationsIntro, specifications, materialsIntro, materials, galleryIntro, gallery, customize, advantages, contact, seo } = siteData;
  applySeo(seo || {});

  const setText = (id, value) => { const node = el(id); if (node) node.textContent = safeText(value); };
  const setHtml = (id, value) => { const node = el(id); if (node) node.innerHTML = value || ''; };
  const setSrc = (id, value, alt) => { const node = el(id); if (node && value) node.src = value; if (node && alt) node.alt = alt; };

  setSrc('#brandLogo', brand.logo, `${brand.companyName} logo`);
  setText('#brandText', brand.shortName || brand.companyName);
  setText('#brandTagline', brand.tagline);
  setSrc('#footerLogo', brand.logo, `${brand.companyName} logo`);
  setText('#footerCompany', brand.companyName);
  setText('#footerTagline', brand.tagline);
  setText('#copyrightCompany', brand.companyName);

  setText('#heroEyebrow', hero.eyebrow);
  setText('#heroHeadline', hero.headline);
  setText('#heroText', hero.supportingText);
  setText('#heroPrimaryCta', hero.ctaPrimary);
  setText('#heroSecondaryCta', hero.ctaSecondary);
  setSrc('#heroImage', hero.heroImage, hero.headline);
  const heroStats = el('#heroStats');
  if (heroStats) heroStats.innerHTML = (hero.stats || []).map(item => `<div><strong>${safeText(item.value)}</strong><span>${safeText(item.label)}</span></div>`).join('');

  setText('#aboutEyebrow', about.eyebrow);
  setText('#aboutHeading', about.heading);
  setText('#aboutBody', about.body);
  setText('#aboutWhatTitle', about.whatWeDoTitle);
  setText('#aboutWhatBody', about.whatWeDoBody);
  setSrc('#aboutImage', about.image, about.heading);

  setText('#visionTitle', visionMission.visionTitle);
  setText('#visionText', visionMission.visionText);
  setText('#missionTitle', visionMission.missionTitle);
  setText('#missionText', visionMission.missionText);

  setText('#servicesEyebrow', servicesIntro.eyebrow);
  setText('#servicesHeading', servicesIntro.heading);
  setText('#servicesBody', servicesIntro.body);
  setSrc('#servicesBlueprint', servicesIntro.blueprintImage, 'Blueprint');
  const servicesGrid = el('#servicesGrid');
  if (servicesGrid) servicesGrid.innerHTML = (services || []).map(item => `
    <article class="service-card reveal"><span>${safeText(item.icon)}</span><h3>${safeText(item.name)}</h3><p>${safeText(item.description)}</p></article>
  `).join('');

  setText('#prefabEyebrow', prefab.eyebrow);
  setText('#prefabHeading', prefab.heading);
  setSrc('#prefabImage', prefab.image, prefab.heading);
  const prefabFeatures = el('#prefabFeatures');
  if (prefabFeatures) prefabFeatures.innerHTML = (prefab.features || []).map(item => `<span>${safeText(item)}</span>`).join('');

  setText('#productsEyebrow', productsIntro.eyebrow);
  setText('#productsHeading', productsIntro.heading);
  setText('#productsBody', productsIntro.body);
  const productsGrid = el('#productsGrid');
  if (productsGrid) productsGrid.innerHTML = (products || []).map(item => `
    <article class="product-card reveal">
      <div class="product-image-wrap"><img src="${safeText(item.image)}" alt="${safeText(item.title)}" loading="lazy"></div>
      <div><h3>${safeText(item.title)}</h3><p>${safeText(item.description)}</p></div>
    </article>`).join('');

  setText('#specEyebrow', specificationsIntro.eyebrow);
  setText('#specHeading', specificationsIntro.heading);
  setSrc('#specImage', specificationsIntro.image, specificationsIntro.heading);
  const specGrid = el('#specGrid');
  if (specGrid) specGrid.innerHTML = (specifications || []).map(item => `<div><h3>${safeText(item.title)}</h3><p>${nl2br(item.content)}</p></div>`).join('');

  setText('#materialsEyebrow', materialsIntro.eyebrow);
  setText('#materialsHeading', materialsIntro.heading);
  setText('#materialsBody', materialsIntro.body);
  const materialsGrid = el('#materialsGrid');
  if (materialsGrid) materialsGrid.innerHTML = (materials || []).map(item => `
    <article class="material-card reveal">
      <div class="material-image-wrap"><img src="${safeText(item.image)}" alt="${safeText(item.name)}" loading="lazy"></div>
      <h3>${safeText(item.name)}</h3>
      <p>${safeText(item.properties || '')}</p>
    </article>`).join('');

  setText('#featureEyebrow', galleryIntro.featureEyebrow);
  setText('#featureHeading', galleryIntro.featureHeading);
  setText('#featureBody', galleryIntro.featureBody);
  setText('#sampleEyebrow', galleryIntro.sampleEyebrow);
  setText('#sampleHeading', galleryIntro.sampleHeading);
  setText('#applicationsEyebrow', galleryIntro.applicationsEyebrow);
  setText('#applicationsHeading', galleryIntro.applicationsHeading);
  setText('#applicationsBody', galleryIntro.applicationsBody);

  const featureItems = (gallery || []).filter(item => item.category === 'Feature Details');
  const sampleItems = (gallery || []).filter(item => item.category === 'Sample Layout');
  const appItems = (gallery || []).filter(item => item.category === 'Applications');
  const featureGrid = el('#featureGalleryGrid');
  if (featureGrid) featureGrid.innerHTML = featureItems.map(item => `
    <button class="gallery-item feature-gallery-card reveal" data-full="${safeText(item.image)}">
      <div class="feature-gallery-image-wrap"><img src="${safeText(item.image)}" alt="${safeText(item.alt || item.title)}" loading="lazy"></div>
      <div class="feature-gallery-caption">${safeText(item.title)}</div>
    </button>`).join('');

  const sampleGrid = el('#sampleLayoutGrid');
  if (sampleGrid) sampleGrid.innerHTML = sampleItems.map((item, idx) => `
    <button class="gallery-item sample-layout-card ${idx < 2 ? 'large' : 'small'} reveal" data-full="${safeText(item.image)}">
      <div class="sample-layout-image-wrap"><img src="${safeText(item.image)}" alt="${safeText(item.alt || item.title)}" loading="lazy"></div>
    </button>`).join('');

  const appsGrid = el('#applicationsGrid');
  if (appsGrid) appsGrid.innerHTML = appItems.map(item => `
    <article class="app-card reveal"><img src="${safeText(item.image)}" alt="${safeText(item.alt || item.title)}" loading="lazy"><h3>${safeText(item.title)}</h3></article>`).join('');

  setText('#customEyebrow', customize.eyebrow);
  setText('#customHeading', customize.heading);
  setSrc('#containerSizesImage', customize.containerImage, 'Container sizes');
  setSrc('#sprayColorsImage', customize.sprayImage, 'Spray colors');
  setText('#additionalOptions', customize.additionalOptions);

  setText('#advantagesEyebrow', advantages.eyebrow);
  setText('#advantagesHeading', advantages.heading);
  const advantagesList = el('#advantagesList');
  if (advantagesList) advantagesList.innerHTML = (advantages.items || []).map(item => `<span>${safeText(item)}</span>`).join('');
  setText('#scheduleHeading', advantages.scheduleHeading);
  const timelineGrid = el('#timelineGrid');
  if (timelineGrid) timelineGrid.innerHTML = (advantages.schedule || []).map((item, index) => `
    <article class="timeline-card reveal"><span>${String(index + 1).padStart(2, '0')}</span><h3>${safeText(item)}</h3></article>`).join('');

  setText('#contactEyebrow', contact.eyebrow);
  setText('#contactHeading', contact.heading);
  const mailHref = `mailto:${contact.formRecipient || contact.email}`;
  const telHref = `tel:${String(contact.phone1 || '').replace(/[^+\d]/g, '')}`;
  const emailLink = el('#contactEmailLink');
  if (emailLink) { emailLink.textContent = contact.email; emailLink.href = `mailto:${contact.email}`; }
  setText('#contactPhone1', contact.phone1);
  setText('#contactPhone2', contact.phone2);
  setText('#contactOffice', contact.office);
  setText('#contactWarehouse', contact.warehouse);
  const emailUsBtn = el('#emailUsBtn'); if (emailUsBtn) emailUsBtn.href = mailHref;
  const callNowBtn = el('#callNowBtn'); if (callNowBtn) callNowBtn.href = telHref;

  const footerEmail = el('#footerEmailLink');
  if (footerEmail) { footerEmail.textContent = contact.email; footerEmail.href = `mailto:${contact.email}`; }
  setText('#footerPhone', `${contact.phone1} / ${contact.phone2}`);
  setText('#footerOffice', contact.office);
  setText('#currentYear', new Date().getFullYear());
}


function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.querySelector('.theme-icon');
  const themeLabel = document.querySelector('.theme-label');
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function preferredMode() {
    return localStorage.getItem('mksTheme') || 'light';
  }

  function isDarkMode(mode) {
    return mode === 'dark' || (mode === 'system' && mediaQuery.matches);
  }

  function applyTheme(mode = preferredMode()) {
    const dark = isDarkMode(mode);
    document.body.classList.toggle('dark-theme', dark);
    if (themeIcon) themeIcon.textContent = dark ? '☀️' : '🌙';
    if (themeLabel) themeLabel.textContent = dark ? 'Light Mode' : 'Dark Mode';
  }

  applyTheme();

  themeToggle?.addEventListener('click', () => {
    const nextMode = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    localStorage.setItem('mksTheme', nextMode);
    applyTheme(nextMode);
  });

  mediaQuery.addEventListener?.('change', () => {
    if (preferredMode() === 'system') applyTheme('system');
  });
}

function initInteractions(siteData) {
  const siteHeader = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const backToTop = document.querySelector('.back-to-top');

  initThemeToggle();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const observeReveals = () => {
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14 });
      revealElements.forEach(el => revealObserver.observe(el));
    } else revealElements.forEach(el => el.classList.add('visible'));
  };
  observeReveals();

  window.addEventListener('scroll', () => {
    if (backToTop) backToTop.classList.toggle('show', window.scrollY > 500);
    if (siteHeader) siteHeader.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox img');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  let lightboxItems = [];
  let activeIndex = 0;
  let closeTimer;

  function imageLabel(image) {
    return image?.alt || image?.closest('article, .custom-card, .product-card')?.querySelector('h3, h2')?.textContent || 'Expanded gallery image';
  }

  function getLightboxImageSource(image) {
    const trigger = image.closest('[data-full]');
    return trigger?.dataset.full || image.currentSrc || image.src;
  }

  function refreshLightboxBindings() {
    const selector = [
      'main img:not([data-no-lightbox])',
      '.product-modal-image img:not([data-no-lightbox])'
    ].join(', ');

    lightboxItems = Array.from(document.querySelectorAll(selector)).filter(image => {
      const src = getLightboxImageSource(image);
      return src && !image.closest('a, .lightbox, .footer, .site-header');
    });

    lightboxItems.forEach((image, index) => {
      if (image.dataset.lightboxReady === 'true') return;
      image.dataset.lightboxReady = 'true';
      image.classList.add('lightbox-clickable-image');
      image.setAttribute('role', 'button');
      image.setAttribute('tabindex', '0');
      image.setAttribute('title', 'Click to view');

      const triggerParent = image.closest('.product-image-wrap, .material-image-wrap, .feature-gallery-image-wrap, .sample-layout-image-wrap, .image-theme-panel, .custom-card, .panel-card, .app-card, .project-card, .product-modal-image');
      triggerParent?.classList.add('lightbox-trigger-wrap');

      image.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        refreshLightboxBindings();
        openLightbox(lightboxItems.indexOf(image));
      });

      image.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          refreshLightboxBindings();
          openLightbox(lightboxItems.indexOf(image));
        }
      });
    });

    prevBtn?.classList.toggle('hidden', lightboxItems.length <= 1);
    nextBtn?.classList.toggle('hidden', lightboxItems.length <= 1);
  }

  function openLightbox(index) {
    if (!lightbox || !lightboxImg || !lightboxItems.length || index < 0) return;
    window.clearTimeout(closeTimer);
    activeIndex = index;
    const image = lightboxItems[activeIndex];
    lightboxImg.src = getLightboxImageSource(image);
    lightboxImg.alt = imageLabel(image);
    lightbox.classList.remove('closing');
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg || !lightbox.classList.contains('open')) return;
    lightbox.classList.add('closing');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    closeTimer = window.setTimeout(() => {
      lightbox.classList.remove('open', 'closing');
      lightboxImg.src = '';
    }, 220);
  }

  function showNext(direction) {
    if (!lightboxItems.length) return;
    activeIndex = (activeIndex + direction + lightboxItems.length) % lightboxItems.length;
    openLightbox(activeIndex);
  }

  refreshLightboxBindings();
  window.addEventListener('load', refreshLightboxBindings);
  closeBtn?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', event => { event.stopPropagation(); showNext(-1); });
  nextBtn?.addEventListener('click', event => { event.stopPropagation(); showNext(1); });
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (!lightbox?.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showNext(-1);
    if (event.key === 'ArrowRight') showNext(1);
  });

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(contactForm);
      const subject = encodeURIComponent(`Prefab Inquiry - ${form.get('project') || 'Project'}`);
      const body = encodeURIComponent(
        `Name: ${form.get('name') || ''}\n` +
        `Email: ${form.get('email') || ''}\n` +
        `Phone: ${form.get('phone') || ''}\n` +
        `Project Type: ${form.get('project') || ''}\n\n` +
        `Message:\n${form.get('message') || ''}`
      );
      const recipient = (siteData.contact && (siteData.contact.formRecipient || siteData.contact.email)) || 'mathieukonstructsolutions@gmail.com';
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    });
  }
}



function initSalesEnhancements(siteData) {
  const products = siteData.products || [];
  const contact = siteData.contact || {};
  const catalogUrl = 'assets/catalog/PREFAB-CATALOG-MKS-CO-LTD-2026.pdf';
  document.querySelectorAll('.catalog-download-link').forEach(link => {
    link.href = catalogUrl;
    link.setAttribute('download', 'PREFAB-CATALOG-MKS-CO-LTD-2026.pdf');
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
    link.setAttribute('title', 'Download Mathieu Konstruct Solutions Product Catalog');
    link.setAttribute('aria-label', 'Download Mathieu Konstruct Solutions Product Catalog PDF');
  });
  if (window.fetch) {
    fetch(catalogUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          document.querySelectorAll('.catalog-download-link').forEach(link => {
            link.removeAttribute('download');
            link.setAttribute('target', '_blank');
          });
        }
      })
      .catch(() => {
        document.querySelectorAll('.catalog-download-link').forEach(link => {
          link.removeAttribute('download');
          link.setAttribute('target', '_blank');
        });
      });
  }
  function normalizePhone(phone){let cleaned=String(phone||'').replace(/[^+\d]/g,'');if(cleaned.startsWith('+'))cleaned=cleaned.slice(1);if(cleaned.startsWith('0'))cleaned='63'+cleaned.slice(1);return cleaned;}
  const whatsapp=document.getElementById('floatingWhatsapp'); const messenger=document.getElementById('floatingMessenger'); const waPhone=normalizePhone(contact.phone1||contact.phone2);
  if(whatsapp&&waPhone) whatsapp.href=`https://wa.me/${waPhone}?text=${encodeURIComponent('Hello Mathieu Konstruct Solutions, I would like to inquire about prefab modular units.')}`;
  if(messenger) messenger.href='#quote';
  function productCategory(product){const title=String(product.title||'').toLowerCase(); if(title.includes('capsule'))return 'Capsule'; if(title.includes('a-frame'))return 'A-Frame'; if(title.includes('quick'))return 'Quick Build'; if(title.includes('custom'))return 'Custom'; if(title.includes('container'))return 'Container'; return 'Prefab';}
  const quoteSelect=document.getElementById('quoteProductType'); if(quoteSelect&&!quoteSelect.dataset.ready){quoteSelect.insertAdjacentHTML('beforeend', products.map(p=>`<option value="${safeText(p.title)}">${safeText(p.title)}</option>`).join(''));quoteSelect.dataset.ready='true';}
  const productCards=Array.from(document.querySelectorAll('#productsGrid .product-card'));
  productCards.forEach((card,index)=>{const product=products[index]||{}; const category=productCategory(product); card.dataset.title=String(product.title||'').toLowerCase(); card.dataset.description=String(product.description||'').toLowerCase(); card.dataset.category=category; if(!card.querySelector('.product-badge')){const badge=document.createElement('span');badge.className='product-badge';badge.textContent=category;card.appendChild(badge);} const content=card.querySelector('div:last-child'); if(content&&!content.querySelector('.product-actions')){const actions=document.createElement('div');actions.className='product-actions';actions.innerHTML=`<button class="btn btn-primary product-view-btn" type="button" data-product-index="${index}">View Details</button><button class="btn btn-outline product-quote-btn" type="button" data-product-index="${index}">Request Quote</button>`;content.appendChild(actions);}});
  const filters=document.getElementById('productFilters'); const search=document.getElementById('productSearch'); const categories=['All',...Array.from(new Set(products.map(productCategory)))];
  if(filters&&!filters.dataset.ready){filters.innerHTML=categories.map((c,i)=>`<button type="button" class="${i===0?'active':''}" data-filter="${c}">${c}</button>`).join('');filters.dataset.ready='true';}
  let activeFilter='All'; const noResults=document.createElement('div'); noResults.className='no-product-results'; noResults.textContent='No products match your search. Try another keyword or category.';
  function applyProductFilters(){const term=String(search?.value||'').trim().toLowerCase();let visibleCount=0;productCards.forEach(card=>{const matchesFilter=activeFilter==='All'||card.dataset.category===activeFilter;const matchesSearch=!term||card.dataset.title.includes(term)||card.dataset.description.includes(term);const visible=matchesFilter&&matchesSearch;card.classList.toggle('hidden-by-filter',!visible);if(visible)visibleCount++;});const grid=document.getElementById('productsGrid');if(grid){if(!visibleCount&&!grid.contains(noResults))grid.appendChild(noResults);if(visibleCount&&grid.contains(noResults))noResults.remove();}}
  filters?.addEventListener('click',event=>{const button=event.target.closest('button[data-filter]'); if(!button)return; activeFilter=button.dataset.filter; filters.querySelectorAll('button').forEach(btn=>btn.classList.toggle('active',btn===button)); applyProductFilters();}); search?.addEventListener('input',applyProductFilters);
  const modal=document.getElementById('productInquiryModal'); const modalImg=document.getElementById('modalProductImage'); const modalTitle=document.getElementById('modalProductTitle'); const modalDesc=document.getElementById('modalProductDescription'); const requestBtn=document.getElementById('modalRequestQuote'); let activeProductTitle='';
  function openProductModal(index){const product=products[index]; if(!product||!modal)return; activeProductTitle=product.title||''; if(modalImg){modalImg.src=product.image||'';modalImg.alt=product.title||'Prefab product';} if(modalTitle)modalTitle.textContent=product.title||''; if(modalDesc)modalDesc.textContent=product.description||''; modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
  function closeProductModal(){if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  document.addEventListener('click',event=>{const viewBtn=event.target.closest('.product-view-btn'); const quoteBtn=event.target.closest('.product-quote-btn'); if(viewBtn)openProductModal(Number(viewBtn.dataset.productIndex)); if(quoteBtn){const product=products[Number(quoteBtn.dataset.productIndex)]; if(quoteSelect&&product)quoteSelect.value=product.title; document.getElementById('quote')?.scrollIntoView({behavior:'smooth'});}});
  document.querySelector('.product-modal-close')?.addEventListener('click',closeProductModal); modal?.addEventListener('click',event=>{if(event.target===modal)closeProductModal();}); document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal?.classList.contains('open'))closeProductModal();}); requestBtn?.addEventListener('click',()=>{if(quoteSelect&&activeProductTitle)quoteSelect.value=activeProductTitle;closeProductModal();document.getElementById('quote')?.scrollIntoView({behavior:'smooth'});});
  const quoteForm=document.getElementById('quoteForm'); if(quoteForm&&!quoteForm.dataset.ready){quoteForm.dataset.ready='true';quoteForm.addEventListener('submit',event=>{event.preventDefault();const form=new FormData(quoteForm);const recipient=contact.formRecipient||contact.email||'mathieukonstructsolutions@gmail.com';const subject=encodeURIComponent(`Quotation Request - ${form.get('productType')||'Prefab Project'}`);const body=encodeURIComponent(`Name: ${form.get('name')||''}\nContact Number: ${form.get('phone')||''}\nEmail: ${form.get('email')||''}\nProduct Type: ${form.get('productType')||''}\nQuantity: ${form.get('quantity')||''}\nProject Location: ${form.get('location')||''}\n\nMessage:\n${form.get('message')||''}`);window.location.href=`mailto:${recipient}?subject=${subject}&body=${body}`;});}
}


function initSafeQualityUpgrades(siteData) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('img').forEach((image) => {
    if (!image.hasAttribute('decoding')) image.setAttribute('decoding', 'async');
    if (!image.closest('.hero-visual') && !image.hasAttribute('loading')) image.setAttribute('loading', 'lazy');
    if (!image.getAttribute('alt')) image.setAttribute('alt', 'Mathieu Konstruct Solutions prefab visual');
    image.addEventListener('error', () => {
      image.classList.add('image-load-error');
      image.setAttribute('alt', `${image.getAttribute('alt') || 'Image'} unavailable`);
    }, { once: true });
  });

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle?.addEventListener('click', () => {
    document.body.classList.toggle('nav-open', navLinks?.classList.contains('open'));
  });
  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => document.body.classList.remove('nav-open'));
  });

  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const menuLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if ('IntersectionObserver' in window && sections.length && menuLinks.length) {
    const activeObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      menuLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0.08, 0.2, 0.4] });
    sections.forEach(section => activeObserver.observe(section));
  }

  const forms = document.querySelectorAll('form');
  forms.forEach((form) => {
    if (!form.querySelector('.form-status')) {
      const status = document.createElement('p');
      status.className = 'form-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.hidden = true;
      form.appendChild(status);
    }

    form.addEventListener('submit', (event) => {
      const status = form.querySelector('.form-status');
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        if (status) {
          status.hidden = false;
          status.classList.add('error');
          status.textContent = 'Please complete the required fields before sending.';
        }
        return;
      }
      const submit = form.querySelector('[type="submit"]');
      if (submit) {
        submit.disabled = true;
        window.setTimeout(() => { submit.disabled = false; }, 1800);
      }
      if (status) {
        status.hidden = false;
        status.classList.remove('error');
        status.textContent = 'Opening your email app with the inquiry details...';
      }
    }, true);
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target || reducedMotion) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', link.getAttribute('href'));
    });
  });

  const externalLinks = document.querySelectorAll('a[target="_blank"]');
  externalLinks.forEach((link) => {
    const rel = new Set(String(link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel', Array.from(rel).join(' '));
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const siteData = window.getSiteData();
  renderSiteContent(siteData);
  initInteractions(siteData);
  initSalesEnhancements(siteData);
  initSafeQualityUpgrades(siteData);
});
