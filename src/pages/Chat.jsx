import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useChat } from '../context/ChatContext';
import { getCreatedAIs } from '../utils/createdAIStorage';
import { sendChatMessage } from '../api/ai.js';

const AI_AVATAR = '/images/ai.svg';
const CHAT_ICON = 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';

const SYSTEM_AI_LIST = [
  { id: 'video', nameKey: 'chatAiVideo', welcomeKey: 'chatAiVideoWelcome', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id: 'ideas', nameKey: 'chatAiIdeas', welcomeKey: 'chatAiIdeasWelcome', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'general', nameKey: 'chatAiGeneral', welcomeKey: 'chatAiGeneralWelcome', icon: CHAT_ICON },
];

const FEED_AI_LIST = [
  { id: 'luna', displayName: 'Luna', imageUrl: '/images/background/1.jpg' },
  { id: 'stella', displayName: 'Stella', imageUrl: '/images/background/2.jpg' },
  { id: 'aurora', displayName: 'Aurora', imageUrl: '/images/background/3.jpg' },
  { id: 'nova', displayName: 'Nova', imageUrl: '/images/background/4.jpg' },
  { id: 'ivy', displayName: 'Ivy', imageUrl: '/images/background/5.jpg' },
  { id: 'scarlet', displayName: 'Scarlet', imageUrl: '/images/background/6.jpg' },
];

const PROACTIVE_KEYS = ['chatProactive1', 'chatProactive2', 'chatProactive3', 'chatProactive4', 'chatProactive5', 'chatProactive6'];
const STORAGE_CONVERSATIONS_KEY = 'xxxai_chat_conversations_';
const STORAGE_GROUPS_KEY = 'xxxai_chat_groups_';
const GROUP_ID_PREFIX = 'group-';
const MAX_GROUP_MEMBERS = 3;

function isGroupId(id) {
  return typeof id === 'string' && id.startsWith(GROUP_ID_PREFIX);
}

function loadConversations(userId) {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(STORAGE_CONVERSATIONS_KEY + userId);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : {};
  } catch (_) {}
  return {};
}

function saveConversations(userId, conversations) {
  if (!userId) return;
  try {
    localStorage.setItem(STORAGE_CONVERSATIONS_KEY + userId, JSON.stringify(conversations));
  } catch (_) {}
}

function loadGroups(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_GROUPS_KEY + userId);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter((g) => g && g.id && Array.isArray(g.aiIds) && g.aiIds.length >= 2 && g.aiIds.length <= MAX_GROUP_MEMBERS && g.name);
  } catch (_) {}
  return [];
}

function saveGroups(userId, groups) {
  if (!userId) return;
  try {
    localStorage.setItem(STORAGE_GROUPS_KEY + userId, JSON.stringify(groups));
  } catch (_) {}
}

function randomBetween(minMs, maxMs) {
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
}

/** Cuenta cuántos mensajes de la IA hay después del último mensaje del usuario. Máximo 2 permitidos. */
function countAiMessagesSinceLastUser(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return 0;
  let lastUserIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      lastUserIndex = i;
      break;
    }
  }
  let count = 0;
  for (let i = lastUserIndex + 1; i < messages.length; i++) {
    if (messages[i].role === 'ai') count++;
  }
  return count;
}

export default function Chat() {
  const { user, token: authToken } = useAuth();
  const { t } = useLanguage();
  const { consumePending, pendingByAi, markAiAsInteracted, hasInteractedWith } = useChat();
  const [searchParams, setSearchParams] = useSearchParams();
  const aiFromUrl = searchParams.get('ai');
  const userId = user?.id;

  const allAiList = useMemo(() => {
    const userAIs = getCreatedAIs(userId).map((ai) => ({
      id: ai.id,
      displayName: ai.name || t('tusAiUnnamed'),
      age: ai.age ?? null,
      welcomeKey: 'chatYourAiWelcome',
      welcomeName: ai.name || t('tusAiUnnamed'),
      icon: CHAT_ICON,
      imageUrl: ai.imageUrl || null,
    }));
    const feedAIs = FEED_AI_LIST.map((a) => ({
      id: a.id,
      displayName: a.displayName,
      welcomeKey: 'chatYourAiWelcome',
      welcomeName: a.displayName,
      icon: CHAT_ICON,
      imageUrl: a.imageUrl || null,
    }));
    const systemAIs = SYSTEM_AI_LIST.map((a) => ({
      id: a.id,
      displayName: t(a.nameKey),
      welcomeKey: a.welcomeKey,
      welcomeName: undefined,
      icon: a.icon,
      imageUrl: null,
    }));
    return [...userAIs, ...feedAIs, ...systemAIs];
  }, [t, userId]);

  const initialSelectedId = useMemo(() => {
    if (aiFromUrl && allAiList.some((a) => a.id === aiFromUrl)) return aiFromUrl;
    return null;
  }, [aiFromUrl, allAiList]);

  const [selectedAiId, setSelectedAiId] = useState(initialSelectedId);
  const [conversations, setConversations] = useState({});
  const [groups, setGroups] = useState([]);
  const [newlyReceivedFromAiIds, setNewlyReceivedFromAiIds] = useState([]);
  const [input, setInput] = useState('');
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [pickAiModalOpen, setPickAiModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupAiIds, setNewGroupAiIds] = useState([]);
  const listRef = useRef(null);
  const loadedUserIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [newMessagesNotification, setNewMessagesNotification] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);

  // En móvil (donde el dashboard muestra barra inferior), el chat abierto se muestra a pantalla completa encima
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobileLayout(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Cargar conversaciones y grupos guardados; fusionar mensajes pendientes (al entrar o al cambiar de usuario)
  useEffect(() => {
    if (!user?.id) return;
    if (loadedUserIdRef.current === user.id) return;
    loadedUserIdRef.current = user.id;
    const loadedGroups = loadGroups(user.id);
    setGroups(loadedGroups);
    const loaded = loadConversations(user.id);
    const pending = consumePending();
    const merged = { ...loaded };
    for (const [aiId, msgs] of Object.entries(pending || {})) {
      if (!msgs?.length) continue;
      merged[aiId] = [...(loaded[aiId] ?? []), ...msgs];
    }
    setConversations(merged);
    const aiIdsWithPending = Object.keys(pending || {}).filter((aiId) => (pending[aiId]?.length ?? 0) > 0);
    setNewlyReceivedFromAiIds(aiIdsWithPending);
    if (aiFromUrl) {
      const feedIds = FEED_AI_LIST.map((a) => a.id);
      const groupIds = loadedGroups.map((g) => g.id);
      const createdIds = getCreatedAIs(user.id).map((a) => a.id);
      const systemIds = SYSTEM_AI_LIST.map((a) => a.id);
      const valid = createdIds.includes(aiFromUrl) || systemIds.includes(aiFromUrl) || feedIds.includes(aiFromUrl) || groupIds.includes(aiFromUrl);
      if (valid) setSelectedAiId(aiFromUrl);
    }
  }, [user?.id, consumePending, aiFromUrl]);

  // Guardar conversaciones y grupos al cambiar (solo después de haber cargado las de este usuario)
  useEffect(() => {
    if (!user?.id || loadedUserIdRef.current !== user.id) return;
    saveConversations(user.id, conversations);
  }, [user?.id, conversations]);
  useEffect(() => {
    if (!user?.id || loadedUserIdRef.current !== user.id) return;
    saveGroups(user.id, groups);
  }, [user?.id, groups]);

  // La IA/grupo mostrado viene de la URL si ?ai= es válido; si no, del estado (sidebar)
  const isUrlAiValid = aiFromUrl && (allAiList.some((a) => a.id === aiFromUrl) || groups.some((g) => g.id === aiFromUrl));
  const effectiveSelectedId = isUrlAiValid ? aiFromUrl : selectedAiId;

  // Chats visibles: todos los grupos + conversaciones abiertas con IAs
  const openChatIds = useMemo(() => {
    const groupIds = groups.map((g) => g.id);
    const convIds = Object.keys(conversations).filter((id) => id && allAiList.some((a) => a.id === id));
    return Array.from(new Set([...groupIds, ...convIds]));
  }, [conversations, groups, allAiList]);

  // IDs de conversaciones (sin grupos) para la lista
  const chatSectionIds = useMemo(
    () => openChatIds.filter((id) => !groups.some((g) => g.id === id)),
    [openChatIds, groups]
  );
  const hasNoChats = groups.length === 0 && openChatIds.length === 0;

  const selectedGroup = groups.find((g) => g.id === effectiveSelectedId);
  const groupMembers = useMemo(() => {
    if (!selectedGroup) return [];
    return selectedGroup.aiIds.map((id) => allAiList.find((a) => a.id === id)).filter(Boolean);
  }, [selectedGroup, allAiList]);
  const selectedAi = !selectedGroup && effectiveSelectedId ? allAiList.find((a) => a.id === effectiveSelectedId) : null;
  const messages = conversations[effectiveSelectedId] ?? [];

  // Sin mensajes de bienvenida: no se inicializa conversación con mensaje de la IA

  // Al cambiar de chat, sincronizar ref y ocultar notificación
  useEffect(() => {
    prevMessagesLengthRef.current = messages.length;
    setNewMessagesNotification(0);
  }, [effectiveSelectedId]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
    setShowScrollToBottom(false);
  }, [messages, effectiveSelectedId]);

  // Detectar nuevos mensajes de la IA: notificación y scroll (solo si ya había mensajes, no en carga inicial)
  useEffect(() => {
    const prev = prevMessagesLengthRef.current;
    const current = messages.length;
    if (current <= prev) {
      prevMessagesLengthRef.current = current;
      return;
    }
    const newCount = current - prev;
    const newSlice = messages.slice(-newCount);
    const aiCount = newSlice.filter((m) => m.role === 'ai').length;
    prevMessagesLengthRef.current = current;
    if (aiCount > 0 && prev > 0) {
      setNewMessagesNotification(aiCount);
      const t = setTimeout(() => setNewMessagesNotification(0), 4000);
      return () => clearTimeout(t);
    }
  }, [messages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const check = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setShowScrollToBottom(scrollHeight - scrollTop - clientHeight > 80);
    };
    el.addEventListener('scroll', check, { passive: true });
    check();
    return () => el.removeEventListener('scroll', check);
  }, [effectiveSelectedId]);

  // Mensajes proactivos de la IA deshabilitados (no se programan timers)
  const proactiveTimerRef = useRef(null);
  useEffect(() => {
    if (!effectiveSelectedId) return;
    return () => {
      if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
      proactiveTimerRef.current = null;
    };
  }, [effectiveSelectedId]);

  const getMessageContent = (msg) => {
    if (msg.text) return msg.text;
    if (msg.replyKey) return t(msg.replyKey);
    if (msg.proactiveKey) return t(msg.proactiveKey);
    if (msg.welcomeKey) return t(msg.welcomeKey).replace('{{name}}', msg.welcomeName ?? '');
    if (msg.groupWelcome) return t('chatGroupWelcome').replace('{{name}}', msg.groupName || '').replace('{{names}}', msg.memberNames || '');
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || chatLoading) return;
    if (selectedGroup) {
      selectedGroup.aiIds.forEach((id) => markAiAsInteracted(id));
    } else {
      markAiAsInteracted(effectiveSelectedId);
    }
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text, time: new Date().toISOString() };
    const currentList = conversations[effectiveSelectedId] ?? [];
    setConversations((prev) => ({
      ...prev,
      [effectiveSelectedId]: [...(prev[effectiveSelectedId] ?? []), userMsg],
    }));
    setInput('');
    setChatLoading(true);
    const replyFromAiId = selectedGroup && groupMembers.length > 0 ? groupMembers[Math.floor(Math.random() * groupMembers.length)].id : null;

    const apiMessages = [
      ...currentList.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: getMessageContent(m) })),
      { role: 'user', content: text },
    ];

    const addAiMessage = (textOrKey, isKey = false) => {
      if (countAiMessagesSinceLastUser([...currentList, userMsg]) >= 2) return;
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        ...(isKey ? { replyKey: textOrKey } : { text: textOrKey }),
        time: new Date().toISOString(),
        ...(replyFromAiId ? { aiId: replyFromAiId } : {}),
      };
      setConversations((prev) => {
        const list = prev[effectiveSelectedId] || [];
        if (countAiMessagesSinceLastUser(list) >= 2) return prev;
        return { ...prev, [effectiveSelectedId]: [...list, aiMsg] };
      });
    };

    try {
      if (authToken) {
        const { reply } = await sendChatMessage(authToken, apiMessages);
        const replyText = typeof reply === 'string' ? reply.trim() : '';
        if (countAiMessagesSinceLastUser([...currentList, userMsg]) < 2) {
          addAiMessage(replyText || t('chatReplyPlaceholder'), !replyText);
        }
        setChatLoading(false);
        return;
      }
    } catch (e) {
      if (countAiMessagesSinceLastUser([...currentList, userMsg]) < 2) {
        addAiMessage(e.message || t('chatReplyPlaceholder'), false);
      }
    }
    setChatLoading(false);
    if (!authToken && countAiMessagesSinceLastUser([...currentList, userMsg]) < 2) {
      addAiMessage('chatReplyPlaceholder', true);
    }
  };

  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (!name || newGroupAiIds.length < 2 || newGroupAiIds.length > MAX_GROUP_MEMBERS) return;
    const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? GROUP_ID_PREFIX + crypto.randomUUID()
      : GROUP_ID_PREFIX + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    const group = { id, name, aiIds: [...newGroupAiIds] };
    const nextGroups = [...groups, group];
    setGroups(nextGroups);
    if (user?.id) saveGroups(user.id, nextGroups);
    setSelectedAiId(id);
    setSearchParams({ ai: id });
    setCreateGroupModalOpen(false);
    setNewGroupName('');
    setNewGroupAiIds([]);
  };

  const toggleGroupAi = (aiId) => {
    setNewGroupAiIds((prev) => {
      if (prev.includes(aiId)) return prev.filter((id) => id !== aiId);
      if (prev.length >= MAX_GROUP_MEMBERS) return prev;
      return [...prev, aiId];
    });
  };

  const handleCloseChat = () => {
    setSelectedAiId(null);
    setSearchParams({});
  };

  const chatPanelContent = effectiveSelectedId ? (
    <div className="flex-1 flex flex-col min-h-0 rounded-xl border border-onix-border bg-onix-card/40 overflow-hidden">
            <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 border-b border-onix-border flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCloseChat}
                className="flex items-center gap-2 px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg text-onix-muted hover:text-white hover:bg-onix-card transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
                aria-label={t('chatBack')}
              >
                <svg className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium text-sm sm:text-base">{t('chatBack')}</span>
              </button>
              <div className="min-w-0 flex-1">
                {selectedGroup ? (
                  <span className="font-semibold text-white text-base sm:text-lg md:text-xl truncate block">{selectedGroup.name}</span>
                ) : (
                  <span className="font-semibold text-white text-base sm:text-lg md:text-xl truncate block">{selectedAi?.displayName ?? ''}</span>
                )}
              </div>
              <span
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-onix-card/80 border border-onix-border flex items-center justify-center shrink-0 text-onix-muted hover:text-onix-accent hover:border-onix-accent/50 transition-colors"
                aria-label={t('chatGallery')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6a2 2 0 11-4 0 2 2 0 014 0zM4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
            <div className="flex-1 min-h-0 flex flex-col relative">
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scroll-smooth min-h-0 touch-pan-y"
                style={{ WebkitOverflowScrolling: 'touch' }}
                role="region"
                aria-label={t('chatMessages')}
              >
                <div className="p-3 sm:p-4 md:p-5 pb-6 sm:pb-8 space-y-3 sm:space-y-4 md:space-y-5">
                  {messages.map((msg) => {
                    const aiForMsg = msg.aiId ? allAiList.find((a) => a.id === msg.aiId) : (selectedGroup ? null : selectedAi);
                    const displayText = msg.groupWelcome
                      ? t('chatGroupWelcome').replace('{{name}}', msg.groupName || '').replace('{{names}}', msg.memberNames || '')
                      : msg.welcomeKey
                        ? t(msg.welcomeKey).replace('{{name}}', msg.welcomeName ?? '')
                        : msg.proactiveKey
                          ? t(msg.proactiveKey)
                          : msg.replyKey
                            ? t(msg.replyKey)
                            : msg.text;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 chat-message-enter ${msg.role === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[92%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] rounded-2xl px-4 py-2.5 sm:py-3 md:px-5 md:py-3.5 min-w-0 flex items-start gap-3 ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-onix-accent to-onix-accentDim text-white flex-row-reverse'
                              : 'bg-onix-bg/80 border border-onix-border text-zinc-200'
                          }`}
                        >
                          {msg.role === 'ai' && aiForMsg && (
                            <span className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex-shrink-0 overflow-hidden bg-onix-card border border-onix-border flex items-center justify-center">
                              {aiForMsg.imageUrl ? (
                                <img src={aiForMsg.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <svg className="w-5 h-5 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d={aiForMsg.icon ?? CHAT_ICON} />
                                </svg>
                              )}
                            </span>
                          )}
                          {msg.role === 'user' && (
                            <span className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex-shrink-0 bg-white/20 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            {msg.role === 'ai' && aiForMsg && (
                              <p className="text-sm font-medium text-onix-accent mb-1">{aiForMsg.displayName}</p>
                            )}
                            <p className="text-[15px] sm:text-base md:text-[16px] leading-relaxed whitespace-pre-wrap break-words">{displayText}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {chatLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 py-2.5 sm:py-3 bg-onix-bg/80 border border-onix-border flex items-center gap-3">
                        {(selectedAi || (selectedGroup && groupMembers[0])) && (
                          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 overflow-hidden bg-onix-card border border-onix-border flex items-center justify-center">
                            {(() => {
                              const ai = selectedAi || groupMembers[0];
                              return ai?.imageUrl ? (
                                <img src={ai.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <svg className="w-5 h-5 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d={ai?.icon ?? CHAT_ICON} />
                                </svg>
                              );
                            })()}
                          </span>
                        )}
                        <span className="chat-typing-dots flex items-center gap-1 text-onix-muted">
                          <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
                          <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
                          <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
                          <span className="sr-only">{t('chatAiWriting')}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {showScrollToBottom && (
                <button
                  type="button"
                  onClick={() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })}
                  className="absolute bottom-16 sm:bottom-4 md:bottom-5 right-3 sm:right-4 md:right-5 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-onix-card border border-onix-border shadow-lg flex items-center justify-center text-onix-muted hover:text-white hover:bg-onix-accent/20 transition-colors touch-manipulation"
                  aria-label={t('chatScrollToBottom')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              )}
              {newMessagesNotification > 0 && (
                <div
                  className="absolute bottom-2 left-3 right-3 sm:left-4 sm:right-4 z-10 py-2 px-3 rounded-xl bg-onix-accent/90 text-white text-sm font-medium text-center shadow-lg"
                  role="status"
                  aria-live="polite"
                >
                  {newMessagesNotification === 1
                    ? t('chatAiSentYouOneMessage')
                    : t('chatAiSentYouMessages').replace('{{count}}', String(newMessagesNotification))}
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-2 sm:p-3 md:p-4 border-t border-onix-border flex gap-2 sm:gap-3 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatPlaceholder')}
                className="input-base flex-1 min-h-[44px] sm:min-h-[48px] py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base px-3 sm:px-4"
                autoComplete="off"
              />
              <button type="submit" className="btn-primary px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base shrink-0 min-h-[44px] sm:min-h-[48px]" disabled={!input.trim() || chatLoading}>
                {chatLoading ? t('chatAiWriting') : t('chatSend')}
              </button>
            </form>
    </div>
  ) : null;

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 flex flex-col min-w-0 min-h-0 h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-5rem)] md:h-[calc(100vh-6.5rem)] lg:h-[calc(100vh-4rem)] min-h-[360px] sm:min-h-[400px] max-w-5xl mx-auto w-full overflow-hidden">
        {effectiveSelectedId && isMobileLayout &&
          createPortal(
            <div className="fixed inset-0 z-[60] bg-onix-bg flex flex-col overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
              {chatPanelContent}
            </div>,
            document.body
          )}
        {effectiveSelectedId && !isMobileLayout && chatPanelContent}
        {!effectiveSelectedId && (
          <>
            <div className="mb-2 sm:mb-4 md:mb-5 shrink-0">
              <h1 className="font-display font-bold text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tight mb-0.5 sm:mb-2">{t('menuChat')}</h1>
              <p className="text-onix-mutedLight text-sm sm:text-base md:text-base">{t('chatSubtitle')}</p>
            </div>

            <div className="flex-1 flex flex-col min-h-0 rounded-xl border border-onix-border bg-onix-card/40 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5 flex flex-col gap-2 sm:gap-2.5" style={{ WebkitOverflowScrolling: 'touch' }}>
            {hasNoChats ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 text-center min-h-[200px]">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-onix-card border border-onix-border flex items-center justify-center mb-4 sm:mb-5">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-onix-mutedLight text-lg sm:text-xl md:text-2xl font-medium mb-2">{t('chatStartChatting')}</p>
                <p className="text-onix-muted text-sm sm:text-base mb-6 max-w-xs sm:max-w-sm">{t('chatStartChattingHint')}</p>
                <button
                  type="button"
                  onClick={() => setPickAiModalOpen(true)}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 rounded-xl bg-gradient-to-r from-onix-accent to-onix-accentDim text-white font-medium text-sm sm:text-base hover:opacity-90 transition-opacity min-h-[44px]"
                >
                  {t('chatNewConversation')}
                </button>
              </div>
            ) : (
              /* Lista unificada: grupos + conversaciones */
              <>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPickAiModalOpen(true)}
                className="min-h-[44px] min-w-[44px] rounded-xl border border-dashed border-onix-border text-onix-muted hover:bg-onix-card hover:text-white hover:border-onix-accent/50 transition-all duration-200 flex items-center justify-center flex-1 sm:flex-none"
                title={t('chatNewConversation')}
                aria-label={t('chatNewConversation')}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-onix-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setCreateGroupModalOpen(true)}
                className="min-h-[44px] min-w-[44px] rounded-xl border border-dashed border-onix-border text-onix-muted hover:bg-onix-card hover:text-white hover:border-onix-accent/50 transition-all duration-200 flex items-center justify-center flex-1 sm:flex-none"
                title={t('chatCreateGroup')}
                aria-label={t('chatCreateGroup')}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-onix-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <p className="text-xs sm:text-sm font-medium text-onix-muted uppercase tracking-wider px-2 mt-2 sm:mt-3 shrink-0">{t('chatGroups')}</p>
            <div className="flex flex-col gap-1.5 sm:gap-2 shrink-0">
              {groups.map((group) => {
                const isSelected = effectiveSelectedId === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      setSelectedAiId(group.id);
                      setSearchParams({ ai: group.id });
                      setNewlyReceivedFromAiIds((prev) => prev.filter((id) => id !== group.id));
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 sm:py-3 md:py-3 rounded-xl text-left transition-all duration-200 min-w-0 min-h-[56px] sm:min-h-0 ${
                      isSelected
                        ? 'bg-gradient-accent-subtle border border-onix-accent/30 text-white shadow-glow-sm'
                        : 'border border-transparent text-onix-muted hover:bg-onix-card hover:text-white hover:border-onix-border'
                    }`}
                  >
                    <span className="w-12 h-12 min-w-[48px] min-h-[48px] sm:w-12 sm:h-12 rounded-xl bg-onix-card flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-onix-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                    <span className="font-medium text-base sm:text-lg truncate flex-1 min-w-0">{group.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs sm:text-sm font-medium text-onix-muted uppercase tracking-wider px-2 mt-2 sm:mt-3 shrink-0">{t('chatConversations')}</p>
            <div className="flex flex-col gap-1.5 sm:gap-2 shrink-0">
              {chatSectionIds.map((chatId) => {
                const isSelected = effectiveSelectedId === chatId;
                const group = groups.find((g) => g.id === chatId);
                const ai = allAiList.find((a) => a.id === chatId);
                const displayName = group ? group.name : (ai?.displayName || chatId);
                const pendingCount = !group && (pendingByAi?.[chatId]?.length ?? 0);
                const showBadge = pendingCount > 0;
                const hasNewlyReceived = newlyReceivedFromAiIds.includes(chatId);
                const handleDeleteChat = (e) => {
                  e.stopPropagation();
                  if (group) {
                    setGroups((prev) => prev.filter((g) => g.id !== chatId));
                    setConversations((prev) => {
                      const next = { ...prev };
                      delete next[chatId];
                      return next;
                    });
                  } else {
                    setConversations((prev) => {
                      const next = { ...prev };
                      delete next[chatId];
                      return next;
                    });
                  }
                  if (effectiveSelectedId === chatId) {
                    const rest = openChatIds.filter((id) => id !== chatId);
                    setSelectedAiId(rest[0] ?? null);
                    setSearchParams(rest[0] ? { ai: rest[0] } : {});
                  }
                };
                return (
                  <div key={chatId} className="flex items-center gap-2 group/row min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAiId(chatId);
                        setSearchParams({ ai: chatId });
                        setNewlyReceivedFromAiIds((prev) => prev.filter((id) => id !== chatId));
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 sm:py-3 md:py-3 rounded-xl text-left transition-all duration-200 flex-1 min-w-0 min-h-[56px] sm:min-h-0 ${
                        isSelected
                          ? 'bg-gradient-accent-subtle border border-onix-accent/30 text-white shadow-glow-sm'
                          : 'border border-transparent text-onix-muted hover:bg-onix-card hover:text-white hover:border-onix-border'
                      }`}
                    >
                      <span className="w-12 h-12 min-w-[48px] min-h-[48px] sm:w-12 sm:h-12 rounded-xl bg-onix-card flex items-center justify-center shrink-0 overflow-hidden relative">
                        {group ? (
                          <svg className="w-6 h-6 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        ) : ai?.imageUrl ? (
                          <img src={ai.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-onix-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={ai?.icon ?? CHAT_ICON} />
                          </svg>
                        )}
                        {showBadge && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-onix-accent text-white text-[10px] font-bold" title={t('chatNewMessages')} aria-label={t('chatNewMessages')}>
                            {pendingCount > 99 ? '99+' : pendingCount}
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-base sm:text-lg truncate flex-1 min-w-0">{displayName}</span>
                      {hasNewlyReceived && (
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-onix-accent" title={t('chatNewMessages')}>
                          {t('chatNew')}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteChat}
                      className="shrink-0 p-1.5 rounded-lg text-onix-muted hover:bg-onix-card hover:text-red-400 transition-colors sm:opacity-0 sm:group-hover/row:opacity-100"
                      title={t('chatDelete')}
                      aria-label={t('chatDelete')}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
              </>
            )}
            </div>
            </div>
          </>
        )}

        {/* Modal Crear grupo */}
        {createGroupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" role="dialog" aria-modal="true" aria-labelledby="create-group-title">
            <div className="bg-onix-card border border-onix-border rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-onix-border">
                <h2 id="create-group-title" className="font-display font-bold text-white text-lg">{t('chatCreateGroup')}</h2>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                <div>
                  <label htmlFor="group-name" className="block text-sm font-medium text-onix-muted mb-1">{t('chatGroupName')}</label>
                  <input
                    id="group-name"
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder={t('chatGroupNamePlaceholder')}
                    className="input-base w-full py-2.5 text-sm"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <p className="block text-sm font-medium text-onix-muted mb-2">{t('chatAddMembers')}</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allAiList.map((ai) => {
                      const checked = newGroupAiIds.includes(ai.id);
                      const disabled = !checked && newGroupAiIds.length >= MAX_GROUP_MEMBERS;
                      return (
                        <label
                          key={ai.id}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                            checked ? 'border-onix-accent/50 bg-onix-accent/10' : 'border-onix-border hover:bg-onix-bg/50'
                          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleGroupAi(ai.id)}
                            disabled={disabled}
                            className="rounded border-onix-border text-onix-accent focus:ring-onix-accent"
                          />
                          <span className="w-8 h-8 rounded-lg bg-onix-bg flex items-center justify-center shrink-0 overflow-hidden">
                            {ai.imageUrl ? (
                              <img src={ai.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-4 h-4 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={ai.icon} />
                              </svg>
                            )}
                          </span>
                          <span className="font-medium text-sm text-white truncate">{ai.displayName}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-onix-muted mt-1">
                    {newGroupAiIds.length}/{MAX_GROUP_MEMBERS}
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-onix-border flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setCreateGroupModalOpen(false); setNewGroupName(''); setNewGroupAiIds([]); }}
                  className="px-4 py-2.5 rounded-xl border border-onix-border text-onix-muted hover:text-white hover:border-onix-border/80 transition-colors text-sm"
                >
                  {t('close')}
                </button>
                <button
                  type="button"
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || newGroupAiIds.length < 2}
                  className="btn-primary px-4 py-2.5 text-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  {t('chatCreateGroupButton')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nueva conversación: elegir IA para chatear */}
        {pickAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" role="dialog" aria-modal="true" aria-labelledby="pick-ai-title">
            <div className="bg-onix-card border border-onix-border rounded-xl shadow-xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-onix-border">
                <h2 id="pick-ai-title" className="font-display font-bold text-white text-lg">{t('chatNewConversation')}</h2>
                <p className="text-sm text-onix-muted mt-1">{t('chatSelectAi')}</p>
              </div>
              <div className="p-3 overflow-y-auto flex-1">
                <div className="space-y-1">
                  {allAiList.map((ai) => (
                    <button
                      key={ai.id}
                      type="button"
                      onClick={() => {
                        setSelectedAiId(ai.id);
                        setSearchParams({ ai: ai.id });
                        setPickAiModalOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left border border-transparent hover:bg-onix-bg/50 hover:border-onix-border transition-colors"
                    >
                      <span className="w-10 h-10 rounded-lg bg-onix-bg flex items-center justify-center shrink-0 overflow-hidden">
                        {ai.imageUrl ? (
                          <img src={ai.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={ai.icon} />
                          </svg>
                        )}
                      </span>
                      <span className="font-medium text-sm text-white truncate">{ai.displayName}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 border-t border-onix-border">
                <button
                  type="button"
                  onClick={() => setPickAiModalOpen(false)}
                  className="w-full px-4 py-2.5 rounded-xl border border-onix-border text-onix-muted hover:text-white hover:border-onix-border/80 transition-colors text-sm"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
