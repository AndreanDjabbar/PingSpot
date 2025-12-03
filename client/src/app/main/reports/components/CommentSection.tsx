"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FaComment } from 'react-icons/fa';
import { BiSend } from 'react-icons/bi';
import { AnimatePresence } from 'framer-motion';
import { getImageURL } from '@/utils';
import { useUserProfileStore } from '@/stores';
import CommentItem from './CommentItem';
import MentionInput, { MentionUser } from './MentionInput';
import { IReportComment } from '@/types/model/report';

interface CommentSectionProps {
    comments: IReportComment[];
    availableUsers?: MentionUser[];
    onAddComment: (content: string, parentId?: number, threadRootId?: number, mentions?: number[]) => void;
    onEditComment?: (commentId: number, content: string, mentions?: number[]) => void;
    onDeleteComment?: (commentId: number) => void;
    isLoading?: boolean;
    variant?: 'full' | 'compact';
    showLikes?: boolean;
}


const CommentSection: React.FC<CommentSectionProps> = ({
    comments,
    availableUsers = [],
    onAddComment,
    onEditComment,
    onDeleteComment,
    isLoading = false,
    variant = 'full',
    showLikes = true
}) => {
    const [newComment, setNewComment] = useState('');
    const [newCommentMentions, setNewCommentMentions] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const commentInputRef = useRef<HTMLTextAreaElement>(null);
    const userProfile = useUserProfileStore((s) => s.userProfile);

    const handleSubmit = async () => {
        if (!newComment.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await onAddComment(newComment, undefined, undefined, newCommentMentions);
            setNewComment('');
            setNewCommentMentions([]);
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = (content: string, parentId: number, threadRootId?: number, mentions?: number[]) => {
        onAddComment(content, parentId, threadRootId, mentions);
    };

    const organizeComments = (comments: IReportComment[]): IReportComment[] => {
        const commentMap = new Map<string, IReportComment & { replies: IReportComment[] }>();
        const rootComments: IReportComment[] = [];

        // First pass: Create a map of all comments with empty replies array
        comments.forEach(comment => {
            commentMap.set(comment.commentID, { ...comment, replies: [] });
        });

        // Second pass: Build the hierarchy
        comments.forEach(comment => {
            const commentWithReplies = commentMap.get(comment.commentID)!;
            
            // If this comment has a parentCommentID, it's a direct reply to that comment
            if (comment.parentCommentID) {
                const parentComment = commentMap.get(comment.parentCommentID);
                if (parentComment) {
                    // Add this comment as a reply to its parent
                    if (!parentComment.replies) {
                        parentComment.replies = [];
                    }
                    parentComment.replies.push(commentWithReplies);
                } else {
                    // If parent not found, treat as root comment
                    rootComments.push(commentWithReplies);
                }
            } 
            // If no parentCommentID but has threadRootID, it's a reply in a thread
            else if (comment.threadRootID) {
                const threadRoot = commentMap.get(comment.threadRootID);
                if (threadRoot) {
                    if (!threadRoot.replies) {
                        threadRoot.replies = [];
                    }
                    threadRoot.replies.push(commentWithReplies);
                } else {
                    // If thread root not found, treat as root comment
                    rootComments.push(commentWithReplies);
                }
            } 
            // No parent or thread root - this is a root comment
            else {
                rootComments.push(commentWithReplies);
            }
        });

        // Sort replies by createdAt (oldest first) for better readability
        const sortReplies = (comment: IReportComment & { replies: IReportComment[] }) => {
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.sort((a, b) => a.createdAt - b.createdAt);
                comment.replies.forEach(reply => sortReplies(reply as IReportComment & { replies: IReportComment[] }));
            }
        };

        rootComments.forEach(comment => sortReplies(comment as IReportComment & { replies: IReportComment[] }));
        
        // Sort root comments (you can change this to newest first if preferred)
        rootComments.sort((a, b) => b.createdAt - a.createdAt);

        return rootComments;
    };
    
    const threadedComments = organizeComments(comments);
    console.log("ORGANIZED COMMENTS:", threadedComments);
    const isCompact = variant === 'compact';

    return (
        <div className={`${!isCompact ? 'border-t border-gray-100 pt-4 mt-4' : ''}`}>
            {!isCompact && (
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Komentar ({comments.length})
                </h3>
            )}
            
            <div className={`${isCompact ? 'mb-4' : 'mb-6'}`}>
                <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                        <div className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full overflow-hidden ${isCompact ? 'border border-gray-200' : 'border-2 border-white shadow'}`}>
                            <Image 
                                src={getImageURL(userProfile?.profilePicture || '', "user")}
                                alt="Current User"
                                width={isCompact ? 24 : 32}
                                height={isCompact ? 24 : 32}
                                className="object-cover h-full w-full"
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <MentionInput
                            value={newComment}
                            onChange={setNewComment}
                            onMentionsChange={setNewCommentMentions}
                            placeholder="Tulis komentar Anda..."
                            className={`w-full ${isCompact ? 'p-2 text-sm' : 'p-4'} border border-gray-200 ${isCompact ? 'rounded-lg' : 'rounded-2xl'} resize-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white`}
                            rows={isCompact ? 2 : 3}
                            disabled={isLoading || isSubmitting}
                            users={availableUsers}
                            onSubmit={handleSubmit}
                        />
                        {isCompact ? (
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!newComment.trim() || isSubmitting || isLoading}
                                    className="px-3 py-1 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Kirim'
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!newComment.trim() || isSubmitting || isLoading}
                                    className="px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <BiSend className="w-4 h-4" />
                                            <span>Kirim</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
                <AnimatePresence>
                    {threadedComments.length > 0 ? (
                        threadedComments.map((comment) => (
                            <CommentItem
                                key={comment.commentID}
                                comment={comment}
                                variant={variant}
                                showLikes={showLikes}
                                availableUsers={availableUsers}
                                onReply={handleReply}
                                onEdit={onEditComment}
                                onDelete={onDeleteComment}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                                <FaComment className="w-12 h-12 mx-auto" />
                            </div>
                            <p className="text-gray-500">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CommentSection;