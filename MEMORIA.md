# MEMORIA — Landing Entrená en la Naturaleza

## Cliente

- **Nombre:** ENTRENÁ EN LA NATURALEZA
- **Servicio:** Entrenamientos grupales al aire libre en Montevideo (Parque Rodó, Parque Batlle, Prado)
- **Target:** Mujeres (público principal)
- **Profesores:**
  - **Álvaro Gustavo Pérez Rodríguez** — ISEF, 43 años exp, IG: @profesor_alvaro_perez
  - **Micaela Bianchi Luna** — IUACJ, 8 años exp (hidrogimnasia), IG: @micabianchiwellness
- **WhatsApp:** +598 95 682 168
- **Planes:** $0 prueba / $1.200/mes (1x) / $2.000/mes (2x popular) / $2.700/mes (3x)

---

## Archivos actuales

```
/
├── index.html           # ~89 KB, ~2450 líneas (CSS+JS inline)
├── api/
│   ├── capi.js          # Meta CAPI server-side
│   └── lead.js          # Form + webhook + notificaciones
├── videos/
│   ├── hero-web.mp4     # Video hero desktop
│   ├── hero-mobile.mp4  # Video hero mobile
│   ├── alvaro.mp4       # Presentación profesor (inline, 1:1)
│   └── micaela.mp4      # Presentación profesora (inline, 1:1)
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
- Título hero: **Llena de energía y sentite más fuerte que nunca**
- CTA WhatsApp header: **ELIMINADO**
- Testimonio falso: **ELIMINADO** (sección completa removida)
- Comunidad: *Conecta con personas que comparten tus mismos objetivos*
- Mejor versión: *ser la mejor versión de vos misma*

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
- `META_CAPI_TOKEN=EAALkmorQINQBRWhv7EX1OUojuo5i6n1FE7yILcn4KMS7GogJZC3p1cPkdx6LurZCTzgLlzeZB6kqLKOxgujXxaxhwdm1OCzirB94GVOp2g6nBeeLmDE0ROxy45P4mDvKwpawyHUy7CZALCBYHZCyvSGncW7YEjZBCGJlKhoDyYbNGkcadZCnCuiLykIpF45szpD8wZDZD` (Sensitive)
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

### 4. Pending post-deploy
- [ ] `og-image.jpg` (1200x630) — para compartir en redes
- [ ] Verificar dominio en Business Manager
- [ ] Confirmar Dataset ID en Events Manager
- [ ] Material de clienta: fotos reales de clases, testimonio con nombre+foto
- [ ] Comprimir `videos/micaela.mp4` (25 MB → ~7 MB con FFmpeg)

### 5. Comprimir video Micaela (cuando instales FFmpeg)
```bash
ffmpeg -i videos/micaela.mp4 -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 96k -movflags +faststart videos/micaela-compressed.mp4
```

---

## Historial de sesiones

### Sesión 1 — 23/04/2026
Contexto inicial, plan de 7 fases, Pixel + CAPI Token recibidos.

### Sesión 2 — 24/04/2026
Fases 1-4 completadas: fixes contenido, Pixel+CAPI, SEO, formulario, UX/CRO completo.

### Sesión 3 — 25/04/2026
- Logo → ENTRENÁ EN LA NATURALEZA
- Botón WhatsApp header eliminado
- Copy pivot a público femenino (vos/vosota/llena de energía)
- Testimonio falso eliminado
- Videos hero (web + mobile) con overlay oscuro + blur
- Videos profes inline 1:1 con play overlay
- Links Instagram en cards de profes
- Google Sheets webhook preparado (pendiente deploy Apps Script)

---

## Instrucciones para la siguiente sesión

1. Leer MEMORIA.md primero
2. Confirmar qué pasos de CONFIGURACIÓN MANUAL quedaron pendientes
3. Consultar si hay nuevos assets (fotos clienta, og-image) para procesar