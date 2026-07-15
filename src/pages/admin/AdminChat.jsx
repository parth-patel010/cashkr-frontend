import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, Search, Send, Phone, User } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import './admin.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
const SOCKET_URL = API_BASE.replace(/\/api\/?$/, '');

export default function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState(false);
  const bottomRef = useRef(null);
  const selectedIdRef = useRef(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const selected = useMemo(
    () => conversations.find((c) => c._id === selectedId) || null,
    [conversations, selectedId],
  );

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data } = await adminService.getChatConversations({ search });
      setConversations(data.conversations || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingList(false);
    }
  }, [search]);

  const loadMessages = useCallback(async (id) => {
    if (!id) return;
    setLoadingThread(true);
    try {
      const { data } = await adminService.getChatMessages(id);
      setMessages(data.messages || []);
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, unreadByAdmin: 0 } : c)),
      );
    } catch (error) {
      console.error(error);
      setMessages([]);
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadConversations, 250);
    return () => clearTimeout(timer);
  }, [loadConversations]);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token, role: 'admin' },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => setOnline(true));
    socket.on('disconnect', () => setOnline(false));

    socket.on('chat:conversation', (conversation) => {
      if (!conversation?._id) return;
      setConversations((prev) => {
        const rest = prev.filter((c) => c._id !== conversation._id);
        return [conversation, ...rest];
      });
    });

    socket.on('chat:message', (payload) => {
      const conversation = payload?.conversation;
      const message = payload?.message;
      if (!conversation?._id || !message?._id) return;

      setConversations((prev) => {
        const rest = prev.filter((c) => c._id !== conversation._id);
        const unreadBump =
          selectedIdRef.current === conversation._id
            ? { ...conversation, unreadByAdmin: 0 }
            : conversation;
        return [unreadBump, ...rest];
      });

      if (selectedIdRef.current === conversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Optionally join room when selection changes — history still via REST
  }, [selectedId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedId || !text.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await adminService.sendChatMessage(selectedId, text.trim());
      setText('');
      if (data?.message) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
      if (data?.conversation) {
        setConversations((prev) => {
          const rest = prev.filter((c) => c._id !== data.conversation._id);
          return [data.conversation, ...rest];
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-chat">
      <aside className="admin-chat-list">
        <div className="admin-chat-list-header">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-800 text-slate-700">Live Chats</h3>
            <span className={`admin-badge ${online ? 'admin-badge-green' : 'admin-badge-gray'}`}>
              {online ? 'Live' : 'Offline'}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              className="admin-search pl-10 w-full"
              placeholder="Search name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-chat-list-body">
          {loadingList ? (
            <div className="p-6 text-sm text-slate-400">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-sm text-slate-400 text-center">
              No chats yet. When a user messages from the app, it appears here with name & phone.
            </div>
          ) : (
            conversations.map((c) => {
              const active = c._id === selectedId;
              return (
                <button
                  key={c._id}
                  type="button"
                  className={`admin-chat-item ${active ? 'active' : ''}`}
                  onClick={() => setSelectedId(c._id)}>
                  <div className="admin-chat-avatar">
                    {(c.userName || 'U').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="admin-chat-item-main">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {c.userName || 'User'}
                      </span>
                      {c.unreadByAdmin > 0 ? (
                        <span className="admin-badge admin-badge-blue">{c.unreadByAdmin}</span>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{c.userPhone || 'No phone'}</div>
                    <div className="text-[12px] text-slate-400 truncate mt-0.5">
                      {c.lastMessage || 'No messages yet'}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="admin-chat-thread">
        {!selected ? (
          <div className="admin-chat-empty">
            <MessageCircle size={36} className="text-slate-300" />
            <p>Select a chat to reply</p>
          </div>
        ) : (
          <>
            <div className="admin-chat-thread-header">
              <div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  <h3 className="font-800 text-slate-900">{selected.userName || 'User'}</h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Phone size={12} />
                  <span className="font-mono">{selected.userPhone || '—'}</span>
                </div>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-ghost text-xs"
                onClick={() => adminService.closeChat(selected._id).then(loadConversations)}>
                Close chat
              </button>
            </div>

            <div className="admin-chat-messages">
              {loadingThread ? (
                <div className="p-6 text-sm text-slate-400">Loading messages...</div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m._id}
                    className={`admin-chat-bubble ${m.senderType === 'admin' ? 'mine' : 'theirs'}`}>
                    <div className="admin-chat-bubble-text">{m.text}</div>
                    <div className="admin-chat-bubble-time">
                      {new Date(m.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form className="admin-chat-composer" onSubmit={sendMessage}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Reply to ${selected.userName || 'user'}...`}
                maxLength={2000}
              />
              <button type="submit" className="admin-btn admin-btn-primary" disabled={sending || !text.trim()}>
                <Send size={16} />
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
