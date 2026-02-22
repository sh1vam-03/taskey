'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function StreamingMessage({ content }) {
    if (!content) return null;

    return (
        <div className="flex justify-start mb-4">
            <div className="max-w-[90%] md:max-w-[80%]">
                <div className="prose prose-invert prose-sm max-w-none text-[14px] leading-7 text-gray-200
                    prose-p:my-2 prose-headings:text-white prose-headings:font-semibold
                    prose-strong:text-cyan-300 prose-strong:font-semibold
                    prose-a:text-cyan-400 prose-a:no-underline
                    prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                    {/* Blinking cursor */}
                    <span className="inline-block w-[2px] h-5 bg-cyan-400 ml-0.5 animate-pulse align-text-bottom" />
                </div>
            </div>
        </div>
    );
}
