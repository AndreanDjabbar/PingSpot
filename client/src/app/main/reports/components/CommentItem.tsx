/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaReply, FaEllipsisV, FaHeart, FaRegHeart } from 'react-icons/fa';
import { BiSend } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { getImageURL, getFormattedDate as formattedDate } from '@/utils';
import { useUserProfileStore, useImagePreviewModalStore } from '@/stores';
import MentionInput, { MentionUser } from './MentionInput';
import MentionText from './MentionText';
import { Button } from '@/components/UI';
import { IReportComment } from '@/types/model/report';

interface CommentItemProps {
    comment: IReportComment;
    level?: number;
    variant: 'full' | 'compact';
    showLikes: boolean;
    availableUsers?: MentionUser[];
    onReply: (content: string, parentId: number, threadRootId?: number, mentions?: number[]) => void;
    onEdit?: (commentId: number, content: string, mentions?: number[]) => void;
    onDelete?: (commentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
    comment, 
    level = 0, 
    variant = 'full',
    showLikes = true,
    availableUsers = [],
    onReply,
    onEdit,
    onDelete 
}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyMentions, setReplyMentions] = useState<number[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [editMentions, setEditMentions] = useState<number[]>(comment.mentions || []);
    const [showMenu, setShowMenu] = useState(false);
    const [liked, setLiked] = useState(false);
    const replyInputRef = useRef<HTMLTextAreaElement>(null);
    const editInputRef = useRef<HTMLTextAreaElement>(null); 
    const userProfile = useUserProfileStore((s) => s.userProfile);
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const openPreviewModal = useImagePreviewModalStore((s) => s.openImagePreview);

    useEffect(() => {
        if (isReplying && replyInputRef.current) {
            replyInputRef.current.focus();
            setReplyContent(`@${comment.userInformation.username} `);
        }
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [isReplying, isEditing, comment.userInformation.username]);

    const handleReply = () => {
        if (replyContent.trim()) {
            const threadRootId = Number(comment.commentID);
            onReply(replyContent, Number(comment.commentID), Number(threadRootId), replyMentions);
            setReplyContent('');
            setReplyMentions([]);
            setIsReplying(false);
        }
    };

    const handleEdit = () => {
        if (editContent?.trim() && onEdit) {
            onEdit(Number(comment.commentID), editContent, editMentions);
            setIsEditing(false);
        }
    };

    const handleImageClick = (imageURL: string) => {
        openPreviewModal(imageURL);
    }

    const handleDelete = () => {
        if (onDelete) {
            onDelete(Number(comment.commentID));
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
                                src={getImageURL(comment.userInformation.profilePicture || '', "user")}
                                alt={comment.userInformation.fullName}
                                width={24}
                                height={24}
                                className="object-cover h-full w-full"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                    <div className="flex items-start space-x-2">
                        <span className="font-semibold text-sm text-gray-900 shrink-0">
                            {comment.userInformation.username}
                        </span>
                        <span className="text-sm text-gray-800 break-words">
                            <MentionText 
                            text={comment.content || ""}
                            userMentioned={comment.replyTo || null} 
                            />
                        </span>
                    </div>
                        {comment.media && (
                            <div className="mt-2">
                                {comment.media.type === 'IMAGE' || comment.media.type === 'gif' ? (
                                    <div className="relative rounded-lg overflow-hidden max-w-[200px]">
                                        <Image
                                            src={getImageURL(`/report/comments/${comment.media.url}`, "main")}
                                            onClick={() => handleImageClick(getImageURL(`/report/comments/${comment?.media?.url}`, "main"))}
                                            alt="Comment media"
                                            width={comment?.media?.width || 200}
                                            height={comment?.media?.height || 150}
                                            className="object-cover w-full h-auto"
                                        />
                                    </div>
                                ) : null}
                            </div>
                        )}
                        
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
                                            src={getImageURL(userProfile?.profilePicture || '', "user")}
                                            alt="Current User"
                                            width={20}
                                            height={20}
                                            className="object-cover h-full w-full"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <MentionInput
                                            value={replyContent}
                                            onChange={setReplyContent}
                                            onMentionsChange={setReplyMentions}
                                            placeholder={`Balas ${comment.userInformation.username}...`}
                                            className="w-full p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-white"
                                            rows={2}
                                            users={availableUsers}
                                            autoFocus
                                        />
                                        <div className="flex justify-end space-x-1 mt-1">
                                            <Button
                                                onClick={() => {
                                                    setIsReplying(false);
                                                    setReplyContent('');
                                                    setReplyMentions([]);
                                                }}
                                            >
                                                Batal
                                            </Button>
                                            <button
                                                onClick={handleReply}
                                                disabled={!replyContent.trim()}
                                                className="text-xs text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 px-3 py-1 rounded"
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
                                        key={reply.commentID}
                                        comment={reply}
                                        level={level + 1}
                                        variant={variant}
                                        showLikes={showLikes}
                                        availableUsers={availableUsers}
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
            <div className="flex items-start">
                <div className="pt-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow">
                        <Image 
                            src={getImageURL(comment?.userInformation?.profilePicture || '', "user")}
                            alt={comment?.userInformation?.username || 'User'}
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
                                    {comment?.userInformation?.username || 'User'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formattedDate(comment.createdAt, { formatStr: 'dd MMM yyyy, HH:mm' })}
                                </span>
                            </div>
                            
                            {Number(comment?.userInformation?.userID) === currentUserId && onEdit && onDelete && (
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
                                <MentionInput
                                    value={editContent || ''}
                                    onChange={setEditContent}
                                    onMentionsChange={setEditMentions}
                                    placeholder="Edit komentar..."
                                    className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    rows={2}
                                    users={availableUsers}
                                    autoFocus
                                />
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditContent(comment.content);
                                            setEditMentions(comment.mentions || []);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <button
                                        onClick={handleEdit}
                                        disabled={!editContent?.trim()}
                                        className="px-3 py-1 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-800 text-sm leading-relaxed">
                                    <MentionText 
                                    text={comment.content || ''} 
                                    userMentioned={comment.replyTo || null}
                                    />
                                </p>
                                
                                {comment.media && (
                                    <div className="mt-3">
                                        {comment.media.type === 'IMAGE' || comment.media.type === 'gif' ? (
                                            <div className="relative rounded-xl overflow-hidden max-w-[150px]">
                                                <Image
                                                    src={comment.commentType === 'TEMP' ? comment.media.url : getImageURL(`/report/comments/${comment.media.url}`, "main")}
                                                    alt="Comment media"
                                                    onClick={() => handleImageClick(getImageURL(`/report/comments/${comment?.media?.url}`, "main"))}
                                                    width={comment.media.width || 250}
                                                    height={comment.media.height || 180}
                                                    className="object-cover w-full h-auto"
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </>
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
                                onClick={() => {
                                    console.log("REPLY TO COMMENTID:", comment.commentID);
                                    setIsReplying(true)
                                }} 
                                className="flex items-center space-x-1 text-xs font-medium text-gray-500 hover:text-sky-600 transition-colors"
                            >
                                <FaReply className="w-3 h-3" />
                                <span>Balas</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-6">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.commentID}
                            comment={reply}
                            level={level + 1}
                            variant={variant}
                            showLikes={showLikes}
                            availableUsers={availableUsers}
                            onReply={onReply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
            {isReplying && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pl-5"
                >
                    <div className="flex flex-col w-full">
                        <div className='flex space-x-2 items-center ml-6'>
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                    <Image 
                                        src={getImageURL(userProfile?.profilePicture || '', "user")}
                                        alt="Current User"
                                        width={32}
                                        height={32}
                                        className="object-cover h-full w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <MentionInput
                                    value={replyContent}
                                    onChange={setReplyContent}
                                    onMentionsChange={setReplyMentions}
                                    placeholder={`Balas ${comment.userInformation.username}...`}
                                    rows={2}
                                    users={availableUsers}
                                    autoFocus
                                    onSubmit={handleReply}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-2">
                            <Button
                                onClick={() => {
                                    setIsReplying(false);
                                    setReplyContent('');
                                    setReplyMentions([]);
                                }}
                                variant='outline'
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleReply}
                                disabled={!replyContent.trim()}
                            >
                                <BiSend className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default CommentItem;