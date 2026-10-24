# MEMORIA — Landing Entrenáte en Movimiento

> Archivo sanitizado: este repo es público, así que acá NO se guardan tokens,
> URLs de webhooks, IDs de cuenta publicitaria ni datos de performance.
> Esos valores viven solo en las variables de entorno de Vercel.

## Cliente

- **Marca:** Entrenáte en Movimiento
- **Servicio:** Entrenamientos grupales al aire libre en Montevideo (Parque Rodó, Parque Batlle, Prado) + clases online
- **Público objetivo:** personas mayores de 45 (mayoría mujeres) que quieren mejorar su salud, recuperar movilidad e independencia
- **Tono del copy:** singular y en femenino — el profesor (Álvaro) le habla a la posible alumna
- **Profesor:** Álvaro Gustavo Pérez Rodríguez — ISEF, 43 años exp, IG: @profesor_alvaro_perez
- **WhatsApp:** +598 99 253 103
- **Conversión:** 100% WhatsApp (sin formulario ni captura de datos)
- **Precios presenciales:** $0 prueba / $1.200/mes (1x) / $2.000/mes (2x popular) / $2.700/mes (3x)
- **Clases online:** $800 la sesión de 45-60 min; si se conectan 2 personas a la misma hora $500 c/u; 3 personas $400 c/u (ideal para amigas que entrenan juntas)
- **Horarios:**
  - Parque Batlle: lun, mié y vie — 7:30 y 8:30
  - Prado (frente al Charrúa): mar y jue — 10:00
  - Parque Rodó: lun, mié, jue y vie — 18:15 y 19:15
  - Online: horario a coordinar

## Configuración técnica

- **Stack:** HTML/CSS/JS estático + Vercel Serverless Function (`api/capi.js`)
- **Meta Pixel ID:** se define como env var `META_PIXEL_ID` en Vercel (también hardcoded en el snippet del `<head>` de `index.html`)
- **CAPI:** deduplicación por `event_id` generado en el front; token solo server-side
- **Anti-huérfanas:** `text-wrap: balance/pretty` + script que pega las 2 últimas palabras de cada título (no dejar palabras sueltas en la última línea)

## Estado (sesión 24/10/2026 — v2)

- [x] Pixel nuevo instalado (front + env var por actualizar en Vercel)
- [x] Copy reescrito para público +45, en singular y femenino
- [x] Micaela eliminada; solo Álvaro como profesor
- [x] Horarios actualizados (Batlle 7:30/8:30, Prado 10:00, Rodó 18:15/19:15)
- [x] Plan online agregado con aclaración de grupo de amigas
- [x] H1 con cortes de línea controlados (3 líneas)
- [x] Captura de testimonio acotada en móvil (72vh, se lee sin scroll)
- [x] Formulario eliminado: todos los CTAs van a WhatsApp
- [x] api/lead.js eliminada (no hay más captura de datos ni webhook)
- [x] Fixes de seguridad: CORS same-origin, rate limit, docs sensibles fuera del repo
- [x] Favicon ICO + apple-touch-icon PNG generados; og-image 1200x630 comprimida
- [ ] Actualizar `META_PIXEL_ID` y `META_CAPI_TOKEN` en Vercel (manual)
- [ ] Generar Test Event Code nuevo en el pixel nuevo (manual)
- [ ] Comprar dominio y actualizar los 5 puntos del README (manual)
- [ ] Verificar dominio en Meta Business Manager (manual)

## Reglas para la próxima sesión

1. Leer este archivo y el README primero
2. No commitear URLs de webhooks, tokens ni IDs de cuenta
3. El copy va siempre en voseo uruguayo, singular y en femenino
4. No agregar formularios ni captura de datos: la conversión es WhatsApp
5. Revisar cortes de línea en títulos (sin palabras huérfanas)
