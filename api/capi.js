// api/capi.js
// Vercel Serverless Function — Meta Conversions API (CAPI)
//
// Recibe eventos desde el browser y los reenvía a la API de Conversiones de Meta
// con el mismo event_id que se usó en el Pixel client-side para deduplicar.
//
// Variables de entorno requeridas (configurar en Vercel):
//   META_PIXEL_ID           — ID del Pixel/Dataset
//   META_CAPI_TOKEN         — System User token (Sensitive)
//   META_TEST_EVENT_CODE    — solo en Preview, vacío en Production
//
// Body esperado del cliente (POST JSON):
//   {
//     event_name: "Lead" | "ViewContent" | "PageView",
//     event_id:   string (UUID/slug generado en el front),
//     event_source_url: string (window.location.href),
//     custom_data: object (value, currency, content_name, source_button, etc.),
//     user_data:   object opcional (email, phone, fn, ln, ct, st, zp, country) - se hashean server-side
//   }

const crypto = require('crypto');

const GRAPH_VERSION = 'v21.0';

// ---------- Utils ----------

function sha256(value) {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim().toLowerCase();
  if (!s) return undefined;
  return crypto.createHash('sha256').update(s).digest('hex');
}

function sha256Raw(value) {
  // Para campos que NO deben lowercase (external_id por ejemplo si es un id interno)
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  return crypto.createHash('sha256').update(s).digest('hex');
}

function normalizePhone(phone) {
  if (!phone) return undefined;
  // solo dígitos, sin +, sin espacios, sin guiones
  const digits = String(phone).replace(/\D/g, '');
  return digits || undefined;
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  const xri = req.headers['x-real-ip'];
  if (xri) return String(xri).trim();
  return (req.socket && req.socket.remoteAddress) || undefined;
}

function getCookie(req, name) {
  const cookie = req.headers.cookie;
  if (!cookie) return undefined;
  const match = cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function safeNumber(n) {
  if (n === undefined || n === null || n === '') return undefined;
  const v = Number(n);
  return Number.isFinite(v) ? v : undefined;
}

// ---------- Handler ----------

module.exports = async function handler(req, res) {
  // CORS — permitir same-origin. Ajustar si la landing corre en otro dominio.
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '600');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const PIXEL_ID = process.env.META_PIXEL_ID;
  const TOKEN = process.env.META_CAPI_TOKEN;
  const TEST_CODE = process.env.META_TEST_EVENT_CODE || '';

  if (!PIXEL_ID || !TOKEN) {
    console.error('[CAPI] Missing env vars META_PIXEL_ID or META_CAPI_TOKEN');
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  // Parse body (Vercel suele parsear JSON automáticamente, pero por seguridad)
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  const {
    event_name,
    event_id,
    event_source_url,
    custom_data = {},
    user_data: providedUserData = {},
    action_source = 'website'
  } = body;

  if (!event_name || !event_id) {
    res.status(400).json({ error: 'event_name and event_id are required' });
    return;
  }

  // Whitelist de eventos válidos para evitar abuse
  const ALLOWED = new Set([
    'PageView',
    'ViewContent',
    'Lead'
  ]);
  if (!ALLOWED.has(event_name)) {
    res.status(400).json({ error: 'Unsupported event_name' });
    return;
  }

  // ---------- Construir user_data (hasheado donde corresponde) ----------
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'];
  const fbp = getCookie(req, '_fbp') || providedUserData.fbp;
  const fbc = getCookie(req, '_fbc') || providedUserData.fbc;

  const user_data = {
    client_ip_address: clientIp,
    client_user_agent: userAgent,
    fbp,
    fbc,
    em: sha256(providedUserData.email),
    ph: sha256(normalizePhone(providedUserData.phone)),
    fn: sha256(providedUserData.first_name),
    ln: sha256(providedUserData.last_name),
    ct: sha256(providedUserData.city),
    st: sha256(providedUserData.state),
    zp: sha256(providedUserData.zip),
    country: sha256(providedUserData.country || 'uy'),
    external_id: sha256Raw(providedUserData.external_id)
  };

  // Limpieza: remover undefined para no enviar keys vacías
  Object.keys(user_data).forEach(k => {
    if (user_data[k] === undefined) delete user_data[k];
  });

  // ---------- Construir custom_data ----------
  const cd = {};
  if (custom_data.value !== undefined) cd.value = safeNumber(custom_data.value);
  if (custom_data.currency) cd.currency = String(custom_data.currency).toUpperCase();
  if (custom_data.content_name) cd.content_name = String(custom_data.content_name);
  if (custom_data.content_category) cd.content_category = String(custom_data.content_category);
  if (custom_data.content_ids) cd.content_ids = custom_data.content_ids;
  if (custom_data.content_type) cd.content_type = String(custom_data.content_type);
  // Campos propios (no estándar) se mandan dentro de custom_data igual
  if (custom_data.source_button) cd.source_button = String(custom_data.source_button);

  // ---------- Payload final ----------
  const eventTime = Math.floor(Date.now() / 1000);

  const payload = {
    data: [
      {
        event_name,
        event_time: eventTime,
        event_id, // clave de deduplicación con el Pixel
        event_source_url: event_source_url || req.headers.referer || '',
        action_source,
        user_data,
        custom_data: cd
      }
    ]
  };

  if (TEST_CODE) {
    payload.test_event_code = TEST_CODE;
  }

  // ---------- Envío a Meta ----------
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await upstream.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch (_) { parsed = { raw: text }; }

    if (!upstream.ok) {
      console.error('[CAPI] Meta error:', upstream.status, parsed);
      res.status(502).json({ error: 'Upstream error', status: upstream.status, details: parsed });
      return;
    }

    res.status(200).json({
      ok: true,
      event_name,
      event_id,
      meta: parsed
    });
  } catch (err) {
    console.error('[CAPI] Network error:', err);
    res.status(500).json({ error: 'Network error', message: err.message });
  }
};
