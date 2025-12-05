"use client";

import React from 'react';
import CommentItem from '../../components/CommentItem';
import { IReportComment } from '@/types/model/report';
import { ICreateReportCommentRequest } from '@/types/api/report';
import { UseFormHandleSubmit } from 'react-hook-form';

interface ReportCommentsSectionProps {
    comments: IReportComment[];
    reportID: number;
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
    imagePreview: string | null;
    totalComments?: number;
    handleSubmitCreateReportComment: UseFormHandleSubmit<ICreateReportCommentRequest>;
    handleCreateReportComment: (formData: ICreateReportCommentRequest) => void;
    setCommentMedia: React.Dispatch<React.SetStateAction<File | null>>;
    onReply: (content: string, parentId: number) => void;
}

export const ReportCommentsSection: React.FC<ReportCommentsSectionProps> = ({ 
    comments,
    onReply,
}) => {

    return (
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
    );
};