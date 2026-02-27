# Tokens de APIs externas

Los tokens de WishApp y Hugging Face se configuran en **`.env`** y se cargan en un único módulo del servidor: **`server/src/config/apiKeys.js`**. Cada API usa solo su propio token.

| Variable en .env           | Uso en el proyecto   | Dónde obtener el token |
|---------------------------|----------------------|--------------------------|
| `WISHAPP_API_TOKEN`       | Balance de puntos    | [wishapp.online](https://wishapp.online) — inicia sesión y obtén el Bearer token (panel o documentación del API). |
| `HUGGINGFACE_API_TOKEN`   | Chat con IA (Gemma)  | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — crea un token con permiso **Inference**. |

## Configuración

1. Copia `.env.example` a `.env` (si aún no tienes `.env`).
2. Asigna cada token en `.env`:
   ```env
   WISHAPP_API_TOKEN=tu_token_wishapp
   HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxx
   ```
3. Reinicia el backend. Al arrancar verás en consola si cada servicio está configurado o no.

## Uso en el código

- **WishApp** (balance): `server/src/api/wishapp.js` usa `apiKeys.wishapp.token` y `apiKeys.wishapp.baseUrl`. Ruta: `GET /api/wishapp/balance`.
- **Hugging Face** (chat): `server/src/api/huggingface.js` usa `apiKeys.huggingface.token` y `apiKeys.huggingface.modelId`. Ruta: `POST /api/ai/chat`.

Si falta el token correspondiente, la ruta devuelve **503** con un mensaje indicando qué variable añadir en `.env`.
