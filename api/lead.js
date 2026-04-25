// api/lead.js
// Vercel Serverless Function — Recibe el formulario de lead.
//
// Comportamiento:
//  1. Valida campos y honeypot
//  2. Dispara evento Lead a la API de Conversiones de Meta con user_data (email/phone hasheados)
//  3. (Opcional) Reenvía el lead por email via WEBHOOK_URL si está configurado
//  4. Devuelve { ok: true, redirect_to: <whatsapp_url> } para que el front abra WhatsApp
//
// Variables de entorno:
//   META_PIXEL_ID, META_CAPI_TOKEN, META_TEST_EVENT_CODE (hereda de /api/capi)
//   LEAD_WEBHOOK_URL (opcional) - endpoint que reciba el lead (Zapier, Make, Google Sheets, etc.)
//   WHATSAPP_NUMBER (opcional) - por defecto 59895682168

const crypto = require('crypto');

const GRAPH_VERSION = 'v21.0';
const DEFAULT_WHATSAPP = '59895682168';

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
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

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
    res.status(200).json({ ok: true, redirect_to: null });
    return;
  }

  // ---------- Time-trap: si completaron el form en <2s, probablemente bot ----------
  if (rendered_at && Number.isFinite(Number(rendered_at))) {
    const elapsed = Date.now() - Number(rendered_at);
    if (elapsed < 2000) {
      res.status(200).json({ ok: true, redirect_to: null });
      return;
    }
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
        park_preference: park_preference || undefined
      }, utm && typeof utm === 'object' ? utm : {})
    }]
  };
  if (TEST_CODE) metaPayload.test_event_code = TEST_CODE;

  // No bloqueamos la respuesta por el fetch a Meta — respondemos primero y dispatcheamos en paralelo
  const capiPromise = (PIXEL_ID && TOKEN)
    ? fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaPayload)
      }).then(r => r.text()).catch(err => {
        console.error('[LEAD][CAPI] error:', err.message);
        return null;
      })
    : Promise.resolve(null);

  // ---------- Webhook opcional (Zapier / Make / Google Sheets) ----------
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[LEAD] LEAD_WEBHOOK_URL no definida en variables de entorno.');
  }

  const webhookPromise = webhookUrl
    ? fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          received_at: new Date().toISOString(),
          name,
          email,
          phone,
          schedule_preference,
          park_preference,
          utm,
          ip: getClientIp(req),
          user_agent: req.headers['user-agent'],
          referer: req.headers.referer
        })
      }).then(async r => {
        const text = await r.text();
        console.log('[LEAD][WEBHOOK] Respuesta:', r.status, text);
        return { status: r.status, text };
      }).catch(err => {
        console.error('[LEAD][WEBHOOK] error:', err.message);
        return null;
      })
    : Promise.resolve(null);

  // ---------- Construir URL de WhatsApp para redirigir al usuario ----------
  const waNumber = process.env.WHATSAPP_NUMBER || DEFAULT_WHATSAPP;
  const parts = [];
  parts.push('Hola! Soy ' + String(name).trim() + '.');
  parts.push('Quiero reservar mi clase gratuita de prueba.');
  if (schedule_preference) parts.push('Horario preferido: ' + schedule_preference);
  if (park_preference) parts.push('Parque preferido: ' + park_preference);
  if (utm && utm.utm_campaign) parts.push('[campaña: ' + String(utm.utm_campaign).slice(0, 60) + ']');
  const waMessage = encodeURIComponent(parts.join(' '));
  const redirectTo = `https://wa.me/${waNumber}?text=${waMessage}`;

  // Esperamos a CAPI y Webhook con un timeout más generoso (6 segundos)
  // Las funciones de Vercel (Hobby) tienen un timeout de 10s, así que estamos bien.
  try {
    await Promise.race([
      Promise.all([capiPromise, webhookPromise]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 6000))
    ]);
  } catch (err) {
    console.warn('[LEAD] El envío a Meta o Webhook superó los 6s (o falló), procediendo con respuesta al usuario.');
  }

  res.status(200).json({
    ok: true,
    redirect_to: redirectTo,
    event_id
  });
};
