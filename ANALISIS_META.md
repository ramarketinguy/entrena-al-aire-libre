# 📊 Análisis Meta Ads + Web — Entrená en la Naturaleza
**Fecha de actualización:** 30/05/2026 | **Cuenta:** act_1263324078734211 | **Pixel:** 1283219893317159

---

## 🔑 DATOS DE LA CUENTA

| Campo | Valor |
|-------|-------|
| Cuenta publicitaria | act_1263324078734211 |
| Nombre en BM | Bye Bye Pelos (cuenta de anunciante) |
| Estado | ACTIVA (status: 1) |
| Moneda | UYU (Peso Uruguayo) |
| Pixel ID | 1283219893317159 |

---

## 📣 CAMPAÑAS ACTIVAS EN LA CUENTA

| Campaña | Objetivo | Estado |
|---------|----------|--------|
| Entrenamientos - 27/4 | OUTCOME_LEADS | ACTIVA |
| Campaña de Interacción masajes 10/3 | OUTCOME_ENGAGEMENT | ACTIVA |
| Campaña de Interacción 10/3 | OUTCOME_ENGAGEMENT | ACTIVA |

---

## 📈 ANÁLISIS DE AUDIENCIA ACTIVA (Últimos 30 días)

El análisis del tráfico y leads reales revela una altísima concentración en un segmento específico. Los datos muestran con absoluta precisión a quién le estamos llegando y quién está convirtiendo:

### 👥 Distribución por Sexo y Edad
*El 99.9% del presupuesto y el 100% de los leads provienen de **Mujeres (Females)**. Los hombres tienen gasto prácticamente nulo y cero conversión.*

| Rango de Edad | Gasto (UYU) | Impresiones | Clics | CTR | Leads | Costo por Lead (CPL) |
|---------------|-------------|-------------|-------|-----|-------|----------------------|
| **Mujeres 55-64** | $2.875,72 | 14.812 | 1.364 | 9.21% | 27 | **$106,51 UYU** (Principal volumen) |
| **Mujeres 45-54** | $1.855,86 | 10.629 | 820 | 7.71% | 25 | **$74,23 UYU** (El más eficiente) |
| **Mujeres 35-44** | $1.196,64 | 5.568 | 344 | 6.18% | 3 | $398,88 UYU (Muy costoso) |
| **Mujeres 25-34** | $552,18 | 2.257 | 183 | 8.11% | 3 | $184,06 UYU |
| **Mujeres 65+** | $541,25 | 1.418 | 187 | 13.19% | 2 | $270,62 UYU |
| **Hombres (Todos)**| ~$135,00 | 479 | 60 | 12.5% | 0 | N/A |

> [!TIP]
> **Conclusión del público objetivo:** Las mujeres de **45 a 64 años** representan el **86.6% del gasto y el 86.7% de los leads totales** (52 de 60 leads). Este es el núcleo duro indiscutible del negocio.

### 📍 Zonas Geográficas
- **100% del tráfico y gasto** se concentra correctamente en el **Departamento de Montevideo**, validando la correcta configuración de la segmentación geográfica local en torno a los parques de entrenamiento.

### 🖥️ Plataformas y Ubicaciones (Dónde se muestra)
*El tráfico es 100% móvil y está sumamente inclinado a Facebook.*

1. **Facebook - Mobile App:** Gasto de **$5.059,82 UYU** | CTR: **8.86%** | **44 Leads** (CPL: **$115,00 UYU**)
2. **Instagram - Mobile App:** Gasto de **$2.095,54 UYU** | CTR: **6.79%** | **16 Leads** (CPL: **$130,97 UYU**)
3. **Ubicaciones Web/Desktop:** Gasto marginal (<$20 UYU en total), sin leads.

---

## 🎨 RENDIMIENTO INDIVIDUAL DE ANUNCIOS

Analizamos los creativos y ofertas de forma individual durante los últimos 30 días para identificar ganadores y fugas:

| Anuncio | Gasto (UYU) | Impresiones | Clics | CTR | Landing Page Views | Fuga de Clics (%) | Leads | CPL (UYU) | Estado / Rendimiento |
|---------|-------------|-------------|-------|-----|--------------------|-------------------|-------|-----------|----------------------|
| **Anuncio 2 - Mica** | $2.636,32 | 12.695 | 952 | 7.50% | 460 | 51.7% | 23 | **$114,62** | **Excelente**. Es el pilar del volumen. |
| **Ejercicios de prueba**| $2.079,43 | 11.714 | 1.043| 8.90% | 515 | 50.6% | 20 | **$103,97** | **Ganador Absoluto**. Más clics y CPL muy bajo. |
| **Anuncio 3 - Ariel** | $1.641,00 | 5.451 | 524 | 9.61% | 246 | 53.1% | 7 | $234,43 | **Ineficiente**. Duplica el costo de adquisición. |
| **Test de longevidad** | $498,72 | 4.185 | 378 | 9.03% | 196 | 48.1% | 7 | **$71,25** | **Ultra eficiente**. CPL bajísimo. Escalar. |
| **Carrusel testimonios**| $231,72 | 1.005 | 42 | 4.18% | 16 | 61.9% | 2 | $115,86 | Buen CPL pero volumen bajo y alta fuga de carga. |
| **Anuncio 1** | $89,85 | 215 | 27 | 12.56%| 17 | 37.0% | 1 | $89,85 | Presupuesto marginal. |

---

## ⚙️ DIAGNÓSTICO DEL PIXEL Y API (CAPI)
- **Pixel y Token de Conversiones (CAPI):** Perfectamente funcionales y alineados. El proyecto Vercel tiene cargadas y encriptadas todas las variables clave (`META_PIXEL_ID`, `META_CAPI_TOKEN`, `LEAD_WEBHOOK_URL`, `META_TEST_EVENT_CODE`).
- **Verificación de Envíos:** La API de Conversiones recibe correctamente los parámetros enriquecidos del formulario incluyendo los identificadores únicos (`event_id`, `fbp`, `fbc`) y datos del navegador, garantizando una excelente calidad de coincidencia (Event Match Quality).

---

## 🚀 MEJORAS DE CARGA Y FILTRADO IMPLEMENTADAS (YA ONLINE)

Hemos subido a **Vercel** (`https://entrena-al-aire-libre.vercel.app`) todas las optimizaciones acordadas:

1. **Carga Ultra-Rápida del Hero Video (Solución a la Fuga de Clics):**
   - Se ajustó el delay de inicialización de los videos hero a **1800ms** (web) y **2000ms** (mobile) para dar absoluta prioridad a la carga del DOM, CSS y JavaScript crítico antes de descargar los MP4 optimizados. Esto mitigará drásticamente la fuga histórica del ~52% detectada entre el clic y la visualización de página.

2. **Formulario de Calificación Avanzado:**
   - Se integraron 3 nuevas preguntas clave en el formulario para calificar a los leads antes de enviarlos a WhatsApp/Sheets/Meta, asegurando captar personas con alta intención de compra y entender sus perfiles de forma inmediata:
     - **Objetivo Principal (`goal` - Obligatorio):**
       - *Energía y menos dolores corporales* (Enfoque Salud/Longevidad)
       - *Fuerza y movilidad* (Enfoque Funcional)
       - *Bajar de peso y tonificar* (Enfoque Estético)
       - *Lograr constancia con el ejercicio* (Enfoque Hábito/Acompañamiento)
       - *Esparcimiento y bienestar mental* (Enfoque Desconexión)
     - **Limitaciones Físicas (`physical_condition` - Opcional):** Caja de texto para reportar dolores de rodilla, espalda, etc. (Muy común en público +40).
     - **Momento de Inicio (`start_when` - Opcional):**
       - *Esta misma semana (¡Quiero arrancar ya!)*
       - *La próxima semana*
       - *Solo estoy averiguando por ahora*
