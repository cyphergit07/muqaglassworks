require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';
const adminPassword = process.env.ADMIN_PASSWORD || '';
const sessionSecret = process.env.ADMIN_SESSION_SECRET || '';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || 'site-images';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL and/or SUPABASE_SECRET_KEY in .env');
}
if (!adminPassword || !sessionSecret) {
  console.error('Missing ADMIN_PASSWORD and/or ADMIN_SESSION_SECRET in .env');
}

const supabase = createClient(supabaseUrl || 'https://placeholder.invalid', supabaseKey || 'placeholder', {
  auth: { persistSession: false, autoRefreshToken: false },
});

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PNG, JPG, WEBP and GIF images are allowed.'));
    }
    cb(null, true);
  },
});

const DEFAULT_SITE_CONTENT = {
  brand_name: 'MUQA GLASS WORKS',
  hero_title: 'Premium Glass &\nAluminium Work.\nPerfect Finish.',
  hero_description: 'Shower Glass, Toughened Glass, Aluminium Works, Glass Film, LED Mirror, SS Railing, Skylight and Professional Repair & Installation.',
  services_heading: 'Every Work. Premium Finish.',
  seo_title: 'MUQA Glass Works - Premium Glass & Aluminium Work | Gurugram Delhi Faridabad Sohna Manesar',
  seo_keywords: 'muqa glass works,aluminium works,glass firm,led mirrors,ss railing,toughened glass,skylight,shower glass,repair and installation,premium glass and aluminium works, gurugram, delhi, faridabad, sohna, manesar',
  locations: ['Gurugram', 'Delhi', 'Faridabad', 'Sohna', 'Manesar'],
  stat_customers_value: '5000+',
  stat_customers_label: 'Happy Customers',
  stat_quality_value: '100%',
  stat_quality_label: 'Quality Work',
  stat_service_value: '24x7',
  stat_service_label: 'Service',
  stat_experience_value: '5+ Years',
  stat_experience_label: 'Experience',
  how_it_works: [
    { title: '☰ Choose Service', description: 'Select the service you need' },
    { title: '📏 We Measure & Survey', description: 'Our expert will visit your site' },
    { title: '📄 Exact Quote', description: 'You will get exact fixed quote' },
    { title: '✅ Work Starts', description: 'Work starts after advance paid' },
  ],
  phone_number: '+916398493966',
  whatsapp_number: '916398493966',
  site_visit_price: '₹199',
  site_visit_note: 'Adjusted in final bill',
  booking_title: 'Book Our Service',
  booking_description: "Fill in your details and we'll contact you on WhatsApp.",
  logo_image: 'pic.png',
  hero_background_image: 'background.png',
  booking_locations: ['Gurugram', 'Delhi', 'Sohna', 'Faridabad', 'Manesar', 'Other'],
  booking_services: ['Glass Firm', 'Shower Glass', 'SS Railing', 'Toughened Glass', 'Skylight', 'Aluminium Works', 'LED mirrors', 'Glass Railing', 'Repair & Installation', 'Other'],
  services_db_enabled: true,
};

const DEFAULT_SERVICES = [
  { slug: 'shower-glass', title: 'Shower glass', image: 'shower glass.png', short_description: 'Shower enclosure, doors & partitions.', description: 'Create a clean, spacious, and modern bathroom with custom shower glass solutions. Our shower enclosures are designed to provide an elegant appearance while making efficient use of your bathroom space.', price: '₹380', features: ['Toughened safety glass', 'Frameless and framed designs', 'Shower enclosures and partitions', 'Custom measurements', 'Premium hardware options', 'Clear, frosted, and patterned glass options', 'Professional installation'], sort_order: 0 },
  { slug: 'toughened-glass', title: 'Toughened Glass', image: 'toughened glass.png', short_description: 'Strong glass solutions for homes & offices.', description: 'Toughened glass provides a strong and modern glazing solution for residential and commercial applications. It can be customized for doors, windows, partitions, railings, shower enclosures, and other projects.', price: '₹150', features: ['Safety-focused glass solution', 'Available in different thicknesses', 'Clear, tinted, frosted, and decorative options', 'Suitable for doors and windows', 'Glass partitions and railings', 'Custom sizes and shapes', 'Professional fabrication and installation'], sort_order: 1 },
  { slug: 'aluminium-works', title: 'Aluminium Works', image: 'aluminium works.png', short_description: 'Doors, windows, partitions & custom works.', description: 'Enhance your home or commercial space with durable and stylish aluminium solutions. We provide custom aluminium work designed to suit your space, requirements, and preferred finish.', price: '₹450', features: ['Custom-made aluminium frames and structures', 'Aluminium doors and windows', 'Sliding and folding systems', 'Durable and low-maintenance materials', 'Modern designs and finishes', 'Professional measurement and installation'], sort_order: 2 },
  { slug: 'glass-film', title: 'Glass Film', image: 'glass film.png', short_description: 'Privacy & decorative glass film installation.', description: 'Transform ordinary glass with high-quality decorative, privacy, and solar-control films. Glass films are an excellent way to improve privacy and appearance without replacing your existing glass.', price: '₹40', features: ['Privacy and frosted films', 'Decorative designs', 'Solar-control films', 'Custom patterns and finishes', 'Helps reduce glare and sunlight', 'Suitable for homes, offices, and commercial spaces', 'Professional application'], sort_order: 3 },
  { slug: 'led-mirrors', title: 'LED Mirror', image: 'led mirrors.png', short_description: 'Stylish LED mirrors for your modern spaces.', description: 'Add a modern and luxurious touch to your bathroom, bedroom, dressing area, or commercial space with custom LED mirrors. Designed for both functionality and aesthetics.', price: '₹350', features: ['Modern LED illumination', 'Custom sizes and shapes', 'Backlit and front-lit options', 'Touch or sensor controls', 'Anti-fog options available', 'Custom frame and finish options', 'Professional installation'], sort_order: 4 },
  { slug: 'ss-railing', title: 'SS railing', image: 'ss railing.png', short_description: 'Stainless-steel railing installation & service.', description: 'Give your staircase, balcony, or terrace a contemporary appearance with stainless-steel railing solutions. Our SS railings combine durability, safety, and modern design.', price: '₹950', features: ['Stainless-steel construction', 'Glass and non-glass railing options', 'Balcony and staircase applications', 'Modern and custom designs', 'Corrosion-resistant finishes', 'Custom measurements', 'Professional installation'], sort_order: 5 },
  { slug: 'skylight', title: 'Skylight', image: 'skylight.png', short_description: 'Premium skylight for natural light & ventilation.', description: 'Bring more natural light into your interior spaces with custom skylight solutions. Our skylights are designed to enhance the appearance of a space while making better use of available daylight.', price: '₹450', features: ['Custom-designed skylights', 'Natural daylight enhancement', 'Glass and aluminium solutions', 'Residential and commercial applications', 'Modern architectural designs', 'Weather-resistant installation solutions', 'Professional measurement and installation'], sort_order: 6 },
  { slug: 'repair', title: 'Repair & Installtion', image: 'repair.png', short_description: 'Expert repair & installation for all glass & aluminium works.', description: 'Keep your glass, aluminium, and related installations in excellent condition with professional repair and installation services. We handle new installations, replacements, adjustments, and repair requirements.', price: null, features: ['Professional workmanship', 'Custom solutions', 'Quality materials', 'Careful measurement', 'Reliable installation', 'Residential and commercial services'], sort_order: 7 },
];

const allowedContentKeys = new Set(Object.keys(DEFAULT_SITE_CONTENT));

function sign(value) {
  return crypto.createHmac('sha256', sessionSecret).update(value).digest('hex');
}

function createSession() {
  const payload = Buffer.from(JSON.stringify({ sub: 'admin', exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifySession(token) {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !sessionSecret) return false;
  const expected = sign(payload);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.sub === 'admin' && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

function auth(req, res, next) {
  if (!verifySession(req.headers.cookie?.match(/(?:^|;\s*)admin_session=([^;]+)/)?.[1])) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function setSessionCookie(res, value) {
  const parts = [
    `admin_session=${value}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=86400',
  ];
  if (isProduction) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res) {
  const parts = ['admin_session=', 'HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=0'];
  if (isProduction) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function publicImagePath(value) {
  return String(value || '').trim();
}

function parseServiceBody(body) {
  const features = Array.isArray(body.features)
    ? body.features.map(v => String(v).trim()).filter(Boolean)
    : String(body.features || '').split(/\r?\n/).map(v => v.trim()).filter(Boolean);

  const slug = String(body.slug || '').trim().toLowerCase();
  const title = String(body.title || '').trim();
  if (!slug || !title) throw new Error('Slug and title are required.');

  return {
    slug,
    title,
    image: publicImagePath(body.image),
    short_description: String(body.short_description || '').trim(),
    description: String(body.description || '').trim(),
    price: String(body.price || '').trim() || null,
    features,
    active: body.active !== false,
  };
}

async function ensureDefaultData() {
  const { data: existingContent, error: contentError } = await supabase
    .from('site_content')
    .select('key');
  if (contentError) throw contentError;

  const existingKeys = new Set((existingContent || []).map(row => row.key));
  const missingContent = Object.entries(DEFAULT_SITE_CONTENT)
    .filter(([key]) => !existingKeys.has(key))
    .map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));

  if (missingContent.length) {
    const { error } = await supabase.from('site_content').insert(missingContent);
    if (error) throw error;
  }

  const { data: existingServices, error: serviceError } = await supabase
    .from('services')
    .select('slug');
  if (serviceError) throw serviceError;

  const existingSlugs = new Set((existingServices || []).map(row => row.slug));
  const missingServices = DEFAULT_SERVICES
    .filter(service => !existingSlugs.has(service.slug))
    .map(service => ({ ...service, features: service.features }));

  if (missingServices.length) {
    const { error } = await supabase.from('services').insert(missingServices);
    if (error) throw error;
  }

  console.log('Default MUQA website data verified in Supabase.');
}

async function ensureStorageBucket() {
  const { data } = await supabase.storage.getBucket(storageBucket);
  if (data) return;
  const { error } = await supabase.storage.createBucket(storageBucket, {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    fileSizeLimit: '6MB',
  });
  if (error && !/already exists|duplicate/i.test(error.message || '')) throw error;
  console.log(`Supabase Storage bucket ready: ${storageBucket}`);
}

async function verifySupabase() {
  if (!supabaseUrl || !supabaseKey) return;
  const { error } = await supabase.from('site_content').select('key').limit(1);
  if (error) {
    console.error('Supabase database check failed:', error.message);
    return;
  }
  try {
    await ensureStorageBucket();
    await ensureDefaultData();
  } catch (error) {
    console.error('Supabase setup check failed:', error.message);
    console.error('Run supabase-setup.sql in the Supabase SQL Editor if the tables or bucket do not exist.');
  }
}

app.get('/api/health', async (_req, res) => {
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ ok: false, error: 'Supabase environment variables are missing.' });
  const { error } = await supabase.from('site_content').select('key').limit(1);
  if (error) return res.status(500).json({ ok: false, error: error.message, code: error.code });
  res.json({ ok: true, storage_bucket: storageBucket });
});

app.get('/api/admin/status', (_req, res) => {
  res.json({ configured: Boolean(adminPassword && sessionSecret && supabaseUrl && supabaseKey), storageBucket });
});

app.post('/api/admin/login', (req, res) => {
  const password = String(req.body?.password || '');
  if (!adminPassword || !sessionSecret) return res.status(500).json({ error: 'Admin authentication is not configured on the server.' });
  if (!password || password !== adminPassword) return res.status(401).json({ error: 'Invalid admin password.' });
  setSessionCookie(res, createSession());
  res.json({ ok: true });
});

app.post('/api/admin/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.post('/api/admin/upload-image', auth, (req, res) => {
  uploadImage.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Image upload failed.' });
    if (!req.file) return res.status(400).json({ error: 'Choose an image file.' });

    try {
      const ext = req.file.mimetype === 'image/png' ? 'png' : req.file.mimetype === 'image/webp' ? 'webp' : req.file.mimetype === 'image/gif' ? 'gif' : 'jpg';
      const base = path.basename(req.file.originalname || 'image', path.extname(req.file.originalname || '')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'image';
      const objectPath = `site/${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${base}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(storageBucket).upload(objectPath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from(storageBucket).getPublicUrl(objectPath);
      res.status(201).json({ ok: true, path: publicData.publicUrl, objectPath, filename: req.file.originalname });
    } catch (error) {
      console.error('Supabase Storage upload error:', error);
      res.status(500).json({ error: error.message || 'Image upload failed.' });
    }
  });
});

app.get('/api/content', async (_req, res) => {
  try {
    const [{ data: contentRows, error: contentError }, { data: services, error: servicesError }] = await Promise.all([
      supabase.from('site_content').select('key,value'),
      supabase.from('services').select('*').eq('active', true).order('sort_order', { ascending: true }).order('id', { ascending: true }),
    ]);
    if (contentError) throw contentError;
    if (servicesError) throw servicesError;

    const content = {};
    for (const row of contentRows || []) content[row.key] = row.value;
    res.json({ content, services: services || [], services_db_enabled: content.services_db_enabled !== false });
  } catch (error) {
    console.error('GET /api/content:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

app.get('/api/admin/content', auth, async (_req, res) => {
  try {
    const [{ data: contentRows, error: contentError }, { data: serviceRows, error: serviceError }] = await Promise.all([
      supabase.from('site_content').select('*'),
      supabase.from('services').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }),
    ]);
    if (contentError) throw contentError;
    if (serviceError) throw serviceError;
    const content = {};
    for (const row of contentRows || []) content[row.key] = row.value;
    res.json({ content, services: serviceRows || [] });
  } catch (error) {
    console.error('GET /api/admin/content:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

app.put('/api/admin/content', auth, async (req, res) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const rows = Object.entries(payload)
      .filter(([key]) => allowedContentKeys.has(key))
      .map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    if (!rows.length) return res.status(400).json({ error: 'No valid content fields supplied.' });

    const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' });
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('PUT /api/admin/content:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

app.post('/api/admin/services', auth, async (req, res) => {
  try {
    const service = parseServiceBody(req.body || {});
    const { data: maxRows, error: maxError } = await supabase.from('services').select('sort_order').order('sort_order', { ascending: false }).limit(1);
    if (maxError) throw maxError;
    service.sort_order = Number(maxRows?.[0]?.sort_order ?? -1) + 1;
    const { data, error } = await supabase.from('services').insert(service).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('POST /api/admin/services:', error);
    res.status(400).json({ error: error.message || 'Could not create service.' });
  }
});

app.put('/api/admin/services/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid service ID.' });
    const service = parseServiceBody(req.body || {});
    const { data, error } = await supabase.from('services').update(service).eq('id', id).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('PUT /api/admin/services/:id:', error);
    res.status(400).json({ error: error.message || 'Could not update service.' });
  }
});

app.delete('/api/admin/services/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid service ID.' });
    const { data, error } = await supabase.from('services').delete().eq('id', id).select('id').single();
    if (error) throw error;
    res.json({ ok: true, id: data.id });
  } catch (error) {
    console.error('DELETE /api/admin/services/:id:', error);
    res.status(400).json({ error: error.message || 'Could not delete service.' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const whatsapp = String(req.body?.whatsapp || '').replace(/\D/g, '').slice(0, 10);
    const location = String(req.body?.location || '').trim();
    const service = String(req.body?.service || '').trim();
    if (!name || !/^[0-9]{10}$/.test(whatsapp) || !location || !service) return res.status(400).json({ error: 'Please provide name, valid WhatsApp number, location and service.' });
    const { data, error } = await supabase.from('bookings').insert({ name, whatsapp, location, service }).select('id,name,whatsapp,location,service,created_at').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('POST /api/bookings:', error);
    res.status(500).json({ error: error.message || 'Booking could not be saved.' });
  }
});

app.get('/api/admin/bookings', auth, async (_req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').select('id,name,whatsapp,location,service,created_at').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('GET /api/admin/bookings:', error);
    res.status(500).json({ error: error.message || 'Could not load bookings.' });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ error: err.message || 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log(`MUQA server running on ${PORT}`);
  verifySupabase().catch(error => console.error('Supabase verification error:', error.message));
});
