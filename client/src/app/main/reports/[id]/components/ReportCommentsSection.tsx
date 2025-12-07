"use client";

import React from 'react';
import CommentItem from '../../components/CommentItem';
import { IReportComment } from '@/types/model/report';
import { ICreateReportCommentRequest } from '@/types/api/report';
import { BiSend } from 'react-icons/bi';
import Image from 'next/image';
import { getImageURL } from '@/utils';
import { ImagePreview, InlineImageUpload, TextAreaField } from '@/components/form';
import { Button } from '@/components/UI';
import { useReportCommentStore, useUserProfileStore } from '@/stores';
import { z } from 'zod';
import { CreateReportCommentSchema } from '@/app/main/schema';

interface ReportCommentsSectionProps {
    comments: IReportComment[];
    setCommentContent?: React.Dispatch<React.SetStateAction<string>>;
    setCommentMediaImage?: React.Dispatch<React.SetStateAction<File | null>>;
    onCreateReportComment: (formData: ICreateReportCommentRequest) => void;
    onReply: (content: string, parentId: number) => void;
}

export const ReportCommentsSection: React.FC<ReportCommentsSectionProps> = ({ 
    comments,
    onReply,
    onCreateReportComment,
}) => {
    const [commentContent, setCommentContent] = React.useState('');
    const [commentMediaImage, setCommentMediaImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

    const handleImageSelect = (file: File) => {
        setCommentMediaImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setCommentMediaImage(null);
        setImagePreview(null);
    };

    const reportComments = useReportCommentStore((state) => state.reportComments);
    const reportCommentCounts = useReportCommentStore((state) => state.reportCommentsCount);
    const userProfile = useUserProfileStore((state) => state.userProfile);

    const handleCreateReportComment = async (formData: ICreateReportCommentRequest) => {
        try {
            CreateReportCommentSchema.parse(formData);
            setValidationErrors({});
            
            onCreateReportComment(formData);
            setCommentContent('');
            setCommentMediaImage(null);
            setImagePreview(null);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                error.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        errors[issue.path[0].toString()] = issue.message;
                    }
                });
                setValidationErrors(errors);
            }
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                    Komentar ({reportCommentCounts || reportComments.length})
                </h2>
            </div>
            <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                        <Image
                            src={getImageURL(userProfile?.profilePicture || '', "user")}
                            alt="Your profile"
                            width={40}
                            height={40}
                            className="object-cover h-full w-full"
                        />
                    </div>
                    <div className="flex-1">
                        <ImagePreview 
                            preview={imagePreview}
                            onRemove={handleRemoveImage}
                            className="mb-3"
                        />
                        
                        <div className="flex gap-2">
                            <TextAreaField 
                                id='commentContent'
                                value={commentContent}
                                onChange={(e) => {
                                    setCommentContent(e.target.value);
                                    if (validationErrors.commentContent) {
                                        setValidationErrors(prev => ({ ...prev, commentContent: '' }));
                                    }
                                }}
                                placeHolder='Tulis komentar...'
                                className='w-full'
                                rows={1}
                                disableRowsResize
                                withLabel={false}
                            />
                            <InlineImageUpload
                                preview={imagePreview}
                                onImageSelect={handleImageSelect}
                                onImageRemove={handleRemoveImage}
                                maxSizeMB={5}
                                buttonSize='sm'
                                previewPosition="separate"
                            />
                            <Button
                                variant="primary"
                                size='sm'
                                onClick={() => {
                                    const newCommentFormat: ICreateReportCommentRequest = {
                                        commentContent: commentContent,
                                        mediaFile: commentMediaImage || undefined,
                                        mediaType: commentMediaImage ? 'IMAGE' : undefined,
                                    } 
                                    handleCreateReportComment(newCommentFormat)
                                }}
                                disabled={!commentContent.trim() && !commentMediaImage}
                            >
                                <BiSend size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='flex ml-14'>
                    {validationErrors.commentContent && (
                        <p className="text-red-500 text-sm mt-1">
                            {validationErrors.commentContent}
                        </p>
                    )}
                    {validationErrors.mediaFile && (
                        <p className="text-red-500 text-sm mt-1">
                            {validationErrors.mediaFile}
                        </p>
                    )}
                </div>
            </div>
            <div className="divide-y divide-gray-200">
                {comments.map((comment) => (
                    <div key={comment.commentID} className="p-6">
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