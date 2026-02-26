'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect } from 'react';

export default function StreamingMessage({ content }) {
    const [displayedContent, setDisplayedContent] = useState('');

    useEffect(() => {
        if (!content) {
            setDisplayedContent('');
            return;
        }

        let timeoutId;

        // Fast queue system: If the raw text is further ahead than what we're showing,
        // we add characters rapidly every frame to 'catch up' smoothly.
        const diff = content.length - displayedContent.length;

        if (diff > 0) {
            // Speed curve: jump faster if the AI dumped a huge block (like when switching tabs)
            const charsToAdd = Math.max(1, Math.ceil(diff / 10));

            timeoutId = setTimeout(() => {
                setDisplayedContent(content.slice(0, displayedContent.length + charsToAdd));
            }, 25); // ~40 FPS typing speed
        } else if (diff < 0) {
            // Failsafe: if stream restarts or string corrupts, hard reset it
            setDisplayedContent(content);
        }

        return () => clearTimeout(timeoutId);
    }, [content, displayedContent]);

    if (!displayedContent && !content) return null;

    return (
        <div className="flex justify-start mb-4">
            <div className="max-w-[90%] md:max-w-[80%]">
                <div className="prose prose-invert prose-sm max-w-none text-[14px] leading-7 text-gray-200
                    prose-p:my-2 prose-headings:text-white prose-headings:font-semibold
                    prose-strong:text-cyan-300 prose-strong:font-semibold
                    prose-a:text-cyan-400 prose-a:no-underline
                    prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {displayedContent}
                    </ReactMarkdown>
                    {/* Blinking cursor */}
                    <span className="inline-block w-[2px] h-5 bg-cyan-400 ml-0.5 animate-pulse align-text-bottom" />
                </div>
            </div>
        </div>
    );
}
