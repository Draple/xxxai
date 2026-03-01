import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

const PROACTIVE_KEYS = ['chatProactive1', 'chatProactive2', 'chatProactive3', 'chatProactive4', 'chatProactive5', 'chatProactive6'];
const SYSTEM_AI_IDS = ['video', 'ideas', 'general'];
const STORAGE_KEY_PREFIX = 'xxxai_chat_pending_';
const INTERACTED_KEY_PREFIX = 'xxxai_chat_interacted_';

function randomBetween(minMs, maxMs) {
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
}

function loadPending(userId) {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + userId);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (data && typeof data === 'object') return data;
  } catch (_) {}
  return {};
}

function savePending(userId, pending) {
  if (!userId) return;
  try {
    if (Object.keys(pending).length === 0) {
      localStorage.removeItem(STORAGE_KEY_PREFIX + userId);
    } else {
      localStorage.setItem(STORAGE_KEY_PREFIX + userId, JSON.stringify(pending));
    }
  } catch (_) {}
}

function loadInteracted(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(INTERACTED_KEY_PREFIX + userId);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (_) {}
  return [];
}

function saveInteracted(userId, ids) {
  if (!userId) return;
  try {
    if (ids.length === 0) {
      localStorage.removeItem(INTERACTED_KEY_PREFIX + userId);
    } else {
      localStorage.setItem(INTERACTED_KEY_PREFIX + userId, JSON.stringify(ids));
    }
  } catch (_) {}
}

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const isOnChatPage = location.pathname === '/chat';

  const [pendingByAi, setPendingByAi] = useState(() => loadPending(user?.id));
  const [interactedAiIds, setInteractedAiIds] = useState(() => loadInteracted(user?.id));
  const timerRef = useRef(null);
  const interactedRef = useRef(interactedAiIds);

  useEffect(() => {
    interactedRef.current = interactedAiIds;
  }, [interactedAiIds]);

  useEffect(() => {
    if (user?.id) {
      setPendingByAi(loadPending(user.id));
      setInteractedAiIds(loadInteracted(user.id));
    }
  }, [user?.id]);

  useEffect(() => {
    if (!pendingByAi || !user?.id) return;
    savePending(user.id, pendingByAi);
  }, [pendingByAi, user?.id]);

  useEffect(() => {
    if (!interactedAiIds?.length || !user?.id) return;
    saveInteracted(user.id, interactedAiIds);
  }, [interactedAiIds, user?.id]);

  const markAiAsInteracted = useCallback((aiId) => {
    if (!aiId) return;
    setInteractedAiIds((prev) => (prev.includes(aiId) ? prev : [...prev, aiId]));
  }, []);

  const addProactiveMessage = useCallback(() => {
    const current = interactedRef.current || [];
    if (current.length === 0) return;
    const systemAllowed = SYSTEM_AI_IDS.filter((id) => current.includes(id));
    const allowed = systemAllowed.length > 0 ? systemAllowed : current;
    const aiId = allowed[Math.floor(Math.random() * allowed.length)];
    const key = PROACTIVE_KEYS[Math.floor(Math.random() * PROACTIVE_KEYS.length)];
    const text = t(key);
    const msg = { id: `ai-proactive-${Date.now()}`, role: 'ai', text, time: new Date().toISOString() };
    setPendingByAi((prev) => ({
      ...prev,
      [aiId]: [...(prev[aiId] || []), msg],
    }));
  }, [t]);

  // Mensajes proactivos deshabilitados (no se programan timers)
  useEffect(() => {
    if (!user || isOnChatPage) return;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [user, isOnChatPage]);

  const consumePending = useCallback(() => {
    const snapshot = { ...pendingByAi };
    setPendingByAi({});
    if (user?.id) savePending(user.id, {});
    return snapshot;
  }, [pendingByAi, user?.id]);

  const unreadCount = Object.values(pendingByAi || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  const hasInteractedWith = useCallback((aiId) => interactedAiIds.includes(aiId), [interactedAiIds]);

  const value = {
    pendingByAi,
    unreadCount,
    consumePending,
    markAiAsInteracted,
    hasInteractedWith,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
