"use client";

import React from 'react';
import { IReportComment, ICreateReportCommentRequest } from '@/types';
import { z } from 'zod';
import { CreateReportCommentSchema } from '@/app/main/schema';
import { ErrorSection } from '@/components';
import { getErrorResponseDetails, getErrorResponseMessage, isInternalServerError } from '@/utils';
import { useReportsStore } from '@/stores';
import { CommentList } from '../../components';

interface ReportCommentsSectionProps {
    comments: IReportComment[];
    setCommentContent?: React.Dispatch<React.SetStateAction<string>>;
    setCommentMediaImage?: React.Dispatch<React.SetStateAction<File | null>>;
    onCreateReportComment: (formData: ICreateReportCommentRequest) => void;
    isFetchingCommentsError?: boolean;
    errorFetchingComments?: Error;
    onRetryFetchComments?: () => void;
    hasMoreComments?: boolean;
    isFetchingMoreComments?: boolean;
    onFetchingMoreComments?: () => void;
}

export const ReportCommentsSection: React.FC<ReportCommentsSectionProps> = ({ 
    comments,
    hasMoreComments,
    isFetchingMoreComments,
    errorFetchingComments = null,
    isFetchingCommentsError,
    onRetryFetchComments,
    onFetchingMoreComments,
    onCreateReportComment,
}) => {
    const [commentContent, setCommentContent] = React.useState('');
    const [commentMediaImage, setCommentMediaImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

    const reportCommentCounts = useReportsStore((state) => state.reportCommentsCount);

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

    const handleCommentContentChange = (content: string) => {
        setCommentContent(content);
        if (validationErrors.commentContent) {
            setValidationErrors(prev => ({ ...prev, commentContent: '' }));
        }
    };

    const handleSubmitComment = () => {
        const newCommentFormat: ICreateReportCommentRequest = {
            commentContent: commentContent,
            mediaFile: commentMediaImage || undefined,
            mediaType: commentMediaImage ? 'IMAGE' : undefined,
        };
        handleCreateReportComment(newCommentFormat);
    };

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

    const handleReplyComment = (formData: ICreateReportCommentRequest) => {
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

    if (isFetchingCommentsError) {
        const isServerError = isInternalServerError(errorFetchingComments);
        return (
            <div className="min-h-screen">
                <div className='mt-4'>
                    <ErrorSection
                    message={getErrorResponseMessage(errorFetchingComments || "Gagal memuat komentar.")}
                    onRetry={onRetryFetchComments}
                    showRetryButton={isServerError}
                    errors={getErrorResponseDetails(errorFetchingComments) || "Gagal memuat komentar."}
                    />
                </div>
            </div>
        )
    }

    return (
        <CommentList
            comments={comments}
            commentCount={reportCommentCounts}
            showCommentInput={true}
            commentContent={commentContent}
            commentMediaImage={commentMediaImage}
            imagePreview={imagePreview}
            validationErrors={validationErrors}
            onCommentContentChange={handleCommentContentChange}
            onImageSelect={handleImageSelect}
            onImageRemove={handleRemoveImage}
            onSubmitComment={handleSubmitComment}
            onReply={handleReplyComment}
            variant="full"
            showLikes={true}
            hasMoreComments={hasMoreComments}
            isFetchingMoreComments={isFetchingMoreComments}
            onFetchingMoreComments={onFetchingMoreComments}
        />
    );
};