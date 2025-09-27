"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaReply, FaEllipsisV, FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { BiSend } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageURL } from '@/utils/getImageURL';
import { formattedDate } from '@/utils/getFormattedDate';

export interface CommentType {
    id: number;
    content: string;
    createdAt: number;
    updatedAt: number;
    userId: number;
    userName: string;
    fullName: string;
    profilePicture?: string;
    parentId?: number;
    replies?: CommentType[];
}

interface CommentSectionProps {
    reportId?: number;
    comments: CommentType[];
    currentUserId: number;
    onAddComment: (content: string, parentId?: number) => void;
    onEditComment?: (commentId: number, content: string) => void;
    onDeleteComment?: (commentId: number) => void;
    isLoading?: boolean;
}

interface CommentItemProps {
    comment: CommentType;
    currentUserId: number;
    level?: number;
    onReply: (content: string, parentId: number) => void;
    onEdit?: (commentId: number, content: string) => void;
    onDelete?: (commentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
    comment, 
    currentUserId, 
    level = 0, 
    onReply,
    onEdit,
    onDelete 
}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showMenu, setShowMenu] = useState(false);
    const [liked, setLiked] = useState(false);
    const replyInputRef = useRef<HTMLTextAreaElement>(null);
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isReplying && replyInputRef.current) {
            replyInputRef.current.focus();
        }
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [isReplying, isEditing]);

    const handleReply = () => {
        if (replyContent.trim()) {
            onReply(replyContent, comment.id);
            setReplyContent('');
            setIsReplying(false);
        }
    };

    const handleEdit = () => {
        if (editContent.trim() && onEdit) {
            onEdit(comment.id, editContent);
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(comment.id);
        }
        setShowMenu(false);
    };

    const marginLeft = Math.min(level * 20, 60);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
            style={{ marginLeft: `${marginLeft}px` }}
        >
            <div className="flex space-x-3">
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow">
                        <Image 
                            src={getImageURL(comment.profilePicture || '', "user")}
                            alt={comment.fullName}
                            width={32}
                            height={32}
                            className="object-cover h-full w-full"
                        />
                    </div>
                </div>
                
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl px-4 py-3 relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm text-gray-900">
                                    {comment.fullName}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formattedDate(comment.createdAt, { formatStr: 'dd MMM yyyy, HH:mm' })}
                                </span>
                            </div>
                            
                            {comment.userId === currentUserId && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                        <FaEllipsisV className="w-3 h-3 text-gray-400" />
                                    </button>
                                    
                                    {showMenu && (
                                        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-10 py-1 w-32">
                                            <button
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setShowMenu(false);
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    ref={editInputRef}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    rows={2}
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditContent(comment.content);
                                        }}
                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleEdit}
                                        disabled={!editContent.trim()}
                                        className="px-3 py-1 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-800 text-sm leading-relaxed">
                                {comment.content}
                            </p>
                        )}
                    </div>
                    
                    {!isEditing && (
                        <div className="flex items-center space-x-4 mt-2 ml-2">
                            <button
                                onClick={() => setLiked(!liked)}
                                className={`flex items-center space-x-1 text-xs font-medium transition-colors ${
                                    liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                }`}
                            >
                                {liked ? <FaHeart className="w-3 h-3" /> : <FaRegHeart className="w-3 h-3" />}
                                <span>Suka</span>
                            </button>
                            
                            <button
                                onClick={() => setIsReplying(true)}
                                className="flex items-center space-x-1 text-xs font-medium text-gray-500 hover:text-sky-600 transition-colors"
                            >
                                <FaReply className="w-3 h-3" />
                                <span>Balas</span>
                            </button>
                        </div>
                    )}
                    
                    {isReplying && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 ml-2"
                        >
                            <div className="flex space-x-2">
                                <div className="flex-shrink-0">
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                                        <Image 
                                            src={getImageURL('', "user")}
                                            alt="Current User"
                                            width={24}
                                            height={24}
                                            className="object-cover h-full w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={replyInputRef}
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder={`Balas ${comment.fullName}...`}
                                        className="w-full p-3 pr-12 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                                        rows={2}
                                    />
                                    <div className="absolute bottom-2 right-2 flex space-x-1">
                                        <button
                                            onClick={() => {
                                                setIsReplying(false);
                                                setReplyContent('');
                                            }}
                                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleReply}
                                            disabled={!replyContent.trim()}
                                            className="p-2 text-sky-600 hover:text-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <BiSend className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3">
                            {comment.replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUserId={currentUserId}
                                    level={level + 1}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export const CommentSection: React.FC<CommentSectionProps> = ({
    comments,
    currentUserId,
    onAddComment,
    onEditComment,
    onDeleteComment,
    isLoading = false
}) => {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const commentInputRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async () => {
        if (!newComment.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await onAddComment(newComment);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = (content: string, parentId: number) => {
        onAddComment(content, parentId);
    };

    // Organize comments into threads
    const organizeComments = (comments: CommentType[]): CommentType[] => {
        const commentMap = new Map<number, CommentType>();
        const rootComments: CommentType[] = [];

        // First pass: create comment map
        comments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: organize into threads
        comments.forEach(comment => {
            const commentWithReplies = commentMap.get(comment.id)!;
            
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) {
                    parent.replies = parent.replies || [];
                    parent.replies.push(commentWithReplies);
                }
            } else {
                rootComments.push(commentWithReplies);
            }
        });

        return rootComments;
    };

    const threadedComments = organizeComments(comments);

    return (
        <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Komentar ({comments.length})
            </h3>
            
            {/* Add Comment */}
            <div className="mb-6">
                <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow">
                            <Image 
                                src={getImageURL('', "user")}
                                alt="Current User"
                                width={32}
                                height={32}
                                className="object-cover h-full w-full"
                            />
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <textarea
                            ref={commentInputRef}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Tulis komentar Anda..."
                            className="w-full p-4 pr-16 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                            rows={3}
                            disabled={isLoading || isSubmitting}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!newComment.trim() || isSubmitting || isLoading}
                            className="absolute bottom-3 right-3 p-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <BiSend className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
                <AnimatePresence>
                    {threadedComments.length > 0 ? (
                        threadedComments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                currentUserId={currentUserId}
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