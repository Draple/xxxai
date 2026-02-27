# Análisis: APIs y servicios de https://wishapp.online/en

## Stack técnico detectado
- **Frontend**: Next.js (React), con chunks en `/_next/static/chunks/`
- **Rutas de producto**: `/en/generate/image`, `/en/generate/video`, `/auth`, `/en/price`, etc.
- **Dominio**: Todo el contenido y assets son de **wishapp.online** (mismo origen)

## Servicios de terceros (visibles en el HTML)

| Servicio | Uso | URL / ID |
|----------|-----|----------|
| **Google Tag Manager** | Analytics / publicidad | `https://www.googletagmanager.com/gtag/js?id=G-91C79K6GGT` |
| **Yandex Metrika** | Analytics | `https://mc.yandex.ru/metrika/tag.js`, `https://mc.yandex.ru` |
| **kdtrk.net** | Postback / afiliados | `https://kdtrk.net/en/postback/?status=approved&data=` |
| **Schema.org** | Datos estructurados (SEO) | `https://schema.org` |

## API de IA / generación

- **No** aparece en el HTML ni en los scripts analizados ninguna URL de API pública de IA (Replicate, Stability, OpenAI, etc.).
- Las rutas `/en/generate/image` y `/en/generate/video` apuntan al **mismo dominio** (wishapp.online). La lógica de generación se carga en chunks bajo demanda al entrar en esas páginas.
- Conclusión: la **API de generación (undress, face swap, deepfake)** es **propia del sitio** (backend en wishapp.online). Si usan algún proveedor externo (Replicate, GPU cloud, etc.), lo harían **solo en servidor**; no está expuesto en el frontend.

## Cómo ver la API real de generación

1. Abrir **DevTools → Network** en Chrome/Edge.
2. Iniciar sesión en wishapp.online e ir a **Generate image** o **Generate video**.
3. Subir una imagen o disparar una generación y filtrar por **XHR/Fetch**.
4. Revisar la **Request URL** (ej. `https://wishapp.online/api/...` o un subdominio tipo `api.wishapp.online`) y los **headers** para ver si hay referencias a algún proveedor.

---
*Análisis realizado por inspección del HTML y chunks JS de la landing (sin acceso a la red en tiempo de uso).*
