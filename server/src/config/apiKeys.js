/**
 * Configuración unificada de tokens para APIs externas.
 * Los valores se leen de .env; aquí se exponen en un solo lugar para uso en WishApp y Hugging Face.
 *
 * Cómo obtener cada token:
 * - WishApp: inicia sesión en https://wishapp.online y obtén el Bearer token (panel o soporte).
 * - Hugging Face: https://huggingface.co/settings/tokens → crear token con permiso "Inference".
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
  huggingface: {
    token: loadEnv('HUGGINGFACE_API_TOKEN'),
    // Modelo del router. Debe ser uno soportado por un proveedor que tengas habilitado en https://huggingface.co/settings/inference-providers
    modelId: loadEnv('HF_CHAT_MODEL', 'meta-llama/Llama-3.2-3B-Instruct:fastest'),
  },
};

/** Comprueba si hay al menos un token configurado (para avisos en arranque). */
export function hasAnyExternalApiKey() {
  return !!(apiKeys.wishapp.token || apiKeys.huggingface.token);
}

/** Indica si WishApp está configurado (balance). */
export function isWishAppConfigured() {
  return !!apiKeys.wishapp.token;
}

/** Indica si Hugging Face está configurado (chat). */
export function isHuggingFaceConfigured() {
  return !!apiKeys.huggingface.token;
}
