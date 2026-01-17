/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaReply, FaEllipsisV, FaHeart, FaRegHeart, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BiSend } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { getImageURL, getFormattedDate as formattedDate } from '@/utils';
import { useUserProfileStore, useImagePreviewModalStore } from '@/stores';
import { useGetReportCommentReplies } from '@/hooks/main';
import MentionInput, { MentionUser } from './MentionInput';
import MentionText from './MentionText';
import { Button } from '@/components/UI';
import { IReportComment } from '@/types/model/report';
import { ICreateReportCommentRequest } from '@/types/api/report';
import { ImagePreview, InlineImageUpload } from '@/components/form';

interface CommentItemProps {
    comment: IReportComment;
    commentReplies?: IReportComment[];
    onChangeCommentReplies?: (replies: IReportComment[]) => void;
    level?: number;
    variant: 'full' | 'compact';
    showLikes: boolean;
    availableUsers?: MentionUser[];
    onReply: (formData: ICreateReportCommentRequest) => void;
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
    const [replyMediaImage, setReplyMediaImage] = useState<File | null>(null);
    const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [editMentions, setEditMentions] = useState<number[]>(comment.mentions || []);
    const [showMenu, setShowMenu] = useState(false);
    const [liked, setLiked] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<IReportComment[]>([]);
    
    const replyInputRef = useRef<HTMLTextAreaElement>(null);
    const editInputRef = useRef<HTMLTextAreaElement>(null);
    const loadMoreButtonRef = useRef<HTMLDivElement>(null);
    const userProfile = useUserProfileStore((s) => s.userProfile);
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const openPreviewModal = useImagePreviewModalStore((s) => s.openImagePreview);

    const { 
        data: repliesData,
        isLoading: repliesLoading,
        fetchNextPage: fetchMoreReplies,
        hasNextPage: hasMoreReplies,
        isFetchingNextPage: isFetchingMoreReplies,
    } = useGetReportCommentReplies(
        comment.commentID,
        showReplies && !comment.parentCommentID
    );

    useEffect(() => {
        if (isReplying && replyInputRef.current) {
            replyInputRef.current.focus();
            setReplyContent(`@${comment.userInformation?.username || ''} `);
        }
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [isReplying, isEditing, comment.userInformation?.username]);

    useEffect(() => {
        if (repliesData) {
            const allReplies = repliesData.pages.flatMap(page => page.data?.replies.replies || []);
            setReplies(allReplies);
        }
    }, [repliesData]);

    const handleToggleReplies = () => {
        setShowReplies(!showReplies);
    };

    const handleReply = () => {
        if (replyContent.trim() || replyMediaImage) {
            onReply({
                commentContent: replyContent,
                mediaFile: replyMediaImage || undefined,
                mediaType: replyMediaImage ? 'IMAGE' : undefined,
                threadRootID: comment.threadRootID || comment.commentID,
                parentCommentID: comment.commentID,
            });
            setReplyContent('');
            setReplyMentions([]);
            setReplyMediaImage(null);
            setReplyImagePreview(null);
            setIsReplying(false);
            setShowReplies(true);
            if (hasMoreReplies) {
                setTimeout(() => {
                    loadMoreButtonRef.current?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }, 100);
            }
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
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-4"
                style={{ marginLeft: `${marginLeft}px` }}
            >
                <div className="flex space-x-2">
                    <div className="flex-shrink-0">
                        <div className={`w-6 h-6 rounded-full overflow-hidden border border-gray-200`}>
                            <Image 
                                src={getImageURL(comment.userInformation?.profilePicture || '', "user")}
                                alt={comment.userInformation?.fullName || 'User'}
                                width={24}
                                height={24}
                                className="object-cover h-full w-full"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-2">
                            <span className="font-semibold text-sm text-gray-900 shrink-0">
                                {comment.userInformation?.username || 'User'}
                            </span>
                            <span className="text-sm text-gray-800 break-words">
                                <MentionText 
                                commentUserID={Number(comment.userInformation?.userID || 0)}
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
                                            src={comment.commentType === 'TEMP' ? comment.media.url : getImageURL(`/report/comments/${comment.media.url}`, "main")}
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
                                {formattedDate(comment.createdAt, { formatStr: 'dd MMM yyyy, HH:mm' })}
                            </span>
                            <button
                                onClick={() => {
                                    setIsReplying(true)
                                    setShowReplies(true);
                                }}
                                className="text-xs text-gray-400 hover:text-gray-600 font-medium hover:cursor-pointer"
                            >
                                Balas
                            </button>
                            {comment.totalReplies !== undefined && comment.totalReplies > 0 && (
                                <button
                                    onClick={handleToggleReplies}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:cursor-pointer"
                                >
                                    {showReplies ? (
                                        <FaChevronUp className="w-3 h-3" />
                                    ) : (
                                        <FaReply className="w-3 h-3" />
                                    )}
                                    <span>
                                        {showReplies ? 'Sembunyikan' : `${comment.totalReplies} ${comment.totalReplies === 1 ? 'balasan' : 'balasan'}`}
                                    </span>
                                </button>
                            )}
                            <button
                                onClick={() => setIsReplying(true)}
                                className="text-xs text-gray-400 hover:text-gray-600 font-medium hover:cursor-pointer"
                            >
                                Suka
                            </button>
                        </div>
                        
                        {isReplying && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 ml-4"
                            >
                                <div className="flex flex-col w-full">
                                    {replyImagePreview && (
                                        <div className="ml-8 mb-2">
                                            <ImagePreview 
                                                preview={replyImagePreview}
                                                onRemove={() => {
                                                    setReplyMediaImage(null);
                                                    setReplyImagePreview(null);
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className='flex space-x-2 items-center'>
                                        <div className="flex-shrink-0">
                                            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                                                <Image 
                                                    src={getImageURL(userProfile?.profilePicture || '', "user")}
                                                    alt="Current User"
                                                    width={24}
                                                    height={24}
                                                    className="object-cover h-full w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 flex gap-2">
                                            <MentionInput
                                                value={replyContent}
                                                onChange={setReplyContent}
                                                onMentionsChange={setReplyMentions}
                                                placeholder={`Balas ${comment.userInformation?.username || 'pengguna'}...`}
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
                                                setReplyMediaImage(null);
                                                setReplyImagePreview(null);
                                            }}
                                            variant='outline'
                                        >
                                            Batal
                                        </Button>
                                        <InlineImageUpload
                                            preview={replyImagePreview}
                                            onImageSelect={(file) => {
                                                setReplyMediaImage(file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setReplyImagePreview(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }}
                                            onImageRemove={() => {
                                                setReplyMediaImage(null);
                                                setReplyImagePreview(null);
                                            }}
                                            maxSizeMB={5}
                                            buttonSize='sm'
                                            previewPosition="separate"
                                        />
                                        <Button
                                            onClick={handleReply}
                                            disabled={!replyContent.trim() && !replyMediaImage}
                                        >
                                            <BiSend className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        {showReplies && (
                            <div className="mt-4">
                                {repliesLoading && (
                                    <div className="text-sm text-gray-500 ml-4">
                                        Memuat balasan...
                                    </div>
                                )}
                                {replies.map((reply) => (
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
                                <div ref={loadMoreButtonRef}>
                                    {hasMoreReplies && !repliesLoading && (
                                        <button
                                            onClick={() => fetchMoreReplies()}
                                            disabled={isFetchingMoreReplies}
                                            className="ml-4 mt-2 text-xs text-sky-700 hover:text-sky-800 font-medium disabled:opacity-50"
                                        >
                                            {isFetchingMoreReplies ? 'Memuat...' : 'Muat lebih banyak'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {showLikes && (
                        <div className='flex flex-col items-center'>
                            <div>
                                {liked ? <FaHeart className="w-4 h-4 text-red-500" /> : <FaRegHeart className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" />}
                            </div>
                            <div className="text-xs text-gray-500">
                                72
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
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
                                    commentUserID={Number(comment.userInformation?.userID || 0)}
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
                                    className={`flex items-center space-x-1 text-xs font-medium transition-colors hover:cursor-pointer ${
                                        liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                    }`}
                                >
                                    {liked ? <FaHeart className="w-3 h-3" /> : <FaRegHeart className="w-3 h-3" />}
                                    <span>Suka</span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setIsReplying(true)
                                    setShowReplies(true);
                                }} 
                                className="flex items-center space-x-1 text-xs font-medium text-gray-500 hover:text-sky-600 transition-colors hover:cursor-pointer"
                            >
                                <FaReply className="w-3 h-3" />
                                <span>Balas</span>
                            </button>
                            {comment.totalReplies !== undefined && comment.totalReplies > 0 && (
                                <button
                                    onClick={handleToggleReplies}
                                    className="flex items-center space-x-1 text-xs font-semibold text-sky-700 hover:text-sky-800 transition-colors hover:cursor-pointer"
                                >
                                    {showReplies ? (
                                        <FaChevronUp className="w-3 h-3" />
                                    ) : (
                                        <FaReply className="w-3 h-3" />
                                    )}
                                    <span>
                                        {showReplies ? 'Sembunyikan balasan' : `Lihat ${comment.totalReplies} ${comment.totalReplies === 1 ? 'balasan' : 'balasan'}`}
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {isReplying && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pl-5"
                >
                    <div className="flex flex-col w-full">
                        {replyImagePreview && (
                            <div className="ml-16 mb-2">
                                <ImagePreview 
                                    preview={replyImagePreview}
                                    onRemove={() => {
                                        setReplyMediaImage(null);
                                        setReplyImagePreview(null);
                                    }}
                                />
                            </div>
                        )}
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
                            <div className="flex-1 flex gap-2 w-full">
                                <MentionInput
                                    value={replyContent}
                                    onChange={setReplyContent}
                                    onMentionsChange={setReplyMentions}
                                    placeholder={`Balas ${comment.userInformation?.username || 'pengguna'}...`}
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
                                    setReplyMediaImage(null);
                                    setReplyImagePreview(null);
                                }}
                                variant='outline'
                            >
                                Batal
                            </Button>
                            <InlineImageUpload
                                preview={replyImagePreview}
                                onImageSelect={(file) => {
                                    setReplyMediaImage(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setReplyImagePreview(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }}
                                onImageRemove={() => {
                                    setReplyMediaImage(null);
                                    setReplyImagePreview(null);
                                }}
                                maxSizeMB={5}
                                buttonSize='sm'
                                previewPosition="separate"
                            />
                            <Button
                                onClick={handleReply}
                                disabled={!replyContent.trim() && !replyMediaImage}
                            >
                                <BiSend className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
            
            {showReplies && (
                <div className="mt-3 pl-6">
                    {repliesLoading && (
                        <div className="text-sm text-gray-500">
                            Memuat balasan...
                        </div>
                    )}
                    {replies.map((reply) => (
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
                    <div ref={loadMoreButtonRef}>
                        {hasMoreReplies && !repliesLoading && (
                            <button
                                onClick={() => fetchMoreReplies()}
                                disabled={isFetchingMoreReplies}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                            >
                                {isFetchingMoreReplies ? 'Memuat...' : 'Muat lebih banyak'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default CommentItem;