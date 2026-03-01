# Integración WishApp: generación de vídeos por IA (centro del negocio)

**Un solo backend:** El proyecto tiene **un único backend** (Node.js + Express en `server/`) que procesa todo: autenticación, vídeos, WishApp, chat, pagos, etc. No hay un segundo backend; el frontend solo habla con esta API.

**API central del negocio:** [WishApp](https://api.wishapp.online) — generación de vídeos mediante IA (undress video).  
**Documentación oficial:** [https://api.wishapp.online/en/docs](https://api.wishapp.online/en/docs)

Este documento describe el flujo seguro de integración, estándares y configuración.

---

## 1. Principios de seguridad

- **Token WishApp solo en servidor:** `WISHAPP_API_TOKEN` se define en `.env` del backend. El frontend **nunca** recibe ni envía este token.
- **Todas las llamadas a WishApp** se hacen desde el backend (Node.js). El frontend solo llama a nuestras rutas (`/api/videos/*`, `/api/wishapp/balance`) con JWT de la app.
- **photo_url restringida:** Solo se aceptan URLs de imagen que apunten a nuestro propio dominio y ruta `/uploads/` (imágenes subidas por el usuario a nuestro servidor). No se reenvían URLs arbitrarias a WishApp.
- **Validación de entrada:** Límite de tamaño en JSON, longitud máxima de prompt, validación de tipos y sanitización en backend.
- **Créditos:** La generación consume créditos del usuario (MongoDB). El balance mostrado puede sincronizarse con WishApp (`GET /api/wishapp/balance`) para información; la deducción se hace en nuestra base de datos.

---

## 2. Flujo de generación de vídeo

```
[Usuario] → Frontend (React)
    → Sube imagen (base64) → POST /api/videos/upload-image (JWT)
    → Backend guarda en uploads/ y devuelve URL pública (PUBLIC_URL/uploads/...)
    → Usuario envía prompt + photo_url → POST /api/videos/generate (JWT)
[Backend]
    → Valida prompt, créditos, photo_url (solo nuestro dominio + /uploads/)
    → Si WishApp configurado y photo_url válida: POST WishApp /v1/undress_video/
        (Authorization: Bearer WISHAPP_API_TOKEN, body: { photo_url, prompt, width, height, scene_id })
    → Si WishApp devuelve URL de vídeo: actualiza Video a completed y devuelve URL
    → Si WishApp devuelve job_id (async): deja status processing; opcional: polling posterior
    → Si no hay WishApp o no hay photo_url: flujo alternativo (mock o otro proveedor)
[Frontend]
    → Redirige a /mis-videos; el usuario ve el vídeo en estado processing o completed
```

---

## 3. Endpoints WishApp usados

| Método | Ruta | Uso en el proyecto |
|--------|------|--------------------|
| GET | `/v1/balance/` | Consultar saldo (token WishApp). Expuesto al usuario vía `GET /api/wishapp/balance` (con JWT nuestro). |
| POST | `/v1/undress_video/` | Generar vídeo desde una foto. Llamado desde `POST /api/videos/generate` cuando hay `photo_url` válida y `WISHAPP_API_TOKEN` configurado. |

**Body undress_video:** `{ photo_url, prompt, width?, height?, scene_id? }` — ver `server/src/api/wishapp.js`.

---

## 4. Variables de entorno (backend)

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `WISHAPP_API_TOKEN` | Sí (para generación con WishApp) | Bearer token de WishApp. Obtener en [wishapp.online](https://wishapp.online). |
| `WISHAPP_API_BASE_URL` | No | Default: `https://api.wishapp.online`. |
| `PUBLIC_URL` | Sí (si usas WishApp) | URL pública del backend para que WishApp pueda **descargar la imagen**. Si es `http://localhost:4000`, los servidores de WishApp no pueden acceder; se usará vídeo de demostración. En local, usa un túnel (ngrok, etc.) con URL pública para probar generación real. |
| `MONGODB_URI` | Sí | Base de datos para usuarios, vídeos y créditos. |
| `JWT_SECRET` | Sí | Secreto para firmar el JWT de la app. |

El frontend usa `VITE_API_URL` (o proxy) para llamar al backend; no tiene acceso a las variables del servidor.

---

## 5. Rutas del backend (API propia)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/wishapp/balance` | JWT | Devuelve balance WishApp (proxy; token WishApp solo en servidor). |
| POST | `/api/videos/upload-image` | JWT | Recibe imagen en base64, guarda en `uploads/`, devuelve `{ url }` (PUBLIC_URL/uploads/...). |
| POST | `/api/videos/generate` | JWT | Recibe `prompt`, opcional `photo_url`, opcional `quality`. Deducción de créditos; si hay photo_url válida y WishApp configurado, llama a WishApp undress_video. |
| GET | `/api/videos` | JWT | Lista vídeos del usuario. |
| GET | `/api/videos/:id` | JWT | Detalle de un vídeo. |
| DELETE | `/api/videos/:id` | JWT | Borrar vídeo del usuario. |

---

## 6. Estándares aplicados

- **CORS:** Orígenes permitidos definidos en backend (FRONTEND_URL, localhost, etc.).
- **Límite de cuerpo:** `express.json({ limit: '4mb' })` para evitar payloads gigantes (imágenes base64).
- **Validación photo_url:** Solo `http(s)://[nuestro host]/uploads/...` (ver `isAllowedPhotoUrl` en `server/src/routes/videos.js`).
- **Rate limiting:** Límite por IP en `POST /api/videos/generate` para evitar abuso (opcional; ver middleware en `server/src/middleware/rateLimit.js` si existe).
- **Manejo de errores:** Errores de WishApp no exponen detalles internos al cliente; mensajes genéricos cuando proceda.
- **Uploads:** Directorio `uploads/` servido como estático sin listado de directorio; nombres de archivo con user id + timestamp + random para evitar colisiones y path traversal.

---

## 7. Qué hace falta para que el vídeo se genere con IA real

1. **Subir una foto** (o elegir una IA con imagen) en la pantalla «Crear vídeo». Sin imagen solo se genera un vídeo de demostración.
2. **PUBLIC_URL accesible desde internet:** WishApp tiene que poder descargar la imagen desde esa URL. Si `PUBLIC_URL=http://localhost:4000`, los servidores de WishApp no pueden acceder.
   - **En producción:** Pon la URL pública del backend, por ejemplo `https://api.tudominio.com`.
   - **En local (pruebas):** Usa un túnel (p. ej. [ngrok](https://ngrok.com)): ejecuta `ngrok http 4000`, copia la URL tipo `https://xxxx.ngrok.io` y en `.env` pon `PUBLIC_URL=https://xxxx.ngrok.io`. Reinicia el backend.
3. **WISHAPP_API_TOKEN** en `.env` con tu token de [wishapp.online](https://wishapp.online).

Si algo falla, revisa la consola del backend al arrancar (avisa si PUBLIC_URL es localhost) y los mensajes que muestra la app al generar.

---

## 8. Test de la API WishApp

```bash
# Test de balance (token por argumento o .env)
node scripts/test-wishapp-api.js "TU_WISHAPP_TOKEN"
```

Ver también: `docs/WISHAPP-API-DOCUMENTACION.md` y `scripts/test-wishapp-api.js`. Para generación real en local, ver sección 7 (ngrok + PUBLIC_URL).
