/**
 * Configuración unificada de tokens para APIs externas.
 * WishApp (balance), Hugging Face Router (chat remoto), Ollama (chat local GGUF).
 *
 * - WishApp: https://wishapp.online
 * - Hugging Face: https://huggingface.co/settings/tokens (Inference)
 * - Ollama: backend local (OLLAMA_BASE_URL + OLLAMA_MODEL)
 */

function loadEnv(name, defaultValue = undefined) {
  const v = process.env[name];
  if (v !== undefined && v !== '') return v;
  return defaultValue;
}

export const apiKeys = {
  wishapp: {
    token: loadEnv('WISHAPP_API_TOKEN'),
    baseUrl: loadEnv('WISHAPP_API_BASE_URL', 'https://api.wishapp.online'),
  },
  hfRouter: {
    token: loadEnv('HF_TOKEN'),
    modelId: loadEnv('HF_CHAT_MODEL', 'zai-org/GLM-4.7-Flash:novita'),
  },
  ollama: {
    baseUrl: loadEnv('OLLAMA_BASE_URL', 'http://localhost:11434'),
    modelId: loadEnv('OLLAMA_MODEL'),
  },
};

/** Comprueba si hay al menos un token configurado (para avisos en arranque). */
export function hasAnyExternalApiKey() {
  return !!(apiKeys.wishapp.token || apiKeys.hfRouter.token || apiKeys.ollama.modelId);
}

/** Indica si WishApp está configurado (balance). */
export function isWishAppConfigured() {
  return !!apiKeys.wishapp.token;
}

/** Indica si Ollama (local) está configurado para el chat. */
export function isOllamaConfigured() {
  return !!(apiKeys.ollama.baseUrl && apiKeys.ollama.modelId);
}

/** Indica si Hugging Face Router está configurado (chat remoto). */
export function isHFRouterConfigured() {
  return !!apiKeys.hfRouter.token;
}

/** Indica si el chat está disponible (Ollama local o Hugging Face Router). */
export function isChatConfigured() {
  return isOllamaConfigured() || isHFRouterConfigured();
}
