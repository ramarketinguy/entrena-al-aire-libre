# MEMORIA — Landing Entrenáte en Movimiento

> Archivo sanitizado: este repo es público, así que acá NO se guardan tokens,
> URLs de webhooks, IDs de cuenta publicitaria ni datos de performance.
> Esos valores viven solo en las variables de entorno de Vercel.

## Cliente

- **Marca:** Entrenáte en Movimiento
- **Servicio:** Entrenamientos grupales al aire libre en Montevideo (Parque Rodó, Parque Batlle, Prado) + clases online
- **Público objetivo:** personas mayores de 45 años que quieren mejorar su salud, recuperar movilidad e independencia
- **Profesor:** Álvaro Gustavo Pérez Rodríguez — ISEF, 43 años exp, IG: @profesor_alvaro_perez
- **WhatsApp:** +598 99 253 103
- **Precios presenciales:** $0 prueba / $1.200/mes (1x) / $2.000/mes (2x popular) / $2.700/mes (3x)
- **Clases online:** $800 la sesión de 45-60 min; 2 personas conectadas $500 c/u; 3 personas $400 c/u
- **Horarios:**
  - Parque Batlle: lun, mié y vie — 7:30 y 8:30
  - Prado: mar y jue — 10:00
  - Parque Rodó: lun, mié, jue y vie — 18:15 y 19:15
  - Online: horario a coordinar

## Configuración técnica

- **Stack:** HTML/CSS/JS estático + Vercel Serverless Functions (`api/capi.js`, `api/lead.js`)
- **Meta Pixel ID:** se define como env var `META_PIXEL_ID` en Vercel (también hardcoded en el snippet del `<head>` de `index.html`)
- **CAPI:** deduplicación por `event_id` generado en el front; token solo server-side
- **Webhook de leads:** Google Sheets vía Apps Script — URL solo en env var `LEAD_WEBHOOK_URL` (nunca en el repo)

## Estado (sesión 24/10/2026)

- [x] Pixel nuevo instalado (front + env var por actualizar en Vercel)
- [x] Copy reescrito para público +45 (salud, movilidad, independencia)
- [x] Micaela eliminada; solo Álvaro como profesor
- [x] Horarios actualizados (Batlle 7:30/8:30, Prado 10:00, Rodó 18:15/19:15)
- [x] Plan online agregado (pricing + schedule + form + FAQ)
- [x] Fixes de seguridad: CORS same-origin, rate limit, docs sensibles fuera del repo
- [x] Fix time-trap: leads rápidos ya no se descartan, se marcan `flagged`
- [x] UTMs pasan correctamente en `/api/capi` y `/api/lead`
- [x] Favicon ICO + apple-touch-icon PNG generados; og-image comprimida
- [ ] Actualizar `META_PIXEL_ID` y `META_CAPI_TOKEN` en Vercel (manual)
- [ ] Generar Test Event Code nuevo en el pixel nuevo (manual)
- [ ] Comprar dominio y actualizar los 5 puntos del README (manual)
- [ ] Verificar dominio en Meta Business Manager (manual)

## Reglas para la próxima sesión

1. Leer este archivo y el README primero
2. No commitear URLs de webhooks, tokens ni IDs de cuenta
3. El copy va siempre en voseo uruguayo y dirigido a +45
