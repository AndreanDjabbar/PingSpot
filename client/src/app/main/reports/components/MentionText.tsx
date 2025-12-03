"use client";

import React from 'react';
import Link from 'next/link';

interface MentionTextProps {
    text: string;
    className?: string;
}

const MentionText: React.FC<MentionTextProps> = ({ text, className = "" }) => {
    const parseTextWithMentions = (text: string) => {
        const mentionRegex = /@(\w+)/g;
        const parts: Array<{ type: 'text' | 'mention'; content: string }> = [];
        let lastIndex = 0;
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.substring(lastIndex, match.index)
                });
            }

            parts.push({
                type: 'mention',
                content: match[1]
            });

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.substring(lastIndex)
            });
        }

        return parts;
    };

    const parts = parseTextWithMentions(text);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.type === 'mention') {
                    return (
                        <Link
                            key={index}
                            href={`/main/profile/${part.content}`}
                            className="text-sky-600 hover:text-sky-700 font-medium hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            @{part.content}
                        </Link>
                    );
                }
                return <span key={index}>{part.content}</span>;
            })}
        </span>
    );
};

export default MentionText;
