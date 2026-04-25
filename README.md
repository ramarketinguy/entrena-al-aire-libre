# Entrenáte en Movimiento — Landing

Landing estática con Vercel Serverless Functions para Meta Pixel + CAPI y captura de leads.

## Estructura

```
/
├── index.html             # Landing completa (HTML + CSS + JS inline)
├── robots.txt
├── sitemap.xml
├── vercel.json            # Config Vercel: headers, functions, redirects
├── package.json
├── .env.example           # Referencia de env vars — NO commitear .env real
├── .gitignore
└── api/
    ├── capi.js            # POST /api/capi — relay a Meta Conversions API
    └── lead.js            # POST /api/lead — formulario + dispara Lead CAPI
```

## Variables de entorno (Vercel)

Configurar en el dashboard del proyecto en Vercel (Settings → Environment Variables):

| Variable | Valor | Entornos |
|----------|-------|----------|
| `META_PIXEL_ID` | `1283219893317159` | Production + Preview |
| `META_CAPI_TOKEN` | System User token (marcar **Sensitive**) | Production + Preview |
| `META_TEST_EVENT_CODE` | `TEST96231` | **Solo Preview** — dejar vacío en Production |
| `LEAD_WEBHOOK_URL` | (opcional) URL de Zapier/Make | Production |
| `WHATSAPP_NUMBER` | (opcional) `59895682168` por defecto | Production |

## Deploy

```bash
npm i -g vercel
vercel login
vercel         # primera vez: elegir proyecto nuevo, no framework
vercel --prod  # deploy a Production
```

## Testing CAPI

1. En Meta Events Manager → Test Events, pegar `TEST96231`
2. Abrir Preview URL (`*.vercel.app`) y navegar por la landing
3. Los eventos deben aparecer en Test Events en tiempo real con etiqueta **"Dedup con Pixel"**
4. En Production, el `test_event_code` NO se envía (código lee `process.env.META_TEST_EVENT_CODE`)

## Eventos tracked

| Evento | Dónde dispara | Canales |
|--------|---------------|---------|
| `PageView` | Carga de página | Pixel + CAPI |
| `ViewContent` | Scroll 50% y 75% | Pixel |
| `Contact` | Click WhatsApp (header, footer) | Pixel + CAPI* |
| `Schedule` | Click "Reservar clase gratis" (hero, pricing free, CTA final) | Pixel + CAPI* |
| `Lead` | Click planes pagos + submit del formulario | Pixel + CAPI |
| `CompleteRegistration` | Submit del formulario | Pixel |

*CAPI se dispara cuando `window.__capiEnabled` está activo (por defecto, sí).

## Deduplicación

Cada evento genera un `eventID` único en el browser. El mismo `eventID` se envía tanto al Pixel (`fbq('track', ..., { eventID })`) como al CAPI (`event_id` del payload). Meta deduplica automáticamente.

## Seguridad

- `META_CAPI_TOKEN` **nunca** aparece en el front — solo en la Function server-side
- `.env` está en `.gitignore`
- Headers HTTP hardening en `vercel.json` (X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Honeypot + time-trap en el formulario contra bots

## Pendientes manuales

- [ ] Comprar dominio `entrenateenmovimiento.uy` (o el elegido) y apuntarlo a Vercel
- [ ] Verificar dominio en Business Manager (Meta)
- [ ] Subir assets reales: `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `og-image.jpg` (1200x630)
- [ ] Reemplazar testimonio genérico por uno real con nombre + foto
- [ ] Fotos reales de clases en los parques (reemplazar placeholders si los hubiera)
