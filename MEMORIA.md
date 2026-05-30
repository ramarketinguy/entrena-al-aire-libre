# MEMORIA — Landing Entrená en la Naturaleza

## Cliente

- **Nombre:** ENTRENÁ EN LA NATURALEZA
- **Servicio:** Entrenamientos grupales al aire libre en Montevideo (Parque Rodó, Parque Batlle, Prado)
- **Target:** Público general: hombres y mujeres que quieren entrenar al aire libre en grupos reducidos
- **Profesores:**
  - **Álvaro Gustavo Pérez Rodríguez** — ISEF, 43 años exp, IG: @profesor_alvaro_perez
  - **Micaela Bianchi Luna** — IUACJ, 8 años exp (hidrogimnasia), IG: @micabianchiwellness
- **WhatsApp:** +598 97 922 856
- **Planes:** $0 prueba / $1.200/mes (1x) / $2.000/mes (2x popular) / $2.700/mes (3x)
- **Herramientas Compartidas:**
  - **FFmpeg:** `D:\2_Agencia\Ramarketing\Antigravity\Tools\ffmpeg\ffmpeg-8.1.1-essentials_build\bin\ffmpeg.exe`

---

## Archivos actuales

```
/
├── index.html           # ~105 KB, ~2600 líneas (CSS+JS inline + Performance)
├── api/
│   ├── capi.js          # Meta CAPI server-side
│   └── lead.js          # Form + webhook + notificaciones
├── videos/
│   ├── hero-web_comp.mp4    # Hero desktop (optimizado ~4MB)
│   ├── hero-mobile_comp.mp4 # Hero mobile (optimizado ~3MB)
│   ├── alvaro-v2_comp.mp4   # Presentación Álvaro (optimizado ~1MB)
│   └── micaela_comp.mp4     # Presentación Micaela (optimizado ~6MB)
├── og-image.png         # ~537 KB (1200x630)
├── robots.txt
├── sitemap.xml
├── vercel.json
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── MEMORIA.md           # Este archivo
└── plan_mejora.md       # Checklist de ejecución
```

---

## Implementado (sesión 25/04/2026)

### Copy
- Logo: **ENTRENÁ EN LA NATURALEZA**
- Título hero: **Llenate de energía y sentite más fuerte que nunca**
- CTA WhatsApp header: **ELIMINADO**
- Testimonio falso: **ELIMINADO** (sección completa removida)
- Comunidad: *Conecta con personas que comparten tus mismos objetivos*
- Mejor versión: *construir tu mejor versión*

### Video hero
- Web: `videos/hero-web.mp4` (autoplay, muted, loop)
- Mobile: `videos/hero-mobile.mp4` (autoplay, muted, loop)
- Overlay: gradient oscuro 45%→65% + blur 3px
- Video: blur 2px + scale 1.04 (evita bordes)
- z-index 2 → `.hero-content` sobre el video

### Videos profes (inline, 1:1)
- Botón play overlay con gradiente verde
- Click-to-play, controles nativos
- Track: `VideoPlay` + `VideoComplete` al Pixel
- Instagram link en cada card con gradiente IG

### Formulario
- Endpoint: `/api/lead`
- Campos: nombre, email/teléfono, horario, parque
- Honeypot + time-trap anti-bot
- CAPI server-side con user_data hasheado
- Progressive fallback: si falla el API, abre WhatsApp con datos
- Checkmark animado post-submit
- UTMs + clickIDs propagados al CAPI y WhatsApp

### Meta Pixel + CAPI
- Pixel ID: `1283219893317159`
- PageView + Contact + Schedule + Lead + ViewContent + ScrollDepth
- eventID único por disparo (deduplicación client + server)
- Test Event Code: `TEST96231` (solo Preview)
- Cuenta: `act_1263324078734211` (Bye Bye Pelos)

### SEO
- OG tags + Twitter Card
- JSON-LD: LocalBusiness + Service + FAQPage
- Canonical, robots.txt, sitemap.xml
- Favicon SVG inline (data-URI)

---

## Pendiente — CONFIGURACIÓN MANUAL (requiere al usuario)

### 1. Deploy a Vercel
```bash
vercel login
vercel --prod
```
**Importante:** configurar env vars ANTES de deployar:
- `META_PIXEL_ID=1283219893317159`
- `META_CAPI_TOKEN` configurado como variable sensible en Vercel. No guardar el valor en el repo.
- `META_TEST_EVENT_CODE=TEST96231` (SOLO Preview, vacío en Production)

### 2. Google Sheets — recibir leads (COMPLETADO ✅)
URL: `https://script.google.com/macros/s/AKfycby-4ksLui_8yl60I5cH2mI57zD7Le1VpuGamgX9S-qr2EaRn7o4quZllZTsFGHDgFP9Xw/exec`
*Pasos realizados:*
- Tabla creada con columnas (Fecha, Nombre, Email, Teléfono, Horario, Parque, UTMs, Event ID).
- Apps Script implementado como App Web accesible por "Cualquiera".
- Webhook listo para recibir POST de `api/lead.js`.

### 3. WhatsApp notificaciones
- Requiere cuenta Twilio o similar
- Una vez que tengas credenciales, agregar al Apps Script arriba

- [x] `og-image.png` (1200x630) — unificada y optimizada
- [ ] Verificar dominio en Business Manager
- [ ] Confirmar Dataset ID en Events Manager
- [ ] Material de clienta: fotos reales de clases, testimonio con nombre+foto
- [x] Comprimir videos (Hero y Profes) con FFmpeg

---

## Historial de sesiones

### Sesión 1 — 23/04/2026
Contexto inicial, plan de 7 fases, Pixel + CAPI Token recibidos.

### Sesión 2 — 24/04/2026
Fases 1-4 completadas: fixes contenido, Pixel+CAPI, SEO, formulario, UX/CRO completo.

### Sesión 4 — 07/05/2026 (Performance & Cleanup)
- **Optimización de Videos:** Todos los videos reemplazados por versiones `_comp.mp4` (reducción de ~200MB a ~14MB en total).
- **Lazy Loading:** Implementado `IntersectionObserver` para videos y carga diferida (1s) para el Hero.
- **Limpieza de Repo:** Eliminado `ffmpeg.zip`, versiones pesadas de video, scripts de prueba (`test_webhook`, etc.) y `og-image.jpg`.
- **Unificación SEO:** OG Image unificada a `og-image.png` tanto en meta tags como en JSON-LD.
- **Herramientas:** FFmpeg movido a carpeta global de `Tools` para no ensuciar proyectos.

---

## Instrucciones para la siguiente sesión

1. Leer MEMORIA.md primero
2. Confirmar qué pasos de CONFIGURACIÓN MANUAL quedaron pendientes
3. Consultar si hay nuevos assets (fotos clienta, og-image) para procesar
