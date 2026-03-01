# Tokens de APIs externas

Los tokens se configuran en **`.env`** y se cargan en **`server/src/config/apiKeys.js`**.

| Variable en .env    | Uso en el proyecto   | Dónde obtener el token |
|---------------------|----------------------|--------------------------|
| `WISHAPP_API_TOKEN` | **Centro del negocio:** generación de vídeos por IA + balance | [wishapp.online](https://wishapp.online) — inicia sesión y obtén el Bearer token. Ver [INTEGRACION-WISHAPP-VIDEOS.md](INTEGRACION-WISHAPP-VIDEOS.md). |
| `HF_TOKEN`          | Chat (GLM-4.7-Flash) | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — token con permiso **Inference**. |

## Configuración

1. Copia `.env.example` a `.env` (si aún no tienes `.env`).
2. Asigna cada token en `.env`:
   ```env
   WISHAPP_API_TOKEN=tu_token_wishapp
   HF_TOKEN=hf_xxxxxxxxxxxx
   ```
3. Opcional: `HF_CHAT_MODEL=zai-org/GLM-4.7-Flash:novita` (por defecto ya es este modelo).
4. Reinicia el backend. Al arrancar verás en consola si cada servicio está configurado.

## Uso en el código

- **WishApp** (generación de vídeos por IA y balance): `server/src/api/wishapp.js`. Rutas: `GET /api/wishapp/balance`, `POST /api/videos/generate` (usa undress_video). El token **nunca** se envía al frontend.
- **Chat**: `server/src/api/hfRouter.js` — llama a `https://router.huggingface.co/v1/chat/completions` (OpenAI-compatible) con el modelo `zai-org/GLM-4.7-Flash:novita`. Rutas: `POST /api/ai/chat`, `POST /api/ai/feed-post`.

Si falta `HF_TOKEN`, el chat devuelve **503** indicando que añadas la variable en `.env`.
