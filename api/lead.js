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
    res.status(200).json({ ok: true, redirect_to: null, tracked: false });
    return;
  }

  // ---------- Time-trap: si completaron el form en <2s, probablemente bot ----------
  if (rendered_at && Number.isFinite(Number(rendered_at))) {
    const elapsed = Date.now() - Number(rendered_at);
    if (elapsed < 2000) {
      res.status(200).json({ ok: true, redirect_to: null, tracked: false });
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

  // ---------- Webhook PRIORITARIO (Google Sheets) ----------
  // Intentamos leer en mayúsculas y minúsculas por las dudas
  const webhookUrl = process.env.LEAD_WEBHOOK_URL || process.env.lead_webhook_url;
  
  console.log('[LEAD] Diagnóstico de variables:', {
    has_webhook: !!webhookUrl,
    env_keys: Object.keys(process.env).filter(k => k.toLowerCase().includes('webhook') || k.toLowerCase().includes('meta'))
  });

  if (webhookUrl) {
    try {
      console.log('[LEAD][WEBHOOK] Enviando a Google Sheets...');
      const whResp = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          received_at: new Date().toISOString(),
          name, email, phone,
          schedule_preference, park_preference,
          utm,
          ip: getClientIp(req),
          user_agent: req.headers['user-agent'],
          referer: req.headers.referer
        })
      });
      const whText = await whResp.text();
      console.log('[LEAD][WEBHOOK] Resultado:', whResp.status, whText);
    } catch (whErr) {
      console.error('[LEAD][WEBHOOK] ERROR CRÍTICO:', whErr.message);
    }
  } else {
    console.error('[LEAD] ERROR: LEAD_WEBHOOK_URL no encontrada en process.env');
  }

  // ---------- Meta CAPI (en paralelo/segundo plano) ----------
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

  // Esperamos un poquito a Meta por cortesía, pero no bloqueamos si el Webhook ya terminó
  await Promise.race([
    capiPromise,
    new Promise(resolve => setTimeout(resolve, 2000))
  ]);

  // ---------- Construir URL de WhatsApp (para el log o fallback si fuera necesario) ----------
  const waNumber = process.env.WHATSAPP_NUMBER || DEFAULT_WHATSAPP;
  const parts = ['Hola! Soy ' + name + '.'];
  const waMessage = encodeURIComponent(parts.join(' '));
  const redirectTo = `https://wa.me/${waNumber}?text=${waMessage}`;

  console.log('[LEAD] Finalizando función. Enviando OK al cliente.');
  res.status(200).json({
    ok: true,
    redirect_to: redirectTo,
    event_id,
    tracked: true,
    capi_enabled: Boolean(PIXEL_ID && TOKEN)
  });
};
