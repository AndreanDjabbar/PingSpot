"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Image from 'next/image';
import { getImageURL } from '@/utils';
import { TextAreaField } from '@/components/form';

export interface MentionUser {
    userId: number;
    userName: string;
    fullName: string;
    profilePicture?: string;
}

interface MentionInputProps {
    value: string;
    onChange: (value: string) => void;
    onMentionsChange: (mentions: number[]) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    onSubmit?: () => void;
    users?: MentionUser[];
}

const MentionInput: React.FC<MentionInputProps> = ({
    value,
    onChange,
    onMentionsChange,
    placeholder = "Write a comment...",
    rows = 2,
    disabled = false,
    autoFocus = false,
    onSubmit,
    users = []
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentionSearch, setMentionSearch] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const extractMentions = (text: string): number[] => {
        const mentionRegex = /@(\w+)/g;
        const matches = text.matchAll(mentionRegex);
        const mentionedUserIds: number[] = [];

        for (const match of matches) {
            const username = match[1];
            const user = users.find(u => u.userName === username);
            if (user && !mentionedUserIds.includes(user.userId)) {
                mentionedUserIds.push(user.userId);
            }
        }

        return mentionedUserIds;
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const newCursorPos = e.target.selectionStart;
        
        onChange(newValue);
        setCursorPosition(newCursorPos);

        const mentions = extractMentions(newValue);
        onMentionsChange(mentions);

        const textBeforeCursor = newValue.substring(0, newCursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            
            if (textAfterAt.includes(' ')) {
                setShowSuggestions(false);
                return;
            }

            setMentionSearch(textAfterAt);
            
            const filtered = users.filter(user => 
                user.userName.toLowerCase().includes(textAfterAt.toLowerCase()) ||
                user.fullName.toLowerCase().includes(textAfterAt.toLowerCase())
            ).slice(0, 5);

            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
            setSelectedIndex(0);
        } else {
            setShowSuggestions(false);
        }
    };

    const insertMention = (user: MentionUser) => {
        const textBeforeCursor = value.substring(0, cursorPosition);
        const textAfterCursor = value.substring(cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            const newValue = 
                textBeforeCursor.substring(0, lastAtIndex) + 
                `@${user.userName} ` + 
                textAfterCursor;
            
            onChange(newValue);
            
            const mentions = extractMentions(newValue);
            onMentionsChange(mentions);
            
            setShowSuggestions(false);
            
            setTimeout(() => {
                if (textareaRef.current) {
                    const newCursorPos = lastAtIndex + user.userName.length + 2;
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                    textareaRef.current.focus();
                }
            }, 0);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showSuggestions) {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onSubmit) {
                e.preventDefault();
                onSubmit();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
            case 'Tab':
                e.preventDefault();
                if (suggestions[selectedIndex]) {
                    insertMention(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowSuggestions(false);
                break;
        }
    };

    useEffect(() => {
        if (suggestionsRef.current) {
            const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    return (
        <div className="relative w-full" >
            <TextAreaField
            id='comment'
            withLabel
            placeHolder={placeholder}
            rows={rows}
            disableRowsResize
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onBlur={() => setShowSuggestions(false)}
            autoFocus={autoFocus}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            />

            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    style={{
                        bottom: '100%',
                        marginBottom: '4px',
                        minWidth: '250px',
                        maxWidth: '350px'
                    }}
                >
                    {suggestions.map((user, index) => (
                        <button
                            key={user.userId}
                            type="button"
                            onClick={() => insertMention(user)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 transition-colors ${
                                index === selectedIndex ? 'bg-sky-50' : ''
                            }`}
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                <Image
                                    src={getImageURL(user.profilePicture || '', 'user')}
                                    alt={user.fullName}
                                    width={32}
                                    height={32}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="font-medium text-sm text-gray-900 truncate">
                                    {user.fullName}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    @{user.userName}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* <div className="text-xs text-gray-400 mt-1">
                Tip: Type @ to mention users{onSubmit && ', press Ctrl+Enter to send'}
            </div> */}
        </div>
    );
};

export default MentionInput;
