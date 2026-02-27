# Análisis: API WishApp (api.wishapp.online)

Documentación oficial: **[https://api.wishapp.online/en/docs](https://api.wishapp.online/en/docs)**

Esta API será la base de la interacción del proyecto (créditos, generación de video/imagen, etc.).

---

## 1. Autenticación

- **Método**: Bearer token.
- **Header**: `Authorization: Bearer <api_token>`.
- **Cómo obtener el token**: iniciar sesión en **[wishapp.online](https://wishapp.online/)** (el token se obtiene desde el sitio principal; la documentación no detalla si es un “API key” desde el panel de usuario o el token de sesión OAuth/JWT).

Todas las llamadas que requieran usuario deben enviar este header.

---

## 2. Endpoints documentados

### 2.1 Balance API (créditos del usuario)

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
| `available_balance` | number | Saldo disponible (incluye fondos congelados según la doc) |
| `points` | string | Mismo saldo en string para mostrar con precisión |

**Errores:**

| Código | Descripción |
|--------|-------------|
| 401 UNAUTHORIZED | Token no enviado o inválido |

**Uso en el proyecto:**  
Consultar saldo al cargar el dashboard, antes de iniciar una generación (undress video, deepfake, etc.) y actualizar el saldo tras cada operación que consuma puntos.

---

### 2.2 Undress Video y Deepfake

En la documentación aparecen como secciones **“Undress Video”** y **“Deepfake”**, pero en la página no se ven los detalles de endpoints (método, path, body, respuesta). Es probable que estén en bloques expandibles o en otra URL.

**Próximos pasos recomendados:**

1. Abrir [https://api.wishapp.online/en/docs](https://api.wishapp.online/en/docs) y expandir **Undress Video** y **Deepfake** para copiar método, URL, parámetros y ejemplos de respuesta.
2. Si existe, probar `https://api.wishapp.online/openapi.json` o `https://api.wishapp.online/swagger.json` para tener el spec completo en JSON.
3. Con eso se podrá definir en el proyecto:
   - Servicio/cliente para **balance** (ya documentado).
   - Servicios para **Undress Video** (subida de video, polling o webhook, descarga de resultado).
   - Servicios para **Deepfake** (subida de foto/video, mismo flujo).

---

## 3. Integración en videoOnix

### Base URL

```
https://api.wishapp.online
```

### Flujo típico

1. **Login**  
   El usuario inicia sesión en wishapp.online (o en nuestra app si delegamos login en ellos). Nuestra app debe guardar el **Bearer token** de la API de forma segura (variable de entorno en servidor o sesión cifrada, nunca en el cliente si es sensible).

2. **Balance**  
   - Al cargar la app o la sección de generación: `GET /v1/balance/` con `Authorization: Bearer <token>`.  
   - Mostrar el saldo (por ejemplo con `points` o `available_balance`) y deshabilitar o avisar cuando no haya puntos suficientes.

3. **Undress Video / Deepfake**  
   - Cuando se documenten los endpoints:  
     - Llamar al endpoint de creación (seguramente `POST` con `multipart/form-data` para imagen/video).  
     - Si la API es asíncrona: guardar `job_id` o similar y hacer polling a un endpoint de estado/resultado, o usar webhook si lo ofrecen.  
     - Al recibir “completado”, mostrar/descargar el resultado y volver a llamar a **Balance** para refrescar el saldo.

### Seguridad

- No exponer el Bearer token en el frontend. Idealmente, las llamadas a `api.wishapp.online` se hacen desde **nuestro backend** (por ejemplo el server de videoOnix), que tiene el token en variable de entorno y expone a nuestro front solo rutas propias (ej. “crear undress”, “obtener balance”).
- Validar y sanitizar siempre en backend los parámetros que se reenvían a WishApp (IDs, URLs, etc.).

---

## 4. Resumen

| Sección API   | Estado en docs        | Uso en proyecto                          |
|---------------|------------------------|------------------------------------------|
| **Balance**   | Documentado           | Mostrar y actualizar créditos del usuario |
| **Undress Video** | Solo nombre en docs | Flujo de generación de video (pendiente spec) |
| **Deepfake**  | Solo nombre en docs   | Flujo de generación deepfake (pendiente spec) |

Cuando tengas los detalles de **Undress Video** y **Deepfake** (URLs, métodos, body, códigos de error), se pueden añadir a este documento y definir los servicios concretos en el código (por ejemplo en `server/` o `src/api/wishapp.js`).

---

## 5. Integración realizada en el proyecto

- **Backend**
  - `server/src/api/wishapp.js`: cliente que llama a `GET https://api.wishapp.online/v1/balance/` con el token de `.env`.
  - `server/src/routes/wishapp.js`: `GET /api/wishapp/balance` (protegido con JWT de la app). Devuelve `{ balance, available_balance, points }`.
- **Frontend**
  - `src/api/wishapp.js`: `getWishAppBalance(token)` llama a nuestro backend.
  - `src/hooks/useWishAppBalance.js`: hook que usa el token del `AuthContext`, expone `{ balance, loading, error, refetch }`.
- **Variables de entorno**: en `.env` definir `WISHAPP_API_TOKEN` (Bearer de wishapp.online). Opcional: `WISHAPP_API_BASE_URL`, `PUBLIC_URL` (URL pública del backend para que WishApp pueda descargar la imagen subida).
- **Undress Video**: `POST https://api.wishapp.online/v1/undress_video/` con body JSON `{ photo_url, prompt, width, height, scene_id }`. Cliente en `server/src/api/wishapp.js` → `createUndressVideo()`. La ruta `POST /api/videos/generate` acepta `photo_url`; si viene con imagen, se sube con `POST /api/videos/upload-image` y se envía esa URL a WishApp.
