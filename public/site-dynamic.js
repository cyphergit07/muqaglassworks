'use strict';

const STATIC_SERVICE_SLUGS = [
  'shower-glass',
  'toughened-glass',
  'aluminium-works',
  'glass-film',
  'led-mirrors',
  'ss-railing',
  'skylight',
  'repair'
];

function textValue(value) {
  return value == null ? '' : String(value);
}

function assignStaticServiceSlugs() {
  const cards = [...document.querySelectorAll('.services .card')];
  cards.forEach((card, index) => {
    if (!card.dataset.serviceSlug && STATIC_SERVICE_SLUGS[index]) {
      card.dataset.serviceSlug = STATIC_SERVICE_SLUGS[index];
    }
  });
}

function getCard(slug) {
  return [...document.querySelectorAll('.services .card')]
    .find(card => card.dataset.serviceSlug === slug) || null;
}

function updateServiceCard(card, service) {
  if (!card) return;

  card.dataset.serviceSlug = service.slug;
  card.style.display = service.active === false ? 'none' : '';
  card.onclick = () => openService(service.slug);

  const image = card.querySelector('img');
  if (image) {
    if (service.image) image.src = service.image;
    image.alt = service.title || '';
  }

  const title = card.querySelector('.card-body h3');
  if (title) title.textContent = service.title || '';

  const description = card.querySelector('.card-body p');
  if (description) description.textContent = service.short_description || '';

  const body = card.querySelector('.card-body');
  const oldPrice = body?.querySelector('.price');
  if (oldPrice) oldPrice.remove();

  if (body && service.price) {
    const price = document.createElement('div');
    price.className = 'price';
    price.append(document.createTextNode(service.price + ' '));
    const small = document.createElement('small');
    small.textContent = 'Starting';
    price.appendChild(small);
    const quote = body.querySelector('.quote');
    if (quote?.parentElement) quote.parentElement.before(price);
    else body.appendChild(price);
  }

  const quote = card.querySelector('.quote');
  if (quote) quote.textContent = 'Get Quote →';
}

function createServiceCard(service) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.serviceSlug = service.slug;
  card.onclick = () => openService(service.slug);

  const image = document.createElement('img');
  image.src = service.image || '';
  image.alt = service.title || '';

  const body = document.createElement('div');
  body.className = 'card-body';

  const title = document.createElement('h3');
  title.textContent = service.title || '';

  const description = document.createElement('p');
  description.textContent = service.short_description || '';

  body.append(title, description);

  if (service.price) {
    const price = document.createElement('div');
    price.className = 'price';
    price.append(document.createTextNode(service.price + ' '));
    const small = document.createElement('small');
    small.textContent = 'Starting';
    price.appendChild(small);
    body.appendChild(price);
  }

  const anchor = document.createElement('a');
  anchor.href = '#';
  anchor.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    openBooking();
  });

  const quote = document.createElement('div');
  quote.className = 'quote';
  quote.textContent = 'Get Quote →';
  anchor.appendChild(quote);
  body.appendChild(anchor);

  card.append(image, body);
  return card;
}

function applyHeroTitle(value) {
  const h1 = document.querySelector('.hero h1');
  const title = textValue(value).trim();
  if (!h1 || !title) return;

  const lines = title.split(/\r?\n/).filter(Boolean);
  const parts = lines.length > 1
    ? lines
    : title.split(/\.\s+/).filter(Boolean).map((part, index, all) =>
        part + (index < all.length - 1 ? '.' : '')
      );

  if (!parts.length) return;
  const highlighted = parts.pop();
  h1.textContent = '';

  parts.forEach((part, index) => {
    if (index) h1.appendChild(document.createTextNode(' '));
    h1.appendChild(document.createTextNode(part));
    h1.appendChild(document.createElement('br'));
  });

  const gold = document.createElement('span');
  gold.className = 'gold';
  gold.textContent = highlighted;
  h1.appendChild(gold);
}

function applyDatabaseServices(dbServices, servicesDbEnabled) {
  if (!Array.isArray(dbServices)) return;

  assignStaticServiceSlugs();
  const box = document.querySelector('.services');
  if (!box) return;

  // Never blank the original homepage during first-time/failed database setup.
  if (!servicesDbEnabled && dbServices.length === 0) return;

  const bySlug = new Map(dbServices.map(service => [service.slug, service]));

  for (const card of [...box.querySelectorAll('.card')]) {
    const slug = card.dataset.serviceSlug;
    if (!slug) continue;
    const service = bySlug.get(slug);
    if (service) updateServiceCard(card, service);
    else if (servicesDbEnabled) card.remove();
  }

  if (servicesDbEnabled) {
    for (const service of dbServices) {
      if (!getCard(service.slug)) {
        box.appendChild(createServiceCard(service));
      }
    }
  }

  // Keep the existing modal code backed by the current PostgreSQL services.
  const nextServices = {};
  for (const service of dbServices) {
    if (service.active !== false) nextServices[service.slug] = service;
  }
  services = nextServices;
}

function applyDatabaseContent(data) {
  if (!data || typeof data !== 'object') return;
  const content = data.content && typeof data.content === 'object' ? data.content : {};

  if (content.seo_title) document.title = textValue(content.seo_title);

  const keywords = document.querySelector('meta[name="keywords"]');
  if (keywords && content.seo_keywords) keywords.content = textValue(content.seo_keywords);

  const brand = document.querySelector('.logo span a');
  if (brand && content.brand_name) brand.textContent = textValue(content.brand_name);

  const logo = document.querySelector('.logo img');
  if (logo && content.logo_image) logo.src = textValue(content.logo_image);

  const hero = document.querySelector('.hero');
  if (hero && content.hero_background_image) {
    const image = textValue(content.hero_background_image);
    hero.style.backgroundImage = 'linear-gradient(90deg, rgba(0, 0, 0, 0.95) 45%, rgba(0, 0, 0, 0.3)), url(\"' + image + '\")';
  }

  if (content.hero_title) applyHeroTitle(content.hero_title);

  const heroDescription = document.querySelector('.hero p');
  if (heroDescription && content.hero_description) {
    heroDescription.textContent = textValue(content.hero_description);
  }

  const servicesHeading = document.querySelector('.sec h2');
  if (servicesHeading && content.services_heading) {
    servicesHeading.textContent = textValue(content.services_heading);
  }

  const locations = document.querySelector('.loc');
  if (locations && Array.isArray(content.locations) && content.locations.length) {
    locations.replaceChildren(...content.locations.map(location => {
      const span = document.createElement('span');
      span.textContent = '📍 ' + textValue(location);
      return span;
    }));
  }

  const stats = [
    ['stat_customers_value', 'stat_customers_label', '👥'],
    ['stat_quality_value', 'stat_quality_label', '🛡️'],
    ['stat_service_value', 'stat_service_label', '🕒'],
    ['stat_experience_value', 'stat_experience_label', '🏆']
  ];

  stats.forEach(([valueKey, labelKey, icon], index) => {
    if (!content[valueKey] && !content[labelKey]) return;
    const element = document.querySelector('.stats .stat:nth-child(' + (index + 1) + ') span');
    if (!element) return;
    element.replaceChildren();
    const strong = document.createElement('b');
    strong.textContent = icon + ' ' + textValue(content[valueKey] || '');
    element.appendChild(strong);
    element.appendChild(document.createTextNode(' ' + textValue(content[labelKey] || '')));
  });

  const how = document.querySelector('.how');
  if (how && Array.isArray(content.how_it_works) && content.how_it_works.length) {
    how.replaceChildren(...content.how_it_works.map(item => {
      const div = document.createElement('div');
      div.appendChild(document.createElement('br'));
      const strong = document.createElement('b');
      strong.textContent = textValue(item.title);
      div.append(strong, document.createElement('br'));
      div.appendChild(document.createTextNode(textValue(item.description)));
      return div;
    }));
  }

  const phone = textValue(content.phone_number);
  const whatsapp = textValue(content.whatsapp_number);
  window.MUQA_WHATSAPP = whatsapp;
  const siteVisitPrice = textValue(content.site_visit_price);
  const siteVisitNote = textValue(content.site_visit_note);

  document.querySelectorAll('a[href^="tel:"]').forEach(a => { if (phone) a.href = 'tel:' + phone; });
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a => {
    if (whatsapp) {
      const current = a.href.split('?')[0];
      a.href = current.replace(/https:\/\/wa\.me\/[^/]+/, 'https://wa.me/' + whatsapp);
    }
  });
  document.querySelectorAll('.btn-wa, .f-green').forEach(a => {
    if (a.classList.contains('f-green')) {
      const display = phone.replace(/^\+91/, '+91 ');
      a.innerHTML = '<i class="fab fa-whatsapp"></i> WhatsApp<br>' + textValue(display);
    }
  });
  document.querySelectorAll('.f-gold').forEach(a => {
    const display = phone.replace(/^\+91/, '+91 ');
    a.innerHTML = '<i class="fas fa-phone-alt"></i> Call Now<br>' + textValue(display);
  });
  document.querySelectorAll('.modal-book-btn').forEach(btn => { if (siteVisitPrice) btn.dataset.siteVisitPrice = siteVisitPrice; });
  const bookingTitle = document.querySelector('.booking-box h2');
  if (bookingTitle && content.booking_title) bookingTitle.textContent = textValue(content.booking_title);
  const bookingDescription = document.querySelector('.booking-box p');
  if (bookingDescription && content.booking_description) bookingDescription.textContent = textValue(content.booking_description);
  const visitButtons = [...document.querySelectorAll('.hero-actions .btn-dark[onclick*="openBooking"], .footer-bar .f-dark')];
  visitButtons.forEach(btn => {
    if (siteVisitPrice) btn.innerHTML = '📅 Site Visit ' + textValue(siteVisitPrice) + (siteVisitNote ? '<br><small style="font-weight:400;font-size:9px">' + textValue(siteVisitNote) + '</small>' : '');
  });

  const locationSelect = document.getElementById('location');
  if (locationSelect && Array.isArray(content.booking_locations) && content.booking_locations.length) {
    const current = locationSelect.value;
    locationSelect.replaceChildren(new Option('Select Location', ''));
    content.booking_locations.forEach(location => locationSelect.add(new Option(textValue(location), textValue(location))));
    if ([...locationSelect.options].some(o => o.value === current)) locationSelect.value = current;
  }

  const bookingServiceSelect = document.getElementById('service');
  if (bookingServiceSelect && Array.isArray(content.booking_services) && content.booking_services.length) {
    const current = bookingServiceSelect.value;
    bookingServiceSelect.replaceChildren(new Option('Select Service', ''));
    content.booking_services.forEach(service => bookingServiceSelect.add(new Option(textValue(service), textValue(service))));
    if ([...bookingServiceSelect.options].some(o => o.value === current)) bookingServiceSelect.value = current;
  }

  applyDatabaseServices(data.services, data.services_db_enabled === true);

  const serviceSelect = document.getElementById('service');
  if (serviceSelect && Array.isArray(data.services)) {
    const existing = new Set([...serviceSelect.options].map(option => option.value));
    for (const service of data.services) {
      if (service.active !== false && service.title && !existing.has(service.title)) {
        serviceSelect.add(new Option(service.title, service.title));
      }
    }
  }
}

async function loadDatabaseContent() {
  try {
    const response = await fetch('/api/content', { cache: 'no-store' });
    if (!response.ok) throw new Error('Database content unavailable');
    applyDatabaseContent(await response.json());
  } catch (error) {
    // Keep all original HTML visible when the API/database is unavailable.
    console.warn('MUQA dynamic content unavailable; original homepage retained:', error);
  }
}

loadDatabaseContent();
