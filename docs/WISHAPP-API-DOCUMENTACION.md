# Documentación API WishApp (api.wishapp.online)

**Documentación oficial:** [https://api.wishapp.online/en/docs](https://api.wishapp.online/en/docs)

---

## 1. Autenticación

- **Método:** Bearer token.
- **Header:** `Authorization: Bearer <api_token>`.
- **Cómo obtener el token:** Iniciar sesión en [wishapp.online](https://wishapp.online/). El token se obtiene desde el sitio principal.

Todas las llamadas que requieran usuario deben enviar este header.

---

## 2. Endpoints

### 2.1 Balance (créditos del usuario)

| Dato | Valor |
|------|--------|
| **Método** | `GET` |
| **URL** | `https://api.wishapp.online/v1/balance/` |
| **Auth** | Requerida (Bearer) |

**Respuesta 200:**

```json
{
  "balance": 185317.0,
  "available_balance": 185317.0,
  "points": "185317.00000"
}
```

| Campo | Tipo | Uso |
|-------|------|-----|
| `balance` | number | Saldo total en puntos |
| `available_balance` | number | Saldo disponible |
| `points` | string | Mismo saldo en string para mostrar con precisión |

**Errores:**

| Código | Descripción |
|--------|-------------|
| 401 UNAUTHORIZED | Token no enviado o inválido |

---

### 2.2 Undress Video

| Dato | Valor |
|------|--------|
| **Método** | `POST` |
| **URL** | `https://api.wishapp.online/v1/undress_video/` |
| **Auth** | Bearer |
| **Content-Type** | `application/json` |

**Body (JSON):**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `photo_url` | string | Sí | URL pública de la foto |
| `prompt` | string | Sí | Descripción del resultado |
| `width` | number | No | Default 512. La API puede rechazar otros valores (ej. WIDTH_NOT_VALID); el backend envía siempre 512. |
| `height` | number | No | Default 680. El backend envía siempre 680 para undress_video. |
| `scene_id` | number | No | Default 1 |

**Ejemplo:**

```json
{
  "photo_url": "https://ejemplo.com/foto.jpg",
  "prompt": "descripción",
  "width": 512,
  "height": 680,
  "scene_id": 1
}
```

**Respuesta:** Objeto con `url`, `job_id`, `status` según la API. Si es asíncrono, usar `job_id` para consultar estado/resultado.

**Errores:** 401 (token inválido), 4xx/5xx según documentación oficial.

---

## 3. Test con el script del proyecto

```bash
# Con token en .env
node scripts/test-wishapp-api.js

# Con token como argumento
node scripts/test-wishapp-api.js "TU_TOKEN_AQUI"
```

El script prueba `GET /v1/balance/` y muestra `balance`, `available_balance` y `points`.

---

## 4. Integración en el proyecto

- **Backend:** `server/src/api/wishapp.js` — `getBalance()`, `createUndressVideo()`
- **Ruta balance:** `GET /api/wishapp/balance` (protegida con JWT de la app)
- **Variable de entorno:** `WISHAPP_API_TOKEN` en `.env`. Opcional: `WISHAPP_API_BASE_URL`
