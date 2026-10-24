# Entrenáte en Movimiento — Landing

Landing estática con Vercel Serverless Function para Meta Pixel + CAPI.

**Público objetivo:** mujeres y hombres mayores de 45 años en Montevideo que quieren mejorar su salud, recuperar movilidad e independencia. El copy habla en singular y en femenino (la mayoría de las alumnas son mujeres).

**Profesor:** Álvaro Gustavo Pérez Rodríguez (ISEF, 43 años de experiencia).

**Conversión:** 100% WhatsApp — no hay formulario ni captura de datos en la página.

## Estructura

```
/
├── index.html             # Landing completa (HTML + CSS + JS inline)
├── robots.txt
├── sitemap.xml
├── favicon.ico            # Generado (fallback para browsers sin SVG)
├── apple-touch-icon.png   # Generado (iOS home screen)
├── og-image.jpg           # 1200x630
├── vercel.json            # Config Vercel: headers, functions, redirects
├── package.json
├── .env.example           # Referencia de env vars — NO commitear .env real
├── .gitignore
├── MEMORIA.md             # Contexto del proyecto (sanitizado)
├── videos/                # Assets comprimidos
└── api/
    └── capi.js            # POST /api/capi — relay a Meta Conversions API
```

## Variables de entorno (Vercel)

Configurar en el dashboard del proyecto en Vercel (Settings → Environment Variables):

| Variable | Valor | Entornos |
| --- | --- | --- |
| `META_PIXEL_ID` | `2289502958273608` | Production + Preview |
| `META_CAPI_TOKEN` | System User token (marcar **Sensitive**) | Production + Preview |
| `META_TEST_EVENT_CODE` | (generar en Test Events del nuevo pixel) | **Solo Preview** — dejar vacío en Production |

## Deploy

```
npm i -g vercel
vercel login
vercel         # primera vez: elegir proyecto nuevo, no framework
vercel --prod  # deploy a Production
```

Para probar en local con las functions: `vercel dev` (no abrir index.html directo ni previews de archivo único: los assets relativos no cargan ahí).

## Testing CAPI

1. En Meta Events Manager → Test Events, pegar el test event code del nuevo pixel
2. Abrir Preview URL (`*.vercel.app`) y navegar por la landing
3. Los eventos deben aparecer en Test Events en tiempo real con etiqueta **"Dedup con Pixel"**
4. En Production, el `test_event_code` NO se envía (código lee `process.env.META_TEST_EVENT_CODE`)

## Eventos tracked

| Evento | Dónde dispara | Canales |
| --- | --- | --- |
| `PageView` | Carga de página | Pixel + CAPI |
| `ViewContent` | Scroll 50% y 75% | Pixel + CAPI* |
| `Lead` | Click en cualquier CTA de WhatsApp (hero, planes, online, testimonios, sticky, flotante, exit modal) | Pixel + CAPI* |
| `ScrollDepth` (custom) | 25/50/75/100% | Pixel |
| `VideoPlay` / `VideoComplete` (custom) | Video de Álvaro y testimonios | Pixel |

\*CAPI se dispara cuando `window.__capiEnabled` está activo (por defecto, sí).

## Deduplicación

Cada evento genera un `eventID` único en el browser. El mismo `eventID` se envía tanto al Pixel (`fbq('track', ..., { eventID })`) como al CAPI (`event_id` del payload). Meta deduplica automáticamente.

## Seguridad

- `META_CAPI_TOKEN` **nunca** aparece en el front — solo en la Function server-side
- `.env` está en `.gitignore`
- CORS restringido a same-origin en `/api/capi` + rate limit best-effort por IP
- Headers HTTP hardening en `vercel.json` (X-Frame-Options, Referrer-Policy, Permissions-Policy)

## Dominio (checklist cuando se compre)

Si se compra `entrenateenmovimiento.uy` (o similar), actualizar en estos 5 puntos:

1. `<link rel="canonical">` en `index.html`
2. `og:url` y `og:image` / `twitter:image` en `index.html`
3. URLs `@id`/`url` del JSON-LD en `index.html`
4. `Sitemap:` en `robots.txt`
5. `<loc>` en `sitemap.xml`

Y apuntar el dominio a Vercel + verificarlo en Meta Business Manager.

## Pendientes manuales

- Verificar el dominio en Business Manager (Meta)
- Confirmar que el token CAPI tiene acceso al nuevo pixel `2289502958273608`
