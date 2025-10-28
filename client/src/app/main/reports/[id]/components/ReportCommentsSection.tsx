"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { BiSend } from 'react-icons/bi';
import { getImageURL } from '@/utils';
import { ICommentType } from '@/types/model/report';
import CommentItem from '../../components/CommentItem';

interface ReportCommentsSectionProps {
    comments: ICommentType[];
    onSubmitComment: (content: string) => Promise<void>;
    onReply: (content: string, parentId: number) => void;
}

export const ReportCommentsSection: React.FC<ReportCommentsSectionProps> = ({ 
    comments, 
    onSubmitComment,
    onReply 
}) => {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitComment = async () => {
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmitComment(newComment.trim());
            setNewComment('');
        } catch (error) {
            console.error('Failed to submit comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                    Komentar ({comments.length})
                </h2>
            </div>

            <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                        <Image
                            src={getImageURL('', "user")}
                            alt="Your profile"
                            width={40}
                            height={40}
                            className="object-cover h-full w-full"
                        />
                    </div>
                    <div className="flex-1 flex gap-2">
                        <textarea
                            id="comment-input"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Tulis komentar Anda..."
                            className="flex-1 p-3 text-sm border border-gray-200 rounded-xl resize-none shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            rows={3}
                            disabled={isSubmitting}
                        />
                        <button
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim() || isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all h-fit shadow-sm hover:shadow-md"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <BiSend size={20} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-200">
                {comments.map((comment) => (
                    <div key={comment.id} className="p-6">
                        <CommentItem
                            comment={comment}
                            variant="full"
                            showLikes={true}
                            onReply={onReply}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
