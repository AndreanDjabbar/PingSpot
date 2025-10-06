"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaReply, FaEllipsisV, FaHeart, FaRegHeart } from 'react-icons/fa';
import { BiSend } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { getImageURL } from '@/utils/getImageURL';
import { formattedDate } from '@/utils/getFormattedDate';
import { useUserProfileStore } from '@/stores/userProfileStore';

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

interface CommentItemProps {
    comment: CommentType;
    level?: number;
    variant: 'full' | 'compact';
    showLikes: boolean;
    onReply: (content: string, parentId: number) => void;
    onEdit?: (commentId: number, content: string) => void;
    onDelete?: (commentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
    comment, 
    level = 0, 
    variant = 'full',
    showLikes = true,
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
    const { userProfile } = useUserProfileStore();
    const currentUserId = userProfile ? Number(userProfile.userID) : null;

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

    const isCompact = variant === 'compact';
    const marginLeft = isCompact ? Math.min(level * 16, 32) : Math.min(level * 20, 60);

    if (isCompact) {
        return (
            <div className="mb-3" style={{ marginLeft: `${marginLeft}px` }}>
                <div className="flex space-x-2">
                    <div className="flex-shrink-0">
                        <div className={`w-6 h-6 rounded-full overflow-hidden border border-gray-200`}>
                            <Image 
                                src={getImageURL(comment.profilePicture || '', "user")}
                                alt={comment.fullName}
                                width={24}
                                height={24}
                                className="object-cover h-full w-full"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-2">
                            <span className="font-semibold text-sm text-gray-900 shrink-0">
                                {comment.fullName}
                            </span>
                            <span className="text-sm text-gray-800 break-words">
                                {comment.content}
                            </span>
                        </div>
                        
                        <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-400">
                                {formattedDate(comment.createdAt, { formatStr: 'dd MMM yyyy' })}
                            </span>
                            <button
                                onClick={() => setIsReplying(true)}
                                className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                            >
                                Balas
                            </button>
                        </div>
                        
                        {isReplying && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2"
                            >
                                <div className="flex items-start space-x-2">
                                    <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                        <Image 
                                            src={getImageURL('', "user")}
                                            alt="Current User"
                                            width={20}
                                            height={20}
                                            className="object-cover h-full w-full"
                                        />
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={replyInputRef}
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder={`Balas ${comment.fullName}...`}
                                            className="w-full p-2 pr-8 text-sm border border-gray-200 rounded-lg resize-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-white"
                                            rows={2}
                                        />
                                        <div className="absolute bottom-1 right-1 flex space-x-1">
                                            <button
                                                onClick={() => {
                                                    setIsReplying(false);
                                                    setReplyContent('');
                                                }}
                                                className="text-xs text-gray-400 hover:text-gray-600"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                onClick={handleReply}
                                                disabled={!replyContent.trim()}
                                                className="text-xs text-sky-600 hover:text-sky-700 disabled:opacity-50"
                                            >
                                                Kirim
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-2">
                                {comment.replies.map((reply) => (
                                    <CommentItem
                                        key={reply.id}
                                        comment={reply}
                                        level={level + 1}
                                        variant={variant}
                                        showLikes={showLikes}
                                        onReply={onReply}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

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
                            
                            {comment.userId === currentUserId && onEdit && onDelete && (
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
                            {showLikes && (
                                <button
                                    onClick={() => setLiked(!liked)}
                                    className={`flex items-center space-x-1 text-xs font-medium transition-colors ${
                                        liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                    }`}
                                >
                                    {liked ? <FaHeart className="w-3 h-3" /> : <FaRegHeart className="w-3 h-3" />}
                                    <span>Suka</span>
                                </button>
                            )}
                            
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
                                    level={level + 1}
                                    variant={variant}
                                    showLikes={showLikes}
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

export default CommentItem;