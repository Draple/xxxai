# Integración: Chat con IA (Hugging Face Router)

El backend usa la **API del Router de Hugging Face** (compatible con OpenAI): `https://router.huggingface.co/v1/chat/completions`.

Modelo por defecto: **zai-org/GLM-4.7-Flash:novita**.

## Configuración

En `.env`:

- **`HF_TOKEN`**: Token de Hugging Face con permiso **Inference**. Crear en [Settings → Tokens](https://huggingface.co/settings/tokens).
- **`HF_CHAT_MODEL`** (opcional): Por defecto `zai-org/GLM-4.7-Flash:novita`.

## Backend

- **`server/src/api/hfRouter.js`**: Cliente que llama a `https://router.huggingface.co/v1/chat/completions` con `model`, `messages`, `max_tokens`, `temperature` (formato OpenAI).
- **`server/src/routes/ai.js`**: `POST /api/ai/chat` (protegido con JWT). Body: `{ messages: [{ role: 'user'|'assistant', content: string }] }`. Respuesta: `{ reply: string }`. También `POST /api/ai/feed-post` para textos del feed.

## Frontend

- **`src/api/ai.js`**: `sendChatMessage(token, messages)` → llama a `/api/ai/chat`.
- **`src/pages/Chat.jsx`**: Envía el historial y muestra la respuesta de la IA.

## Referencia

- Router HF: `https://router.huggingface.co/v1`
- Documentación: [Hugging Face Inference](https://huggingface.co/docs/api-inference)
