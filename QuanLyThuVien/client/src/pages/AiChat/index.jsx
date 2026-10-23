import React, { useState, useCallback } from 'react';
import { message } from 'antd';
import { Menu, Plus, Sparkles } from 'lucide-react';
import Header from '../../components/layout/Header';
import ChatSidebar from './ChatSidebar';
import ChatCanvas from './ChatCanvas';
import ChatInput from './ChatInput';
import { requestAiChat } from '../../config/aiRequest';
import { useAuth } from '../../contexts/AuthContext';

// CSS cho typing dots (inject vào head)
const TYPING_CSS = `
@keyframes blink {
    0% { opacity: 0.2; transform: scale(0.8); }
    20% { opacity: 1; transform: scale(1); }
    100% { opacity: 0.2; transform: scale(0.8); }
}`;
if (!document.getElementById('ai-chat-style')) {
    const style = document.createElement('style');
    style.id = 'ai-chat-style';
    style.textContent = TYPING_CSS;
    document.head.appendChild(style);
}

// ── Conversation management (localStorage) ───────────────────────
const STORAGE_KEY = 'ai_conversations';

const loadConversations = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
};

const saveConversations = (convs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
};

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// ── Main Page ────────────────────────────────────────────────────
const AiChatPage = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState(loadConversations);
    const [activeId, setActiveId] = useState(conversations[0]?.id || null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const activeConv = conversations.find(c => c.id === activeId);
    const messages = activeConv?.messages || [];

    // ── Helpers ────────────────────────────────────────────────
    const updateConversations = (newConvs) => {
        setConversations(newConvs);
        saveConversations(newConvs);
    };

    const newConversation = () => {
        const id = genId();
        const conv = { id, title: 'Cuộc trò chuyện mới', messages: [] };
        const newConvs = [conv, ...conversations];
        updateConversations(newConvs);
        setActiveId(id);
        setInput('');
    };

    const deleteConversation = (id) => {
        const filtered = conversations.filter(c => c.id !== id);
        updateConversations(filtered);
        if (activeId === id) setActiveId(filtered[0]?.id || null);
    };

    const addMessage = (convId, msg) => {
        setConversations(prev => {
            const updated = prev.map(c => {
                if (c.id !== convId) return c;
                const newMsgs = [...c.messages, msg];
                const title = c.messages.length === 0 && msg.role === 'user'
                    ? msg.content.slice(0, 45) + (msg.content.length > 45 ? '...' : '')
                    : c.title;
                return { ...c, messages: newMsgs, title };
            });
            saveConversations(updated);
            return updated;
        });
    };

    // ── Send message ───────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        const text = input.trim();
        if (!text || loading) return;

        // Tạo conversation mới nếu chưa có
        let convId = activeId;
        if (!convId) {
            convId = genId();
            const conv = { id: convId, title: text.slice(0, 45), messages: [] };
            const newConvs = [conv, ...conversations];
            updateConversations(newConvs);
            setActiveId(convId);
        }

        const userMsg = { role: 'user', content: text };
        addMessage(convId, userMsg);
        setInput('');
        setLoading(true);

        try {
            // Lấy history để gửi context
            const history = conversations.find(c => c.id === convId)?.messages || [];
            const groqMessages = [...history, userMsg].map(m => ({
                role: m.role,
                content: m.content,
            }));

            const res = await requestAiChat(groqMessages);
            const aiMsg = {
                role: 'assistant',
                content: res.metadata.content,
                suggestedBooks: res.metadata.suggestedBooks || [],
            };
            addMessage(convId, aiMsg);
        } catch (err) {
            message.error('Không thể kết nối AI. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [input, loading, activeId, conversations]);

    // ── Copy ───────────────────────────────────────────────────
    const handleCopy = (idx, text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(idx);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            <Header />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <ChatSidebar
                    conversations={conversations}
                    activeId={activeId}
                    onSelect={setActiveId}
                    onNew={newConversation}
                    onDelete={deleteConversation}
                />

                {/* Main area */}
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Desktop sub-header */}
                    <div className="hidden md:flex h-12 border-b border-gray-100 items-center justify-between px-6 bg-white/80 backdrop-blur-sm shrink-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <Sparkles size={14} style={{ color: '#a30014' }} />
                            {activeConv?.title || 'AI Gợi Ý Sách'}
                        </div>
                        <button onClick={newConversation}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            <Plus size={13} /> Mới
                        </button>
                    </div>

                    {/* Mobile: new conversation button */}
                    <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-gray-100 shrink-0">
                        <span className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">
                            {activeConv?.title || 'AI Gợi Ý Sách'}
                        </span>
                        <button onClick={newConversation}
                            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Chat canvas */}
                    <ChatCanvas
                        messages={messages}
                        isLoading={loading}
                        copiedId={copiedId}
                        onCopy={handleCopy}
                    />

                    {/* Input */}
                    <div className="shrink-0 border-t border-gray-100 bg-white">
                        <ChatInput
                            value={input}
                            onChange={setInput}
                            onSubmit={handleSubmit}
                            isLoading={loading}
                            showQuickPrompts={messages.length === 0}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AiChatPage;
