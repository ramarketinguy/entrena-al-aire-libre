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
- **Push desde esta máquina:** el global config de git usa el helper de gh para github.com (cuenta activa que puede NO ser la del repo). Este repo tiene override local: helper `manager` + `credential.useHttpPath=true` + credencial por-repo de `ramarketinguy` en el Credential Manager. `git push` funciona directo desde esta carpeta.
- **Videos:** el video de presentación (`videos/alvaro-v3_comp.mp4`) lleva audio AAC stereo, porque es un talking head con controles. Al recomprimir assets de video usar siempre `-c:a aac` (si no, ffmpeg descarta la pista). Como `/videos/*` se sirve con `Cache-Control: immutable`, cualquier reemplazo necesita **nombre nuevo** (`v4`, `v5`…) para romper la caché.
- **Identidad de git:** repo-local `Ramarketing <dev@ramarketing.uy>` (el global de esta máquina no tiene identidad configurada).

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
- [x] Mancha del hero eliminada (blobs SVG decorativos)
- [x] Push a GitHub y deploy a Vercel verificados en producción
- [ ] Actualizar `META_PIXEL_ID` y `META_CAPI_TOKEN` en Vercel (manual)
- [ ] Generar Test Event Code nuevo en el pixel nuevo (manual)
- [ ] Comprar dominio y actualizar los 5 puntos del README (manual)
- [ ] Verificar dominio en Meta Business Manager (manual)

## Estado (sesión 10/11/2026 — v3)

- [x] Nombre de la página cambiado a "Recupera tu movilidad al aire libre" (title, OG, Twitter, H1). La marca "Entrenáte en Movimiento" se mantiene en el logo, el footer y el JSON-LD.
- [x] Copy reescrito para filtrar calidad: nueva sección "¿Esto es para vos?" (sí / no), hero más directo, objeciones nuevas ("¿No me levanto temprano?", "¿Y si no tengo ganas de ir?") y CTA final sin humo.
- [x] UTMs eliminados del mensaje de WhatsApp (la atribución queda en Pixel + CAPI por `custom_data`)
- [x] Todos los CTA de reserva llevan a `#pricing`; el botón flotante y el del footer siguen yendo directo a WhatsApp
- [x] Modal de reserva nuevo: el plan llega predefinido, se elige lugar → turno → días → objetivo. Para online no se pregunta el lugar y se pregunta cuántas personas se conectan (1/2/3), porque el precio por persona baja ($800 / $500 / $400)
- [x] Eventos nuevos: `BookingStart` y `BookingSelect` (Pixel + CAPI). `Lead` ahora solo se dispara en conversiones reales (envío del modal y botón flotante)
- [x] `api/capi.js`: whitelist de eventos extendida y nuevos campos `booking_*` reenviados
- [x] Tarjetas de planes reordenadas (prueba → 1x → 2x → 3x → online)
- [x] QA visual con Playwright en 1440x900 y 390x844; sin errores de JS
- [x] Verificado en producción: deploy OK, scroll a `#pricing` OK, modal OK, mensaje de WhatsApp OK
- [!] **CAPI roto en producción (manual)**: el relay `/api/capi` responde 502 con `OAuthException 190 — "Application has been deleted"`. El `META_CAPI_TOKEN` de Vercel pertenece a una app de Meta que fue borrada. El Pixel del browser sí funciona (`fbevents.js` y `signals/config/2289502958273608` devuelven 200), pero **no hay Conversions API**: cada evento llega al Pixel y rebota contra Meta por CAPI. Sin CAPI no hay deduplicación ni atribución server-side, y el match de calidad de las campañas vive justamente del lado server.
- [ ] Regenerar `META_CAPI_TOKEN` en Meta Business Manager (System User con permiso de Ads + `ads_read` sobre el pixel `2289502958273608`) y actualizar la env var en Vercel (Production + Preview)
- [ ] Verificar en Events Manager que los eventos nuevos (`BookingStart`, `BookingSelect`) llegan y que `Lead` baja (cambio de señal de optimización: antes disparaba al click, ahora al completar la reserva)

## Estado (sesión 26/10/2026)

- [x] Audio del video de Álvaro restaurado (se había comprimido sin pista de audio) — re-encode desde el master 720x720, H.264 CRF 26 + AAC 96k, publicado como `alvaro-v3_comp.mp4`
- [x] Verificado en producción: el MP4 servido por Vercel tiene stream de audio AAC stereo

## Reglas para la próxima sesión

1. Leer este archivo y el README primero
2. No commitear URLs de webhooks, tokens ni IDs de cuenta
3. El copy va siempre en voseo uruguayo, singular y en femenino
4. No agregar formularios ni captura de datos: la conversión es WhatsApp
5. Revisar cortes de línea en títulos (sin palabras huérfanas)
6. El mensaje de WhatsApp va limpio: los UTMs nunca se escriben en el texto que ve Álvaro
7. `Lead` solo cuando hay conversión real (mensaje enviado). Un click que abre el modal es `BookingStart`
8. El plan de reserva se elige en la tarjeta de precios: en el modal ya viene predefinido y no se vuelve a preguntar
