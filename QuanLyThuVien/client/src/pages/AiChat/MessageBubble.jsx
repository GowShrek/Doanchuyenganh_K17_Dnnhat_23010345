import React from 'react';
import { Bot, Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import AiBookCard from './AiBookCard';

// ── Typing Indicator ──────────────────────────────────────────────
export const TypingBubble = () => (
    <div className="flex justify-start w-full gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: '#a30014' }}>
            <Bot size={16} className="text-white" />
        </div>
        <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center h-12">
            <div className="flex items-center gap-1">
                {[0, 0.2, 0.4].map((delay, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                        style={{ animation: `blink 1.4s ${delay}s infinite both` }} />
                ))}
            </div>
        </div>
    </div>
);

// ── Main MessageBubble ────────────────────────────────────────────
const MessageBubble = ({ message, onCopy, copied }) => {
    const isUser = message.role === 'user';

    if (isUser) {
        return (
            <div className="flex justify-end w-full">
                <div className="bg-gray-100 text-gray-900 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[75%] text-sm leading-relaxed border border-gray-200">
                    {message.content}
                </div>
            </div>
        );
    }

    // AI message
    return (
        <div className="flex justify-start w-full gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-0.5"
                style={{ backgroundColor: '#a30014' }}>
                <Bot size={16} className="text-white" />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 max-w-[95%] md:max-w-[85%]">
                {/* Text */}
                <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />') }} />

                {/* Book Cards */}
                {message.suggestedBooks?.length > 0 && (
                    <div className={`grid gap-3 mt-1
                        ${message.suggestedBooks.length === 1 ? 'grid-cols-1 max-w-xs' :
                          message.suggestedBooks.length === 2 ? 'grid-cols-2 max-w-sm' :
                          'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                        {message.suggestedBooks.map(book => (
                            <AiBookCard key={book.id} book={book} />
                        ))}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-1 mt-0.5">
                    <button onClick={() => onCopy(message.content)}
                        className="text-gray-300 hover:text-gray-500 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Sao chép">
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                    <button className="text-gray-300 hover:text-gray-500 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Hữu ích">
                        <ThumbsUp size={14} />
                    </button>
                    <button className="text-gray-300 hover:text-gray-500 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Không hữu ích">
                        <ThumbsDown size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
