/**
 * AutoMart — Core App Module
 * Shared utilities, Firebase data layer, car card rendering
 */

import {
  db,
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp
} from './firebase-config.js';

/* ═══════════════════════════════════════════════════════════
   AUTO-DETECT BASE URL
   Works on localhost, GitHub Pages /repo-name/, or any subdir.
   No manual config needed — reads from the script's own URL.
═══════════════════════════════════════════════════════════ */
const _p    = new URL(import.meta.url).pathname.split('/');
const _ai   = _p.indexOf('assets');
const _base = _ai > 1 ? _p.slice(0, _ai).join('/') : '';

/* ═══════════════════════════════════════════════════════════
   SITE CONFIG  (baseUrl is auto-detected above)
═══════════════════════════════════════════════════════════ */
export const SITE = {
  name:        'AutoMart',
  tagline:     "Find Your Perfect Second-Hand Car",
  phone:       '+91 1800-123-4567',
  email:       'support@automart.in',
  address:     'Mumbai, Maharashtra, India',
  whatsapp:    '919876543210',
  currency:    '₹',
  baseUrl:     _base,   // auto-detected: '' on root, '/repo-name' on GitHub Pages
  primaryColor:'#C0392B',
};

/* ═══════════════════════════════════════════════════════════
   NAVIGATION — shared header & footer injector
═══════════════════════════════════════════════════════════ */
export function injectHeader() {
  const nav = document.getElementById('site-header');
  if (!nav) return;

  const base = SITE.baseUrl;

  nav.innerHTML = `
  <!-- TOP BAR -->
  <div class="top-bar">
    <div class="container">
      <div><span>${SITE.phone}</span> &nbsp;|&nbsp; <a href="mailto:${SITE.email}">${SITE.email}</a></div>
      <div style="display:flex;gap:16px;">
        <a href="${base}/pages/about.html">About</a>
        <a href="${base}/pages/contact.html">Contact</a>
        <a href="${base}/pages/faq.html">FAQ</a>
      </div>
    </div>
  </div>

  <!-- MAIN HEADER -->
  <header class="site-header" id="mainHeader">
    <div class="container">
      <div class="header-main">
        <a href="${base}/index.html" class="site-logo">
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none" style="flex-shrink:0">
            <rect width="36" height="36" rx="8" fill="#C0392B"/>
            <path d="M6 22l4-8h16l4 8" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <circle cx="11" cy="24" r="2.5" fill="white"/>
            <circle cx="25" cy="24" r="2.5" fill="white"/>
            <path d="M8 18h20" stroke="white" stroke-width="1.5"/>
          </svg>
          <span class="logo-text">${SITE.name}</span>
        </a>

        <div class="vehicle-types">
          <button class="vehicle-type-btn active" title="Cars">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h10l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>
            Cars
          </button>
          <button class="vehicle-type-btn" title="Bikes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M9 17l3-7 4 4-5 3"/></svg>
            Bikes
          </button>
          <button class="vehicle-type-btn" title="Electric">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Electric
          </button>
        </div>

        <div class="header-actions">
          <button class="btn-search-header" id="searchToggle" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <a href="${base}/pages/sell.html" class="btn-sell-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Sell Your Car
          </a>
          <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Menu">
            <svg id="hamburgerIcon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <svg id="closeMenuIcon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Header Search Bar -->
    <div id="headerSearch" style="display:none;background:#f4f6f8;border-top:1px solid #dde1e7;padding:12px 0;">
      <div class="container">
        <div style="display:flex;gap:8px;">
          <input type="search" id="headerSearchInput" placeholder="Search cars, brands, models..." style="flex:1;padding:11px 14px;border:1px solid #dde1e7;border-radius:6px;font-size:15px;outline:none;min-width:0">
          <button onclick="doSearch()" style="padding:11px 20px;background:#C0392B;color:white;border:none;border-radius:6px;font-weight:700;cursor:pointer;white-space:nowrap">Search</button>
          <button id="closeSearch" style="padding:8px;background:none;border:none;cursor:pointer;flex-shrink:0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- NAVIGATION -->
  <nav class="site-nav" id="siteNav" style="position:relative">
    <div class="container" style="position:static">
      <ul class="nav-list" id="navList">
        <li><a href="${base}/index.html">Home</a></li>
        <li class="menu-has-children">
          <a href="${base}/pages/cars.html">Used Cars <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></a>
          <ul class="dropdown-menu">
            <li><a href="${base}/pages/cars.html?fuel=Petrol">Petrol Cars</a></li>
            <li><a href="${base}/pages/cars.html?fuel=Diesel">Diesel Cars</a></li>
            <li><a href="${base}/pages/cars.html?fuel=Electric">Electric Cars</a></li>
            <li><a href="${base}/pages/cars.html?fuel=CNG">CNG Cars</a></li>
            <li><a href="${base}/pages/cars.html">All Used Cars</a></li>
          </ul>
        </li>
        <li><a href="${base}/pages/sell.html" class="highlight">Sell a Car</a></li>
        <li><a href="${base}/pages/loan.html">Car Loan &amp; EMI</a></li>
        <li><a href="${base}/pages/valuation.html">Car Valuation</a></li>
        <li><a href="${base}/pages/about.html">About Us</a></li>
        <li><a href="${base}/pages/contact.html">Contact</a></li>
      </ul>
    </div>
  </nav>

  <!-- Mobile Sell Bar -->
  <div class="mobile-sell-bar" style="display:none">
    <a href="${base}/pages/cars.html">🚗 Browse Cars</a>
    <a href="${base}/pages/sell.html">💰 Sell Your Car</a>
  </div>
  `;

  initHeaderJS();
}

function initHeaderJS() {
  // Search toggle
  const st = document.getElementById('searchToggle');
  const hs = document.getElementById('headerSearch');
  const cs = document.getElementById('closeSearch');
  if (st) st.addEventListener('click', () => { hs.style.display = hs.style.display === 'none' ? 'block' : 'none'; if (hs.style.display !== 'none') document.getElementById('headerSearchInput')?.focus(); });
  if (cs) cs.addEventListener('click', () => { hs.style.display = 'none'; });

  // Mobile menu
  const toggle = document.getElementById('mobileMenuToggle');
  const nav = document.getElementById('navList');
  const ham = document.getElementById('hamburgerIcon');
  const close = document.getElementById('closeMenuIcon');
  let isOpen = false;

  function checkMobile() {
    if (window.innerWidth <= 768) {
      toggle.style.display = 'flex';
      if (!isOpen) nav.classList.remove('open');
    } else {
      toggle.style.display = 'none';
      nav.classList.remove('open');
      document.body.classList.remove('nav-open');
      isOpen = false;
      ham.style.display = ''; close.style.display = 'none';
    }
    document.querySelector('.mobile-sell-bar').style.display = window.innerWidth <= 768 ? 'flex' : 'none';
  }

  if (toggle) toggle.addEventListener('click', e => {
    e.stopPropagation();
    isOpen = !isOpen;
    nav.classList.toggle('open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    ham.style.display  = isOpen ? 'none' : '';
    close.style.display = isOpen ? '' : 'none';
    // Ensure first item has enough padding-top to clear any UI behind it
    if (isOpen && nav) {
      nav.style.paddingTop = '0';
    }
  });

  document.addEventListener('click', e => {
    if (isOpen && !e.target.closest('#navList') && !e.target.closest('#mobileMenuToggle')) {
      isOpen = false; nav.classList.remove('open'); document.body.classList.remove('nav-open');
      ham.style.display = ''; close.style.display = 'none';
    }
  });

  // Mobile accordion
  document.querySelectorAll('.menu-has-children > a').forEach(a => {
    a.addEventListener('click', e => {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      const li = a.parentElement;
      const dm = li.querySelector('.dropdown-menu');
      const open = li.classList.contains('menu-open');
      document.querySelectorAll('.menu-has-children.menu-open').forEach(el => { el.classList.remove('menu-open'); el.querySelector('.dropdown-menu')?.style && (el.querySelector('.dropdown-menu').style.display = 'none'); });
      if (!open) { li.classList.add('menu-open'); if (dm) dm.style.display = 'block'; }
    });
  });

  window.addEventListener('resize', checkMobile);
  checkMobile();

  // Sticky shadow
  window.addEventListener('scroll', () => {
    document.getElementById('mainHeader')?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

export function injectFooter() {
  const f = document.getElementById('site-footer');
  if (!f) return;
  const base = SITE.baseUrl;
  f.innerHTML = `
  <!-- Quick Links Grid -->
  <section class="quick-links-section section-padding-sm">
    <div class="container">
      <div class="quick-links-grid">
        ${[
          [base+'/pages/cars.html','M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h10l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2M7.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M16.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5','Buy Cars'],
          [base+'/pages/sell.html','M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6','Sell Cars'],
          [base+'/pages/loan.html','M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z','Car Loan'],
          [base+'/pages/valuation.html','M22 12h-4l-3 9L9 3l-3 9H2','Car Valuation'],
          [base+'/pages/loan.html','M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z','EMI Calculator'],
          [base+'/pages/about.html','M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z','About Us'],
          [base+'/pages/contact.html','M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.55 2h3a2 2 0 0 1 2 1.72','Contact'],
          [base+'/pages/faq.html','M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77','FAQ'],
        ].map(([url, path, label]) => `
          <a href="${url}" class="quick-link-item">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="${path}"/></svg>
            <span>${label}</span>
          </a>`).join('')}
      </div>
    </div>
  </section>

  <!-- Main Footer -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="logo-text">${SITE.name}</span>
          <p>Your trusted marketplace for buying and selling pre-owned cars. Verified listings, best prices, no middlemen.</p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href="#" class="social-link" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>
            <a href="#" class="social-link" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg></a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <div class="footer-links">
            <a href="${base}/pages/cars.html">Browse Used Cars</a>
            <a href="${base}/pages/sell.html">Sell Your Car</a>
            <a href="${base}/pages/loan.html">Car Loan &amp; EMI</a>
            <a href="${base}/pages/valuation.html">Free Car Valuation</a>
            <a href="${base}/pages/about.html">About Us</a>
            <a href="${base}/pages/faq.html">FAQ</a>
          </div>
        </div>
        <div class="footer-col" id="footerBrands">
          <h4>Top Brands</h4>
          <div class="footer-links" id="footerBrandLinks">
            ${['Maruti Suzuki','Hyundai','Tata Motors','Honda','Toyota','Ford','Volkswagen','Kia'].map(b=>`<a href="${base}/pages/cars.html?brand=${encodeURIComponent(b)}">${b}</a>`).join('')}
          </div>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <div class="footer-links">
            <a href="${base}/pages/about.html">About Us</a>
            <a href="${base}/pages/contact.html">Contact Us</a>
            <a href="${base}/pages/faq.html">FAQ</a>
            <a href="${base}/pages/privacy.html">Privacy Policy</a>
            <a href="${base}/pages/terms.html">Terms of Service</a>
          </div>
          <div style="margin-top:16px">
            <a href="tel:${SITE.phone}" style="color:rgba(255,255,255,.55);font-size:13px;display:block;margin-bottom:6px">📞 ${SITE.phone}</a>
            <a href="mailto:${SITE.email}" style="color:rgba(255,255,255,.55);font-size:13px;display:block">✉ ${SITE.email}</a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© ${new Date().getFullYear()} ${SITE.name}. All Rights Reserved.</p>
        <div class="footer-bottom-links">
          <a href="${base}/pages/privacy.html">Privacy Policy</a>
          <a href="${base}/pages/terms.html">Terms</a>
        </div>
      </div>
    </div>
  </footer>
  `;
}

/* ═══════════════════════════════════════════════════════════
   CAR DATA LAYER
═══════════════════════════════════════════════════════════ */

/** Fetch all available cars */
export async function getCars(filters = {}) {
  try {
    let q = query(collection(db, 'cars'), where('status', '==', 'available'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    let cars = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Client-side filtering
    if (filters.brand)    cars = cars.filter(c => c.brand?.toLowerCase().includes(filters.brand.toLowerCase()));
    if (filters.fuel)     cars = cars.filter(c => c.fuelType?.toLowerCase() === filters.fuel.toLowerCase());
    if (filters.minPrice) cars = cars.filter(c => parseFloat(c.price) >= parseFloat(filters.minPrice));
    if (filters.maxPrice) cars = cars.filter(c => parseFloat(c.price) <= parseFloat(filters.maxPrice));
    if (filters.minYear)  cars = cars.filter(c => parseInt(c.year)   >= parseInt(filters.minYear));
    if (filters.maxKm)    cars = cars.filter(c => parseInt(c.km)     <= parseInt(filters.maxKm));
    if (filters.trans)    cars = cars.filter(c => c.transmission?.toLowerCase() === filters.trans.toLowerCase());
    if (filters.search)   {
      const s = filters.search.toLowerCase();
      cars = cars.filter(c => `${c.title} ${c.brand} ${c.model} ${c.location}`.toLowerCase().includes(s));
    }
    if (filters.sort) {
      if (filters.sort === 'price_low')  cars.sort((a,b) => parseFloat(a.price)  - parseFloat(b.price));
      if (filters.sort === 'price_high') cars.sort((a,b) => parseFloat(b.price)  - parseFloat(a.price));
      if (filters.sort === 'year_new')   cars.sort((a,b) => parseInt(b.year)     - parseInt(a.year));
      if (filters.sort === 'km_low')     cars.sort((a,b) => parseInt(a.km)       - parseInt(b.km));
    }
    return cars;
  } catch(e) {
    console.error('getCars error:', e);
    return getSampleCars();
  }
}

/** Fetch single car by ID */
export async function getCarById(id) {
  try {
    const snap = await getDoc(doc(db, 'cars', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  } catch(e) {
    console.error('getCarById error:', e);
    return null;
  }
}

/** Fetch featured cars for homepage */
export async function getFeaturedCars(n = 8) {
  try {
    const q = query(collection(db,'cars'), where('featured','==',true), where('status','==','available'), orderBy('createdAt','desc'), limit(n));
    const snap = await getDocs(q);
    if (snap.empty) return getCars({ sort: 'date' }).then(cars => cars.slice(0, n));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    return getSampleCars().slice(0, n);
  }
}

/** Fetch collections */
export async function getCollections() {
  try {
    const snap = await getDocs(collection(db, 'collections'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { return []; }
}

/** Submit sell/contact enquiry */
export async function submitEnquiry(data) {
  try {
    await addDoc(collection(db,'enquiries'), { ...data, createdAt: serverTimestamp() });
    return true;
  } catch(e) {
    console.error('submitEnquiry:', e);
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════
   CAR CARD RENDERER
═══════════════════════════════════════════════════════════ */
export function renderCarCard(car) {
  const base = SITE.baseUrl;
  const thumb = car.thumbnail || car.images?.[0] || `${base}/assets/images/car-placeholder.svg`;
  const price = car.price ? `${SITE.currency} ${parseFloat(car.price).toLocaleString('en-IN', {minimumFractionDigits:2,maximumFractionDigits:2})} L` : 'Price on Request';

  // Get saved wishlist
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('automart_wishlist') || '[]'); } catch(e){}
  const isSaved = saved.includes(car.id);

  return `
  <div class="car-card" data-id="${car.id}">
    <div class="car-card-image">
      <a href="${base}/pages/car-detail.html?id=${car.id}">
        <img src="${thumb}" alt="${escHtml(car.title || `${car.year} ${car.brand} ${car.model}`)}"
             loading="lazy" onerror="this.src='${base}/assets/images/car-placeholder.svg'">
      </a>
      <div class="car-card-actions">
        <button class="car-action-btn wishlist-btn ${isSaved?'saved':''}" data-id="${car.id}" aria-label="Save">
          <svg viewBox="0 0 24 24" fill="${isSaved?'#C0392B':'none'}" stroke="${isSaved?'#C0392B':'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button class="car-action-btn share-btn" data-url="${base}/pages/car-detail.html?id=${car.id}" data-title="${escHtml(car.title||'')}" aria-label="Share">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </div>
      ${car.featured ? '<span class="car-badge">⭐ Featured</span>' : ''}
      ${car.images?.length > 1 ? `<div class="photo-count">📷 ${car.images.length}</div>` : ''}
    </div>
    <div class="car-card-body">
      <h3 class="car-name"><a href="${base}/pages/car-detail.html?id=${car.id}">${escHtml(car.title || `${car.year||''} ${car.brand||''} ${car.model||''}`)}</a></h3>
      ${car.location ? `<div class="car-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${escHtml(car.location)}</div>` : ''}
      <div class="car-specs">
        ${car.year ?         `<div class="spec-item"><span class="spec-val">${car.year}</span><span>Year</span></div>` : ''}
        ${car.km ?           `<div class="spec-item"><span class="spec-val">${fmtKm(car.km)}</span><span>Driven</span></div>` : ''}
        ${car.fuelType ?     `<div class="spec-item"><span class="spec-val">${car.fuelType}</span><span>Fuel</span></div>` : ''}
        ${car.transmission ? `<div class="spec-item"><span class="spec-val">${car.transmission}</span><span>Trans.</span></div>` : ''}
      </div>
      <div class="car-price-row">
        <div class="car-price">${price}<div class="price-note">*Negotiable</div></div>
      </div>
      <a href="${base}/pages/car-detail.html?id=${car.id}" class="btn-contact">View Details &amp; Contact</a>
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
export function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function fmtKm(km) {
  if (!km) return '—';
  return parseInt(km).toLocaleString('en-IN') + ' km';
}

export function fmtPrice(p) {
  if (!p) return 'Price on Request';
  return `${SITE.currency} ${parseFloat(p).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})} L`;
}

export function getUrlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

export function showToast(msg, type = 'success') {
  const colors = { success:{bg:'#f0fdf4',b:'#bbf7d0',c:'#16a34a'}, error:{bg:'#fef2f2',b:'#fecaca',c:'#dc2626'}, info:{bg:'#eff6ff',b:'#bfdbfe',c:'#2563eb'} };
  const col = colors[type] || colors.info;
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:20px;right:16px;left:16px;max-width:340px;margin-left:auto;padding:13px 18px;background:${col.bg};border:1px solid ${col.b};color:${col.c};border-radius:10px;font-weight:600;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.14);opacity:0;transform:translateY(8px);transition:all .28s ease`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateY(0)'; });
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateY(8px)'; setTimeout(()=>t.remove(),300); }, 3500);
}

export function initWishlist() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.wishlist-btn');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    const id = btn.dataset.id;
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('automart_wishlist')||'[]'); } catch(e){}
    const idx = saved.indexOf(id);
    const svg = btn.querySelector('svg');
    if (idx === -1) {
      saved.push(id);
      btn.classList.add('saved');
      if(svg){svg.setAttribute('fill','#C0392B');svg.setAttribute('stroke','#C0392B');}
      showToast('Car saved to wishlist ❤️', 'success');
    } else {
      saved.splice(idx, 1);
      btn.classList.remove('saved');
      if(svg){svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');}
      showToast('Removed from wishlist', 'info');
    }
    try { localStorage.setItem('automart_wishlist', JSON.stringify(saved)); } catch(e){}
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('.share-btn');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    const url = btn.dataset.url || window.location.href;
    const title = btn.dataset.title || document.title;
    if (navigator.share) navigator.share({ title, url }).catch(()=>{});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => showToast('🔗 Link copied!','success'));
  });
}

// Back to top
export function initBackToTop() {
  const btn = document.createElement('button');
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label','Back to top');
  btn.style.cssText = 'position:fixed;bottom:20px;left:16px;width:42px;height:42px;background:var(--color-primary);color:white;border:none;border-radius:50%;font-size:20px;font-weight:700;cursor:pointer;z-index:998;opacity:0;pointer-events:none;transition:opacity .3s;box-shadow:0 4px 14px rgba(192,57,43,.45)';
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.style.opacity = window.scrollY > 400 ? '1' : '0';
    btn.style.pointerEvents = window.scrollY > 400 ? 'auto' : 'none';
  }, {passive:true});
  btn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
}

/** Touch swipe + mouse drag for horizontal car carousels */
export function initCarousels() {
  document.querySelectorAll('.cars-row').forEach(row => {
    // --- Mouse drag (desktop) ---
    let isDown = false, startX = 0, scrollLeft = 0;
    row.style.cursor = 'grab';
    row.addEventListener('mousedown', e => {
      isDown = true;
      row.style.cursor = 'grabbing';
      startX = e.pageX - row.offsetLeft;
      scrollLeft = row.scrollLeft;
      e.preventDefault();
    });
    row.addEventListener('mouseleave', () => { isDown = false; row.style.cursor = 'grab'; });
    row.addEventListener('mouseup',    () => { isDown = false; row.style.cursor = 'grab'; });
    row.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - row.offsetLeft;
      const walk = (x - startX) * 1.5;
      row.scrollLeft = scrollLeft - walk;
    });

    // --- Touch swipe (mobile) ---
    let touchStartX = 0, touchScrollLeft = 0;
    row.addEventListener('touchstart', e => {
      touchStartX    = e.touches[0].clientX;
      touchScrollLeft = row.scrollLeft;
    }, { passive: true });
    row.addEventListener('touchmove', e => {
      const dx = touchStartX - e.touches[0].clientX;
      row.scrollLeft = touchScrollLeft + dx;
    }, { passive: true });
  });
}

// Global search redirect
window.doSearch = function() {
  const q = document.getElementById('headerSearchInput')?.value?.trim();
  if (q) window.location.href = `${SITE.baseUrl}/pages/cars.html?search=${encodeURIComponent(q)}`;
};

/* ═══════════════════════════════════════════════════════════
   SAMPLE / FALLBACK CARS (shown when Firebase not configured)
═══════════════════════════════════════════════════════════ */
export function getSampleCars() {
  return [
    { id:'s1', title:'2020 Maruti Suzuki Swift VXI', brand:'Maruti Suzuki', model:'Swift', year:2020, km:32000, fuelType:'Petrol', transmission:'Manual', price:'5.50', location:'Mumbai', status:'available', featured:true, thumbnail:'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=280&fit=crop', owner:'1st Owner' },
    { id:'s2', title:'2019 Hyundai Creta SX 1.6', brand:'Hyundai', model:'Creta', year:2019, km:48000, fuelType:'Diesel', transmission:'Automatic', price:'11.50', location:'Delhi', status:'available', featured:true, thumbnail:'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=280&fit=crop', owner:'1st Owner' },
    { id:'s3', title:'2021 Tata Nexon EV Max', brand:'Tata', model:'Nexon EV', year:2021, km:22000, fuelType:'Electric', transmission:'Automatic', price:'14.90', location:'Bangalore', status:'available', featured:false, thumbnail:'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=280&fit=crop', owner:'1st Owner' },
    { id:'s4', title:'2018 Honda City ZX CVT', brand:'Honda', model:'City', year:2018, km:62000, fuelType:'Petrol', transmission:'Automatic', price:'8.25', location:'Pune', status:'available', featured:true, thumbnail:'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=280&fit=crop', owner:'2nd Owner' },
    { id:'s5', title:'2017 Toyota Fortuner 2.8 4x4', brand:'Toyota', model:'Fortuner', year:2017, km:75000, fuelType:'Diesel', transmission:'Automatic', price:'22.00', location:'Chennai', status:'available', featured:false, thumbnail:'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=280&fit=crop', owner:'1st Owner' },
    { id:'s6', title:'2022 Kia Seltos HTX Plus', brand:'Kia', model:'Seltos', year:2022, km:15000, fuelType:'Petrol', transmission:'Manual', price:'13.75', location:'Hyderabad', status:'available', featured:true, thumbnail:'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=280&fit=crop', owner:'1st Owner' },
    { id:'s7', title:'2019 Ford EcoSport Titanium', brand:'Ford', model:'EcoSport', year:2019, km:41000, fuelType:'Petrol', transmission:'Manual', price:'7.80', location:'Mumbai', status:'available', featured:false, thumbnail:'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400&h=280&fit=crop', owner:'2nd Owner' },
    { id:'s8', title:'2020 Volkswagen Polo Highline', brand:'Volkswagen', model:'Polo', year:2020, km:28000, fuelType:'Petrol', transmission:'Manual', price:'6.90', location:'Kolkata', status:'available', featured:false, thumbnail:'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&h=280&fit=crop', owner:'1st Owner' },
  ];
}
