# Integración: Chat con IA (Hugging Face)

El backend usa la **API unificada** de Hugging Face: `https://router.huggingface.co/v1/chat/completions` (formato compatible con OpenAI). La antigua URL `api-inference.huggingface.co` está en desuso (410).

## Configuración

En `.env`:

- **`HUGGINGFACE_API_TOKEN`**: Token con permiso **"Make calls to Inference Providers"** (o "Inference"). Crear en [Settings → Tokens](https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained) (fine-grained con permiso de Inference Providers).
- **`HF_CHAT_MODEL`** (opcional): Por defecto `meta-llama/Llama-3.2-3B-Instruct:fastest`. El modelo debe ser soportado por un **proveedor que tengas habilitado** en [Inference Providers](https://huggingface.co/settings/inference-providers) (activa al menos uno: p. ej. HF Inference, Groq, Together).

## Backend

- **`server/src/api/huggingface.js`**: Cliente que llama a `router.huggingface.co/v1/chat/completions` con `model`, `messages`, `max_tokens`, etc.
- **`server/src/routes/ai.js`**: `POST /api/ai/chat` (protegido con JWT). Body: `{ messages: [{ role: 'user'|'assistant', content: string }] }`. Respuesta: `{ reply: string }`.

## Frontend

- **`src/api/ai.js`**: `sendChatMessage(token, messages)` → llama a `/api/ai/chat`.
- **`src/pages/Chat.jsx`**: Envía el historial, muestra la respuesta de la IA o el mensaje de fallback si falla la API.

## Error "model is not supported by any provider you have enabled"

Hay que **activar al menos un proveedor** en tu cuenta:

1. Entra en **[Inference Providers](https://huggingface.co/settings/inference-providers)**.
2. Activa uno o más proveedores (por ejemplo **HF Inference**, **Groq**, **Together**).
3. El modelo por defecto (`meta-llama/Llama-3.2-3B-Instruct:fastest`) debería funcionar con varios de ellos. Si no, define en `.env` otro modelo, por ejemplo: `HF_CHAT_MODEL=Qwen/Qwen2.5-7B-Instruct-1M:fastest` (y asegúrate de tener habilitado un proveedor que lo soporte).

## Notas

- Si el token no tiene permiso de Inference Providers, la API puede devolver 400/401. Crea un token fine-grained con ese permiso.
- 503: modelo cargando; el usuario puede reintentar.
