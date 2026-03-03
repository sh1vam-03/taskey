"use client";

import ChatWindow from '@/components/ai/ChatWindow';
import ChatInput from '@/components/ai/ChatInput';

export default function ChatIdPage() {
    return (
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden bg-[#0d0d0d]">
            <ChatWindow />
            <ChatInput />
        </div>
    );
}
