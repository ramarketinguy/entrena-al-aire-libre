// api/lead.js
// Vercel Serverless Function — Recibe el formulario de lead.
//
// Comportamiento:
//  1. Valida campos y honeypot (los bots reciben un éxito falso)
//  2. Envía el lead al webhook (Google Sheets) y dispara el evento Lead a la
//     API de Conversiones de Meta con user_data (email/phone hasheados)
//  3. Ambos envíos corren en paralelo con tope de ~3s; el front muestra el
//     modal de éxito con eso
//
// Variables de entorno:
//   META_PIXEL_ID, META_CAPI_TOKEN, META_TEST_EVENT_CODE (solo Preview)
//   LEAD_WEBHOOK_URL (opcional) - endpoint que reciba el lead (Zapier, Make, Google Sheets, etc.)

const crypto = require('crypto');

const GRAPH_VERSION = 'v23.0';

// Rate limit best-effort en memoria por instancia. Máx 5 leads por minuto por IP.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60000;
const rateMap = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [ip, arr] of rateMap) {
    const fresh = arr.filter(t => now - t < RATE_WINDOW_MS);
    if (fresh.length === 0) rateMap.delete(ip); else rateMap.set(ip, fresh);
  }
}, RATE_WINDOW_MS).unref();

function isRateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const arr = (rateMap.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  arr.push(now);
  rateMap.set(ip, arr);
  return arr.length > RATE_LIMIT;
}

function sha256(value) {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim().toLowerCase();
  if (!s) return undefined;
  return crypto.createHash('sha256').update(s).digest('hex');
}

function normalizePhone(phone) {
  if (!phone) return undefined;
  const digits = String(phone).replace(/\D/g, '');
  return digits || undefined;
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || undefined;
}

function getCookie(req, name) {
  const cookie = req.headers.cookie;
  if (!cookie) return undefined;
  const match = cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

module.exports = async function handler(req, res) {
  // CORS — solo same-origin (ver api/capi.js para el detalle)
  const origin = req.headers.origin || '';
  let sameOrigin = true;
  if (origin) {
    try {
      sameOrigin = new URL(origin).host === req.headers.host;
    } catch (_) {
      sameOrigin = false;
    }
  }
  if (sameOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  if (!sameOrigin) { res.status(403).json({ error: 'Forbidden' }); return; }
  if (isRateLimited(getClientIp(req))) { res.status(429).json({ error: 'Too many requests' }); return; }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  const {
    name = '',
    email = '',
    phone = '',
    schedule_preference = '',
    park_preference = '',
    // Nuevos campos de calificación
    goal = '',
    physical_condition = '',
    start_when = '',
    event_id,
    event_source_url,
    // honeypot — si viene con valor, es un bot
    company = '',
    // anti-scripted: timestamp en ms cuando el form se pintó
    rendered_at,
    // UTMs y clickIDs capturados en el front
    utm = {}
  } = body;

  // ---------- Honeypot ----------
  if (company && String(company).trim() !== '') {
    // fingimos éxito para no dar señales al bot
    res.status(200).json({ ok: true, tracked: false });
    return;
  }

  // ---------- Time-trap: completar el form en <2s sugiere bot ----------
  // Ya NO descartamos el lead (riesgo de perder personas reales con autofill):
  // lo enviamos igual pero lo marcamos como sospechoso para revisión manual.
  let flagged = false;
  if (rendered_at && Number.isFinite(Number(rendered_at))) {
    const elapsed = Date.now() - Number(rendered_at);
    if (elapsed < 2000) flagged = true;
  }

  // ---------- Validación de campos mínimos ----------
  const errors = {};
  if (!name || String(name).trim().length < 2) errors.name = 'Nombre requerido';
  if (!isValidEmail(email) && !normalizePhone(phone)) {
    errors.contact = 'Debés dejar un email o un teléfono';
  }
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ ok: false, errors });
    return;
  }
  if (!event_id) {
    res.status(400).json({ ok: false, error: 'event_id missing' });
    return;
  }

  // ---------- Meta CAPI — evento Lead con user_data enriquecido ----------
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const TOKEN = process.env.META_CAPI_TOKEN;
  const TEST_CODE = process.env.META_TEST_EVENT_CODE || '';

  const firstName = String(name).trim().split(/\s+/)[0];
  const lastName = String(name).trim().split(/\s+/).slice(1).join(' ');

  const user_data = {
    em: sha256(email),
    ph: sha256(normalizePhone(phone)),
    fn: sha256(firstName),
    ln: lastName ? sha256(lastName) : undefined,
    country: sha256('uy'),
    ct: sha256('montevideo'),
    client_ip_address: getClientIp(req),
    client_user_agent: req.headers['user-agent'],
    fbp: getCookie(req, '_fbp'),
    fbc: getCookie(req, '_fbc')
  };
  Object.keys(user_data).forEach(k => {
    if (user_data[k] === undefined) delete user_data[k];
  });

  const metaPayload = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      event_source_url: event_source_url || req.headers.referer || '',
      action_source: 'website',
      user_data,
      custom_data: Object.assign({
        content_name: 'Formulario clase gratis',
        content_category: 'clase_prueba',
        source_button: 'form_lead',
        schedule_preference: schedule_preference || undefined,
        park_preference: park_preference || undefined,
        goal: goal || undefined,
        physical_condition: physical_condition || undefined,
        start_when: start_when || undefined
      }, utm && typeof utm === 'object' ? utm : {})
    }]
  };
  if (TEST_CODE) metaPayload.test_event_code = TEST_CODE;

  // ---------- Webhook (Google Sheets) + Meta CAPI, en paralelo con tope de tiempo ----------
  // No bloqueamos la respuesta más de ~3s: si algún servicio tarda, se responde
  // igual y el envío termina en background (el resultado queda en los logs).
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  const webhookBody = JSON.stringify({
    received_at: new Date().toISOString(),
    name, email, phone,
    schedule_preference, park_preference,
    goal, physical_condition, start_when,
    flagged,
    utm,
    ip: getClientIp(req),
    user_agent: req.headers['user-agent'],
    referer: req.headers.referer
  });

  const webhookPromise = webhookUrl
    ? fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: webhookBody
      }).then(r => r.text().then(t => {
        if (!r.ok) console.error('[LEAD][WEBHOOK] Error:', r.status, t.slice(0, 200));
        else console.log('[LEAD][WEBHOOK] OK:', r.status);
      })).catch(err => {
        console.error('[LEAD][WEBHOOK] ERROR:', err.message);
      })
    : Promise.resolve();

  if (!webhookUrl) {
    console.error('[LEAD] LEAD_WEBHOOK_URL no configurada: el lead no se guardó en la planilla');
  }

  // ---------- Meta CAPI (en paralelo con el webhook) ----------
  const capiPromise = (PIXEL_ID && TOKEN)
    ? fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaPayload)
      }).then(r => r.json()).then(json => {
        console.log('[LEAD][CAPI] Éxito:', json);
      }).catch(err => {
        console.error('[LEAD][CAPI] Error:', err.message);
      })
    : Promise.resolve();

  // Tope de espera total: 3s. Lo que no llegue, termina en background.
  await Promise.race([
    Promise.all([webhookPromise, capiPromise]),
    new Promise(resolve => setTimeout(resolve, 3000))
  ]);

  console.log('[LEAD] Finalizando función. Enviando OK al cliente.');
  res.status(200).json({
    ok: true,
    event_id,
    tracked: true,
    flagged,
    capi_enabled: Boolean(PIXEL_ID && TOKEN)
  });
};
