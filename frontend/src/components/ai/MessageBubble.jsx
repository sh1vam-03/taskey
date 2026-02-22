'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import VoicePlayer from '@/components/ai/VoicePlayer';

export default function MessageBubble({ message, audioUrl }) {
    const isUser = message.role === 'user';

    if (isUser) {
        return <UserBubble message={message} />;
    }

    return <AssistantBubble message={message} audioUrl={audioUrl} />;
}

function UserBubble({ message }) {
    const [showTime, setShowTime] = useState(false);

    return (
        <div className="flex justify-end mb-4 group">
            <div
                className="relative max-w-[85%] md:max-w-[70%]"
                onMouseEnter={() => setShowTime(true)}
                onMouseLeave={() => setShowTime(false)}
            >
                <div className="bg-[#2a2a2a] px-4 py-2.5 rounded-2xl rounded-tr-md text-[14px] leading-relaxed text-gray-100">
                    {message.content}
                </div>
                {showTime && message.createdAt && (
                    <div className="absolute -bottom-5 right-0 text-[10px] text-gray-600 whitespace-nowrap">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>
        </div>
    );
}

function AssistantBubble({ message, audioUrl }) {
    const [showTime, setShowTime] = useState(false);

    return (
        <div
            className="flex justify-start mb-4 group"
            onMouseEnter={() => setShowTime(true)}
            onMouseLeave={() => setShowTime(false)}
        >
            <div className="max-w-[90%] md:max-w-[80%] relative">
                <div className="prose prose-invert prose-sm max-w-none text-[14px] leading-7 text-gray-200
                    prose-p:my-2 prose-headings:text-white prose-headings:font-semibold
                    prose-strong:text-cyan-300 prose-strong:font-semibold
                    prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                    prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
                    prose-blockquote:border-cyan-500/30 prose-blockquote:bg-white/[0.02] prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-3
                    prose-table:text-sm prose-th:text-gray-300 prose-td:text-gray-400
                    prose-hr:border-white/10">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');

                                if (!inline && match) {
                                    return (
                                        <CodeBlock language={match[1]} code={codeString} />
                                    );
                                }

                                return (
                                    <code
                                        className="bg-white/10 rounded px-1.5 py-0.5 text-[13px] text-cyan-300 font-mono"
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>

                {/* Voice Player */}
                {audioUrl && (
                    <div className="mt-2">
                        <VoicePlayer audioUrl={audioUrl} />
                    </div>
                )}

                {/* Timestamp */}
                {showTime && message.createdAt && (
                    <div className="mt-1 text-[10px] text-gray-600">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>
        </div>
    );
}

function CodeBlock({ language, code }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    return (
        <div className="rounded-xl bg-[#0a0a0a] border border-white/[0.06] my-4 overflow-hidden not-prose">
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/[0.06]">
                <span className="text-[11px] text-gray-500 font-mono">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-white transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{
                    margin: 0,
                    padding: '16px',
                    background: 'transparent',
                    fontSize: '13px',
                    lineHeight: '1.5',
                }}
                wrapLongLines
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}
