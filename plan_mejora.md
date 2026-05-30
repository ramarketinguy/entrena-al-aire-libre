# Plan de Mejora: Landing "Entrenáte en Movimiento"

Plan ejecutable por fases para llevar la landing de un estado funcional a uno optimizado para conversión, con tracking completo (Meta Pixel + API de Conversiones) y mejoras técnicas/UX priorizadas por impacto de negocio.

**Cliente:** Micaela Bianchi + Álvaro Pérez (entrenamientos grupales al aire libre, Montevideo)
**Agencia:** Ramarketing
**Stack objetivo:** HTML/CSS/JS + Vercel (hosting + serverless para CAPI)

---

## Datos de configuración

### Meta (Pixel + CAPI)
- **Pixel ID:** `1283219893317159`
- **CAPI Access Token:** almacenado como env var `META_CAPI_TOKEN` en Vercel (nunca en el repo ni en el front)
- **Dataset ID:** _pendiente confirmar en Events Manager_ (usualmente = Pixel ID)
- **Test Event Code:** _pendiente generar en Events Manager > Test Events_
- **Dominio verificado:** _pendiente verificar en Business Manager_
- **Eventos estándar a trackear:**
  - `PageView` (automático vía Pixel)
  - `ViewContent` (scroll >50% en secciones clave: Horarios, Precios)
  - `Contact` (click en cualquier botón de WhatsApp)
  - `Lead` (envío de formulario alternativo)
  - `Schedule` (click en "Reservar clase gratis")

### Contacto
- **WhatsApp:** +598 97 922 856
- **Formas de pago actuales:** efectivo y transferencia

---

## Fase 1 — Fix de contenido (prioridad máxima)

**Objetivo:** eliminar errores de texto que degradan la percepción de profesionalismo antes de invertir en mejoras visuales.
**Tiempo estimado:** 30 minutos.

### Tareas
1. Corregir typos e idiomas mezclados en `index.html`:
   - Línea 902: "te motivasi" → "te motiva"
   - Línea 927: "Comunidad y此伴" → "Comunidad y Compañerismo"
   - Línea 928: "personas que partagent" → "personas que comparten"
   - Línea 1055: "10 años working específicamente" → "10 años trabajando específicamente"
   - Línea 1082: "Pesas russe" → "Pesas rusas (kettlebells)"
   - Línea 1150: "¿Ready para empezar?" → "¿Listo para empezar?"
   - Línea 1002: "conocé el método" → "Conocé el método" (capitalización)
2. Revisar consistencia de voseo uruguayo en todo el copy.
3. Reemplazar testimonio genérico ("Participante satisfecho") por nombres reales + foto (solicitar a la clienta).
4. Validar precios con Micaela/Álvaro (pesos uruguayos, confirmar vigencia).

### Criterio de éxito
- Lectura completa del texto sin encontrar errores de idioma ni typos.
- Testimonio con atribución real.

---

## Fase 2 — Tracking (Pixel + CAPI)

**Objetivo:** capturar todos los eventos relevantes con máxima match quality para optimizar campañas Meta Ads.
**Tiempo estimado:** 3-4 horas.

### 2.1 Meta Pixel (client-side)
1. Insertar snippet base del Pixel en `<head>` con ID `1283219893317159`.
2. Disparar eventos custom en:
   - Click en `.whatsapp-btn` (header) → `Contact`
   - Click en `.btn-primary` con texto "Reservar" → `Schedule`
   - Click en cualquier CTA de plan (pricing) → `Lead` con `content_name` = plan elegido
   - Scroll 50% y 75% → `ViewContent`
3. Enriquecer eventos con `event_id` único (UUID v4) para deduplicación con CAPI.

### 2.2 API de Conversiones (server-side, Vercel)
1. Crear `/api/capi.js` (serverless function) que:
   - Reciba POST desde el front con `{ event_name, event_id, user_data, custom_data }`
   - Hashee `em`, `ph`, `fn`, `ln` con SHA-256 antes de enviar
   - Agregue `client_ip_address`, `client_user_agent`, `fbp`, `fbc` automáticamente
   - Haga request a `https://graph.facebook.com/v21.0/{PIXEL_ID}/events?access_token={TOKEN}`
   - Maneje `test_event_code` según env var (solo en staging)
2. Variables de entorno en Vercel:
   - `META_PIXEL_ID` = `1283219893317159`
   - `META_CAPI_TOKEN` = token (marcado como Sensitive)
   - `META_TEST_EVENT_CODE` = solo en Preview, no en Production
3. Front dispara **ambos** eventos (Pixel + fetch a `/api/capi`) con el mismo `event_id`.

### 2.3 Validación
1. Instalar extensión Meta Pixel Helper → verificar eventos en el navegador.
2. Events Manager > Test Events con `META_TEST_EVENT_CODE` activo → verificar deduplicación Pixel + CAPI.
3. Events Manager > Overview tras 24h → confirmar "Event Match Quality" en verde (mínimo 7.0).

### Criterio de éxito
- Los 5 eventos (`PageView`, `ViewContent`, `Contact`, `Lead`, `Schedule`) aparecen en Events Manager.
- Match Quality ≥ 7.0 en todos los eventos.
- Deduplicación >80% (Pixel y CAPI reportando el mismo evento).

---

## Fase 3 — SEO técnico

**Objetivo:** posicionar localmente en Montevideo para búsquedas como "entrenamiento al aire libre montevideo", "gimnasio parque rodó", etc.
**Tiempo estimado:** 2 horas.

### Tareas
1. **Meta tags**:
   - Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
   - Twitter Cards (`twitter:card`, `twitter:image`)
   - `canonical` apuntando al dominio final
2. **Schema.org JSON-LD** en `<head>`:
   - Tipo `LocalBusiness` → `SportsActivityLocation`
   - Campos: `name`, `address`, `geo`, `openingHoursSpecification`, `priceRange`, `telephone`, `url`
   - Tipo `Event` para cada horario recurrente (opcional pero alto impacto)
3. **Archivos**:
   - `favicon.ico` + `apple-touch-icon.png` (192x192 y 512x512)
   - `robots.txt` permisivo con link a sitemap
   - `sitemap.xml` (single page por ahora)
   - `manifest.webmanifest` (PWA básica)
4. **Mejoras on-page**:
   - Headings `h2`/`h3` con keywords ("entrenamiento grupal Montevideo", "clases Parque Rodó")
   - `alt` en todas las imágenes cuando se agreguen
   - `aria-label` en botones sin texto visible (ej: íconos)

### Criterio de éxito
- Lighthouse SEO score ≥ 95
- Rich Results Test de Google valida LocalBusiness
- Facebook Sharing Debugger renderiza correctamente la OG card

---

## Fase 4 — Formulario alternativo a WhatsApp

**Objetivo:** capturar leads que no quieren escribir primero por WhatsApp.
**Tiempo estimado:** 2 horas.

### Tareas
1. Agregar formulario corto en sección CTA final:
   - Campos: nombre, teléfono, email, horario preferido (dropdown)
   - Validación client-side mínima
   - Mensaje de éxito + redirect a WhatsApp con mensaje pre-llenado
2. Backend:
   - Opción A (simple): Google Forms embebido estilizado
   - Opción B (recomendada): `/api/lead.js` en Vercel que envíe a:
     - Email a ramarketing.uy@gmail.com (usar Resend o similar)
     - Evento `Lead` a CAPI con datos hasheados (email, phone)
3. Integrar con tracking de Fase 2 (disparar `Lead` al submit exitoso).

### Criterio de éxito
- Submit del form dispara evento `Lead` en Events Manager.
- Email llega a la agencia con los datos del lead.
- UX: mensaje de confirmación claro + opción de seguir a WhatsApp.

---

## Fase 5 — Refactor estructural

**Objetivo:** separar código para mantenibilidad y performance (cacheo, minificación).
**Tiempo estimado:** 3 horas.

### Tareas
1. **Extraer CSS** de `<style>` inline a `/css/style.css` (solo mantener CSS crítico above-the-fold inline).
2. **Extraer JS** a `/js/main.js` + `/js/tracking.js`.
3. **Organizar assets**:
   - `/img/` para fotografías (formato WebP con fallback JPG)
   - `/img/icons/` para SVGs
4. **Reemplazar emojis de íconos** (🌳, 💪, 🎯, etc.) por SVGs inline o sprite SVG.
5. **Solicitar a la clienta fotos reales** de clases (parque, grupo, equipamiento) — mínimo 10 fotos horizontales en buena calidad. **No usar IA ni stock**.
6. Implementar `<picture>` con `loading="lazy"` para todas las imágenes fuera del viewport inicial.

### Criterio de éxito
- `index.html` < 15KB
- CSS externo cacheable con `Cache-Control: max-age=31536000`
- Lighthouse Performance ≥ 90 en mobile

---

## Fase 6 — Mejoras UX

**Objetivo:** aumentar tiempo en página y conversión con interacciones pulidas (sin excesos).
**Tiempo estimado:** 3 horas.

### Tareas
1. **Reveal on scroll** con `IntersectionObserver` (fade-in + slide-up sutil, 300ms).
2. **Accordion en sección de objeciones** (FAQ) — reduce scroll y mejora engagement.
3. **Micro-interacciones**:
   - Hover en pricing cards con escala 1.02
   - Pulse sutil en botón WhatsApp fijo móvil
4. **Botón WhatsApp flotante** (bottom-right) visible en scroll, solo mobile.
5. **Header con scroll state** real (actualmente el JS de `index.html:1189` no hace nada útil, ambos estados son idénticos).
6. **Menú mobile** simple (hamburger) con links internos a cada sección.

### Criterio de éxito
- Lighthouse UX/Accessibility ≥ 95
- Tiempo en página promedio aumenta vs baseline pre-mejoras

---

## Fase 7 — Polish premium (opcional)

**Objetivo:** elevar percepción visual solo si las fases anteriores demostraron buen funnel.
**Tiempo estimado:** 4 horas.

### Tareas
1. **Tipografía fluida** con `clamp()` en todos los headings.
2. **Paleta refinada** (HSL, ajuste de contraste WCAG AAA).
3. **Sección "Cómo funciona"** con 3 pasos visuales (Contacto → Clase de prueba → Inicio).
4. **Galería** con fotos reales (tras Fase 5).
5. **Mapa estilizado** (NO Google Maps embebido — usa SVG de Montevideo con pins en los 3 parques, performance > interactividad).
6. **Modo oscuro** solo si hay demanda real del cliente. No es prioridad.

### Descartado del plan original
- **Parallax en hero**: baja performance en mobile, no suma conversión.
- **Glassmorphism agresivo**: ya se usa sutilmente; más exageración distrae.
- **Imágenes generadas por IA**: degradan credibilidad. Solo fotos reales.

---

## Orden de ejecución recomendado

| # | Fase | Tiempo | Impacto en conversión | Impacto en percepción |
|---|------|--------|------------------------|-----------------------|
| 1 | Fix de contenido | 30min | Alto | Muy alto |
| 2 | Tracking Pixel+CAPI | 3-4h | Muy alto (medición) | Nulo |
| 3 | SEO técnico | 2h | Alto (orgánico) | Nulo |
| 4 | Formulario lead | 2h | Alto | Medio |
| 5 | Refactor + fotos reales | 3h | Medio | Alto |
| 6 | UX polish | 3h | Medio | Alto |
| 7 | Premium polish | 4h | Bajo | Muy alto |

**Total estimado:** ~17-18 horas distribuidas.

---

## Checklist de ejecución

### Fase 1
- [x] Typo "motivasi" → "motiva"
- [x] "Comunidad y此伴" → "Comunidad y Compañerismo"
- [x] "partagent" → "comparten"
- [x] "working específicamente" → "trabajando específicamente"
- [x] "Pesas russe" → "Pesas rusas (kettlebells)"
- [x] "¿Ready para empezar?" → "¿Listo para empezar?"
- [x] Capitalización "Conocé el método"
- [ ] Testimonio real con nombre + foto (pendiente: requiere material de la clienta)

### Fase 2
- [x] Pixel base en `<head>` (Pixel ID 1283219893317159 con PageView + eventID)
- [x] Evento `Contact` en botones WhatsApp (header + footer)
- [x] Evento `Schedule` en CTAs de reserva (hero + pricing free + CTA final)
- [x] Evento `Lead` en CTAs de pricing (1x/2x/3x con value + currency UYU)
- [x] Evento `ViewContent` por scroll (50% y 75%)
- [x] Event delegation + eventID único por disparo (listo para deduplicar con CAPI)
- [x] `/api/capi.js` creado (SHA-256 hashing, whitelist de eventos, test_event_code condicional)
- [x] `window.__capiEnabled` activado en el front — todo click replica al server
- [x] `package.json`, `vercel.json`, `.gitignore`, `.env.example` listos
- [ ] Env vars `META_PIXEL_ID`, `META_CAPI_TOKEN`, `META_TEST_EVENT_CODE` configuradas en Vercel **(manual)**
- [ ] Deploy a Vercel **(manual)**
- [ ] Deduplicación verificada con Pixel Helper **(post-deploy)**
- [ ] Match Quality ≥ 7.0 en Events Manager **(post-deploy)**
- [ ] Dataset ID confirmado **(manual)**
- [ ] Dominio verificado en Business Manager **(requiere dominio y DNS)**

### Fase 3
- [x] OG + Twitter tags
- [x] Canonical (`https://entrenateenmovimiento.uy/` — ajustar cuando haya dominio final)
- [x] Schema LocalBusiness + Service + FAQPage (JSON-LD)
- [x] robots.txt + sitemap.xml
- [x] Meta tags geo, theme-color, keywords
- [ ] Favicon set completo (requiere assets reales)
- [ ] Lighthouse SEO ≥ 95 (medir post-deploy)

### Fase 4
- [x] Formulario en sección `#reservar` (antes de CTA final)
- [x] `/api/lead.js` con validación + honeypot + time-trap
- [x] CAPI server-side desde /api/lead (Lead con user_data hasheado SHA-256)
- [x] Webhook opcional (`LEAD_WEBHOOK_URL`) para Zapier/Make/Sheets
- [x] Redirect automático a WhatsApp con mensaje prearmado post-submit
- [x] Validación UX (errores inline + estado success/error)

### Fase 5
- [ ] CSS extraído (opcional, requiere build step)
- [ ] JS extraído (opcional, requiere build step)
- [ ] Fotos reales recibidas de clienta
- [ ] WebP + lazy loading (requiere fotos primero)
- [ ] Emojis reemplazados por SVG (opcional; los emojis tienen mejor soporte cross-platform)

### Fase 6 — UX/CRO completa
- [x] Reveal on scroll (IntersectionObserver)
- [x] FAQ accordion (click + keyboard, aria-expanded)
- [x] WhatsApp flotante mobile + desktop con pulso
- [x] Sticky CTA mobile con safe-area-inset
- [x] Urgency bar arriba del header
- [x] Exit intent modal (desktop: mouseleave top / mobile: scroll up brusco)
- [x] Prefill desde querystring
- [x] UTM + clickID capture + propagación a CAPI + WhatsApp
- [x] Scroll depth tracking 25/50/75/100 + time_on_page
- [x] Progressive enhancement (fallback a WhatsApp si API falla)
- [x] Skip link a11y
- [x] Focus visible universal
- [x] prefers-reduced-motion
- [x] Favicon SVG inline (no requiere asset)
- [x] Checkmark animado post-submit
- [ ] Menú hamburger (no implementado: header actual mobile es simple y funciona bien sin menú)

### Fase 7
- [ ] Decisión go/no-go según métricas post-Fase 6

---

## Notas de seguridad

- **Nunca** commitear el `META_CAPI_TOKEN` al repo. Solo como env var en Vercel.
- Agregar `.env*` al `.gitignore` antes de inicializar repo.
- El token compartido en el chat debe rotarse si queda expuesto en logs o capturas.

---

## Pendiente para próxima sesión

1. Confirmar **Dataset ID** (Events Manager → Configuración).
2. Generar **Test Event Code** para validar CAPI en staging.
3. Verificar **dominio** en Business Manager (requiere acceso al DNS del dominio final).
4. Definir **URL de producción** en Vercel.
5. Recibir **fotos reales** de clases de Micaela/Álvaro.
6. Confirmar **precios vigentes** de los 3 planes.
7. Decidir si el formulario de lead envía a email (Resend) o a Google Sheets.
