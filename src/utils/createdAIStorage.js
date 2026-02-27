const STORAGE_KEY_PREFIX = 'xxxai_created_ais';

function getStorageKey(userId) {
  return `${STORAGE_KEY_PREFIX}_${userId || 'guest'}`;
}

export function getCreatedAIs(userId) {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return [];
  }
}

export function addCreatedAI(ai, userId) {
  const list = getCreatedAIs(userId);
  const entry = {
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...ai,
    createdAt: new Date().toISOString(),
  };
  list.unshift(entry);
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(list));
    return entry;
  } catch (_) {
    return null;
  }
}

export function removeCreatedAI(id, userId) {
  const list = getCreatedAIs(userId).filter((item) => item.id !== id);
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(list));
    return true;
  } catch (_) {
    return false;
  }
}
