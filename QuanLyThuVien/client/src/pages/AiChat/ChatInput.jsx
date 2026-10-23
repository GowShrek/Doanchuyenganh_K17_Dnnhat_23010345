import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

const QUICK_PROMPTS = [
    'Gợi ý sách kinh tế cho người mới',
    'Sách lập trình Python hay nhất',
    'Tiểu thuyết hay nên đọc',
    'Sách kỹ năng mềm cho sinh viên',
];

const ChatInput = ({ value, onChange, onSubmit, isLoading, showQuickPrompts }) => {
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 128) + 'px';
    }, [value]);

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div className="px-4 md:px-8 pb-6 pt-3 bg-gradient-to-t from-white via-white to-transparent">
            <div className="max-w-3xl mx-auto">
                {/* Quick prompts — chỉ hiện khi chưa có tin nhắn */}
                {showQuickPrompts && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {QUICK_PROMPTS.map((prompt, i) => (
                            <button key={i} onClick={() => { onChange(prompt); setTimeout(onSubmit, 50); }}
                                className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm">
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input box */}
                <div className="relative bg-white rounded-2xl border border-gray-200 shadow-md focus-within:ring-2 focus-within:border-transparent transition-all"
                    style={{ '--tw-ring-color': 'rgba(163, 0, 20, 0.2)' }}>
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        onKeyDown={handleKey}
                        disabled={isLoading}
                        placeholder="Hỏi AI về sách bạn muốn tìm..."
                        className="w-full bg-transparent border-none focus:ring-0 resize-none py-4 pl-4 pr-14 text-sm text-gray-800 placeholder-gray-400 max-h-32 overflow-y-auto outline-none"
                    />
                    <button onClick={onSubmit} disabled={!value.trim() || isLoading}
                        className="absolute right-3 bottom-3 w-8 h-8 rounded-full text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 shadow-sm"
                        style={{ backgroundColor: '#a30014' }}>
                        {isLoading
                            ? <Square size={12} fill="white" />
                            : <ArrowUp size={15} />
                        }
                    </button>
                </div>

                <p className="text-center text-[10px] text-gray-400 mt-2">
                    AI Thư Viện có thể đưa ra thông tin chưa chính xác. Vui lòng kiểm tra lại.
                </p>
            </div>
        </div>
    );
};

export default ChatInput;
