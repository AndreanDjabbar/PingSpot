"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { BiSend } from 'react-icons/bi';
import { getImageURL } from '@/utils';
import CommentItem from '../../components/CommentItem';
import { TextAreaField } from '@/components/form';
import { useUserProfileStore } from '@/stores';
import { Button } from '@/components/UI';
import { IReportComment } from '@/types/model/report';

interface ReportCommentsSectionProps {
    comments: IReportComment[];
    onSubmitComment: (content: string) => Promise<void>;
    onReply: (content: string, parentId: number) => void;
}

export const ReportCommentsSection: React.FC<ReportCommentsSectionProps> = ({ 
    comments, 
    onSubmitComment,
    onReply 
}) => {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const userProfile = useUserProfileStore((state) => state.userProfile);

    const handleSubmitComment = async () => {
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmitComment(newComment.trim());
            setNewComment('');
        } catch (error) {
            console.error('Failed to submit comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const organizeComments = (comments: IReportComment[]): IReportComment[] => {
        const commentMap = new Map<string, IReportComment & { replies: IReportComment[] }>();
        const rootComments: IReportComment[] = [];

        comments.forEach(comment => {
            commentMap.set(comment.commentID, { ...comment, replies: [] });
        });

        comments.forEach(comment => {
            const commentWithReplies = commentMap.get(comment.commentID)!;
            
            if (comment.parentCommentID) {
                const parentComment = commentMap.get(comment.parentCommentID);
                if (parentComment) {
                    if (!parentComment.replies) {
                        parentComment.replies = [];
                    }
                    parentComment.replies.push(commentWithReplies);
                } else {
                    rootComments.push(commentWithReplies);
                }
            } else if (comment.threadRootID) {
                const threadRoot = commentMap.get(comment.threadRootID);
                if (threadRoot) {
                    if (!threadRoot.replies) {
                        threadRoot.replies = [];
                    }
                    threadRoot.replies.push(commentWithReplies);
                } else {
                    rootComments.push(commentWithReplies);
                }
            } else {
                rootComments.push(commentWithReplies);
            }
        });

        const sortReplies = (comment: IReportComment & { replies: IReportComment[] }) => {
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.sort((a, b) => a.createdAt - b.createdAt);
                comment.replies.forEach(reply => sortReplies(reply as IReportComment & { replies: IReportComment[] }));
            }
        };

        rootComments.forEach(comment => sortReplies(comment as IReportComment & { replies: IReportComment[] }));
        
        rootComments.sort((a, b) => b.createdAt - a.createdAt);

        return rootComments;
    };

    const threadedComments = organizeComments(comments);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                    Komentar ({comments.length})
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
                    <div className="flex-1 flex gap-2">
                        <TextAreaField 
                        id='comment-input'
                        className='w-full'
                        rows={2}
                        onChange={(e) => setNewComment(e.target.value)}
                        withLabel={false}/>
                    </div>
                    <div>
                        <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || isSubmitting}
                        variant="primary"
                        >
                            <BiSend size={20} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-200">
                {threadedComments.map((comment) => (
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
