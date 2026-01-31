"use client";

import React from 'react';
import { BiSend } from 'react-icons/bi';
import { ImagePreview, InlineImageUpload, TextAreaField, Button } from '@/components';

interface CommentInputProps {
    commentContent: string;
    commentMediaImage?: File | null;
    imagePreview?: string | null;
    validationErrors?: Record<string, string>;
    isSubmitting?: boolean;
    onCommentContentChange: (content: string) => void;
    onImageSelect: (file: File) => void;
    onImageRemove: () => void;
    onSubmitComment: () => void;
    className?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
    commentContent,
    commentMediaImage = null,
    imagePreview = null,
    validationErrors = {},
    isSubmitting = false,
    onCommentContentChange,
    onImageSelect,
    onImageRemove,
    onSubmitComment,
    className = '',
}) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (commentContent.trim() || commentMediaImage) {
                onSubmitComment();
            }
        }
    };

    return (
        <div className={`bg-white border-t border-gray-200 px-4 sm:px-6 py-4 shadow-lg ${className}`}>
            <div className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        {imagePreview && (
                            <ImagePreview 
                                preview={imagePreview}
                                onRemove={onImageRemove}
                                className="mb-3"
                            />
                        )}
                        
                        <div className="flex gap-2">
                            <TextAreaField 
                                id='commentContent'
                                value={commentContent}
                                onChange={(e) => {
                                    onCommentContentChange(e.target.value);
                                }}
                                onKeyDown={handleKeyDown}
                                placeHolder='Tulis komentar...'
                                className='w-full'
                                rows={1}
                                disableRowsResize
                                withLabel={false}
                                disabled={isSubmitting}
                            />
                            <InlineImageUpload
                                preview={imagePreview}
                                onImageSelect={onImageSelect}
                                onImageRemove={onImageRemove}
                                maxSizeMB={5}
                                buttonSize='sm'
                                previewPosition="separate"
                            />
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
        </div>
    );
};

export default CommentInput;