import React from 'react';
import { MessageSquare, Plus, Library, Trash2 } from 'lucide-react';

const ChatSidebar = ({ conversations, activeId, onSelect, onNew, onDelete }) => {
    return (
        <aside className="hidden md:flex flex-col h-full w-64 shrink-0 border-r border-gray-100 bg-gray-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#a30014' }}>
                        <Library size={14} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 leading-none">Thư Viện AI</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Gợi ý sách thông minh</p>
                    </div>
                </div>
                <button onClick={onNew}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm">
                    <span className="font-medium">Cuộc trò chuyện mới</span>
                    <Plus size={15} className="text-gray-400" />
                </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-2">
                {conversations.length === 0 ? (
                    <div className="px-3 py-6 text-center">
                        <MessageSquare size={24} className="mx-auto mb-2 text-gray-200" />
                        <p className="text-xs text-gray-400">Chưa có cuộc trò chuyện nào</p>
                    </div>
                ) : (
                    <nav className="space-y-0.5">
                        {conversations.map(conv => (
                            <div key={conv.id} className="relative group">
                                <button onClick={() => onSelect(conv.id)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors
                                        ${conv.id === activeId
                                            ? 'bg-red-50 border-l-2 text-gray-900 font-semibold'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}
                                    `}
                                    style={conv.id === activeId ? { borderColor: '#a30014' } : {}}>
                                    <MessageSquare size={14} className={conv.id === activeId ? 'text-red-700' : 'text-gray-300'} />
                                    <span className="text-xs truncate flex-1">{conv.title}</span>
                                </button>
                                {/* Delete button on hover */}
                                <button onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md hover:bg-red-100 flex items-center justify-center text-gray-300 hover:text-red-500 transition-all">
                                    <Trash2 size={11} />
                                </button>
                            </div>
                        ))}
                    </nav>
                )}
            </div>

            {/* Footer hint */}
            <div className="p-3 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    AI có thể đưa ra thông tin chưa chính xác.<br />Vui lòng kiểm tra lại thông tin quan trọng.
                </p>
            </div>
        </aside>
    );
};

export default ChatSidebar;
