import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import MessageBubble, { TypingBubble } from './MessageBubble';

const WelcomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
            style={{ backgroundColor: '#a30014' }}>
            <Sparkles size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Gợi Ý Sách</h2>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            Hỏi tôi bất cứ điều gì về sách! Tôi sẽ gợi ý những cuốn phù hợp nhất từ danh mục thư viện.
        </p>
    </div>
);

const ChatCanvas = ({ messages, isLoading, copiedId, onCopy }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    if (messages.length === 0 && !isLoading) {
        return <WelcomeScreen />;
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                {messages.map((msg, idx) => (
                    <MessageBubble
                        key={idx}
                        message={msg}
                        onCopy={() => onCopy(idx, msg.content)}
                        copied={copiedId === idx}
                    />
                ))}
                {isLoading && <TypingBubble />}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default ChatCanvas;
