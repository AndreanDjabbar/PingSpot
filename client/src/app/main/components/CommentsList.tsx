"use client";

import React, { useEffect } from 'react';
import { BiSend } from 'react-icons/bi';
import { IReportComment } from '@/types/model/report';
import CommentItem from '../reports/components/CommentItem';
import { ImagePreview, InlineImageUpload, TextAreaField } from '@/components/form';
import { Button } from '@/components/UI';
import { FaComment } from 'react-icons/fa';
import { ICreateReportCommentRequest } from '@/types/api/report';
import { useInView } from 'react-intersection-observer';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface CommentsListProps {
    comments: IReportComment[];
    commentCount: number;
    showCommentInput?: boolean;
    commentContent?: string;
    commentMediaImage?: File | null;
    imagePreview?: string | null;
    validationErrors?: Record<string, string>;
    isSubmitting?: boolean;
    onCommentContentChange?: (content: string) => void;
    onImageSelect?: (file: File) => void;
    onImageRemove?: () => void;
    onSubmitComment?: () => void;
    onReply?: (formData: ICreateReportCommentRequest) => void;
    variant?: 'full' | 'compact';
    showLikes?: boolean;
    commentsLoading?: boolean;
    hasMoreComments?: boolean;
    isFetchingMoreComments?: boolean;
    onFetchingMoreComments?: () => void;
    emptyStateMessage?: string;
    className?: string;
}

export const CommentsList: React.FC<CommentsListProps> = ({
    comments,
    commentCount,
    showCommentInput = true,
    commentContent = '',
    commentMediaImage = null,
    imagePreview = null,
    validationErrors = {},
    isSubmitting = false,
    onCommentContentChange,
    onImageSelect,
    onImageRemove,
    onSubmitComment,
    onReply,
    variant = 'full',
    showLikes = true,
    commentsLoading = false,
    hasMoreComments = false,
    onFetchingMoreComments,
    isFetchingMoreComments = false,
    emptyStateMessage = 'Belum ada komentar',
    className = '',
}) => {
    const { ref, inView } = useInView({
        threshold: 0,
    })

    const handleImageSelect = (file: File) => {
        if (onImageSelect) {
            onImageSelect(file);
        }
    };

    const handleRemoveImage = () => {
        if (onImageRemove) {
            onImageRemove();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if ((commentContent.trim() || commentMediaImage) && onSubmitComment) {
                onSubmitComment();
            }
        }
    };

    const handleFetchMoreComments = () => {
        if (onFetchingMoreComments) {
            onFetchingMoreComments();
        }
    }

    useEffect(() => {
        if (inView && hasMoreComments && !isFetchingMoreComments) {
            handleFetchMoreComments();
        }
    }, [inView, hasMoreComments, isFetchingMoreComments]);

    if (variant === 'compact') {
        return (
            <div className={`bg-white ${className}`}>
                <div className="sticky top-0 bg-white border-t border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">
                            Komentar ({commentCount || 0})
                        </h2>
                    </div>
                </div>

                <div className="px-4 sm:px-6 py-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                    {commentsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.commentID}
                                    comment={comment}
                                    variant="compact"
                                    showLikes={showLikes}
                                    onReply={onReply || (() => {})}
                                />
                            ))}
                            {hasMoreComments && (
                                <div ref={ref} className="p-6 text-center border-t border-gray-200">
                                    {isFetchingMoreComments && (
                                        <div className="flex items-center space-x-2 text-sky-500 w-full justify-center">
                                            <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                                            <span className="text-sm">Memuat lebih banyak...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <FaComment className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">{emptyStateMessage}</p>
                            <p className="text-xs text-gray-400 mt-1">Jadilah yang pertama berkomentar!</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                        Komentar ({commentCount})
                    </h2>
                </div>
            </div>

            {showCommentInput && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            {imagePreview && (
                                <ImagePreview 
                                    preview={imagePreview}
                                    onRemove={handleRemoveImage}
                                    className="mb-3"
                                />
                            )}
                            
                            <div className="flex gap-2">
                                <TextAreaField 
                                    id='commentContent'
                                    value={commentContent}
                                    onChange={(e) => {
                                        if (onCommentContentChange) {
                                            onCommentContentChange(e.target.value);
                                        }
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeHolder='Tulis komentar...'
                                    className='w-full'
                                    rows={1}
                                    disableRowsResize
                                    withLabel={false}
                                    disabled={isSubmitting}
                                />
                                {onImageSelect && (
                                    <InlineImageUpload
                                        preview={imagePreview}
                                        onImageSelect={handleImageSelect}
                                        onImageRemove={handleRemoveImage}
                                        maxSizeMB={5}
                                        buttonSize='sm'
                                        previewPosition="separate"
                                    />
                                )}
                                <Button
                                    variant="primary"
                                    size='sm'
                                    onClick={onSubmitComment}
                                    disabled={(!commentContent.trim() && !commentMediaImage) || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <BiSend size={20} />
                                    )}
                                </Button>
                            </div>

                            {(validationErrors.commentContent || validationErrors.mediaFile) && (
                                <div className='flex flex-col gap-1 mt-2'>
                                    {validationErrors.commentContent && (
                                        <p className="text-red-500 text-sm">
                                            {validationErrors.commentContent}
                                        </p>
                                    )}
                                    {validationErrors.mediaFile && (
                                        <p className="text-red-500 text-sm">
                                            {validationErrors.mediaFile}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="divide-y divide-gray-200">
                {commentsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : comments.length > 0 ? (
                    <>
                        {comments.map((comment) => (
                            <div key={comment.commentID} className="p-6">
                                <CommentItem
                                    comment={comment}
                                    variant={variant}
                                    showLikes={showLikes}
                                    onReply={onReply || (() => {})}
                                />
                            </div>
                        ))}
                        
                        {hasMoreComments && (
                            <div ref={ref} className="p-6 text-center border-t border-gray-200">
                                {isFetchingMoreComments && (
                                    <div className="flex items-center space-x-2 text-sky-500 w-full justify-center">
                                        <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                                        <span className="text-sm">Memuat lebih banyak...</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <FaComment className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">{emptyStateMessage}</p>
                        <p className="text-xs text-gray-400 mt-1">Jadilah yang pertama berkomentar!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
