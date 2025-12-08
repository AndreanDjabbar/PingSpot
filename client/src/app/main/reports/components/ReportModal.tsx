"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import { compressImages, getErrorResponseMessage } from '@/utils';
import { IReportComment } from '@/types/model/report';
import { useReportCommentStore, useReportsStore, useUserProfileStore } from '@/stores';
import ReportCard from './ReportCard';
import { ICreateReportCommentRequest } from '@/types/api/report';
import { useCreateReportCommentReport } from '@/hooks/main';
import { ErrorSection } from '@/components/feedback';
import { CommentsList } from '@/app/main/components/CommentsList';
import { CommentInput } from '@/app/main/components/CommentInput';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLike: () => void;
    onDislike: () => void;
    reportID: number;
    onSave: () => void;
    onShare: () => void;
    onAddComment: (content: string, parentId?: number) => void;
    onStatusVote: (voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL') => void;
    onStatusUpdate?: (reportID: number, newStatus: string) => void;
    commentsCount: number;
    commentsLoading?: boolean;
    reportComments: IReportComment[];
    onLoadMoreComments?: () => void;
    hasMoreComments?: boolean;
    onCreateReportComment: (formData: ICreateReportCommentRequest) => void;
    isCreateReportCommentError: boolean;
    createReportCommentError?: Error;
}

const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    onLike,
    onShare,
    reportComments,
    reportID,
    commentsCount,
    commentsLoading = false,
    hasMoreComments = false,
    onLoadMoreComments,
    onAddComment,
    onCreateReportComment,
    isCreateReportCommentError,
    createReportCommentError,
}) => {
    const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
    const [commentContent, setCommentContent] = React.useState('');
    const [commentMediaImage, setCommentMediaImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);

    const handleReply = (content: string, parentId: number) => {
        onAddComment(content, parentId);
    };

    const handleImageSelect = (file:File) => {
        setCommentMediaImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }

    const handleRemoveImage = () => {
        setCommentMediaImage(null);
        setImagePreview(null);
    }

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
        console.log('Submitting comment:', newCommentFormat);
        setCommentContent('');
        setCommentMediaImage(null);
        setImagePreview(null);
        onCreateReportComment(newCommentFormat);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999] px-2 sm:px-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 group"
                        aria-label="Close modal"
                    >
                        <FaTimes className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
                    </button>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-white">
                            <ReportCard 
                                reportID={reportID}
                                onLike={onLike}
                                enableOptions={false}
                                enableInformation={false}
                                onShare={onShare}
                            />
                        </div>

                        {isCreateReportCommentError && (
                            <div className='mb-4 px-4'>
                                <ErrorSection
                                    message={getErrorResponseMessage(createReportCommentError) || 'Terjadi kesalahan saat mengirim komentar'} 
                                    errors={createReportCommentError}
                                />
                            </div>
                        )}

                        <CommentsList
                            comments={reportComments!}
                            commentCount={commentsCount}
                            showCommentInput={false}
                            onReply={handleReply}
                            variant="compact"
                            showLikes={false}
                            commentsLoading={commentsLoading}
                            hasMoreComments={hasMoreComments}
                            onLoadMoreComments={onLoadMoreComments}
                        />
                    </div>

                    <CommentInput
                        commentContent={commentContent}
                        commentMediaImage={commentMediaImage}
                        imagePreview={imagePreview}
                        validationErrors={validationErrors}
                        onCommentContentChange={handleCommentContentChange}
                        onImageSelect={handleImageSelect}
                        onImageRemove={handleRemoveImage}
                        onSubmitComment={handleSubmitComment}
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReportModal;