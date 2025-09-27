"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdOutlineCategory } from 'react-icons/md';
import { BiSend } from 'react-icons/bi';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { getImageURL } from '@/utils/getImageURL';
import { formattedDate } from '@/utils/getFormattedDate';
import { Report, ReportType, ReportImage } from '../../reports/types';
import { CommentType } from '../../reports/types';
import { ReportInteractionBar } from './ReportInteractionBar';
import { StatusVoting } from './StatusVoting';
import { BsThreeDots } from 'react-icons/bs';

const StaticMap = dynamic(() => import('../../components/StaticMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded-lg"></div>
});

interface ReportModalProps {
    report: Report;
    isOpen: boolean;
    onClose: () => void;
    currentUserId: number;
    onLike: () => void;
    onDislike: () => void;
    onSave: () => void;
    onShare: () => void;
    onAddComment: (content: string, parentId?: number) => void;
    onStatusVote: (voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL') => void;
    isInteractionLoading?: boolean;
}

interface CommentItemProps {
    comment: CommentType;
    currentUserId: number;
    level?: number;
    onReply: (content: string, parentId: number) => void;
}

const getReportTypeLabel = (type: ReportType): string => {
    const types = {
        INFRASTRUCTURE: 'Infrastruktur',
        ENVIRONMENT: 'Lingkungan',
        SAFETY: 'Keamanan',
        OTHER: 'Lainnya'
    };
    return types[type] || 'Lainnya';
};

const getReportImages = (images: ReportImage): string[] => {
    if (!images) return [];
    return [
        images.image1URL, 
        images.image2URL, 
        images.image3URL,
        images.image4URL,
        images.image5URL
    ].filter((url): url is string => typeof url === 'string');
};

const CommentItem: React.FC<CommentItemProps> = ({ 
    comment, 
    currentUserId, 
    level = 0, 
    onReply 
}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const replyInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isReplying && replyInputRef.current) {
            replyInputRef.current.focus();
        }
    }, [isReplying]);

    const handleReply = () => {
        if (replyContent.trim()) {
            onReply(replyContent, comment.id);
            setReplyContent('');
            setIsReplying(false);
        }
    };

    const marginLeft = Math.min(level * 16, 32);

    return (
        <div className="mb-3" style={{ marginLeft: `${marginLeft}px` }}>
            <div className="flex space-x-2">
                <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
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
                            <div className="flex items-center justify-between">
                                    <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200">
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
                                    currentUserId={currentUserId}
                                    level={level + 1}
                                    onReply={onReply}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ReportModal: React.FC<ReportModalProps> = ({
    report,
    isOpen,
    onClose,
    currentUserId,
    onLike,
    onDislike,
    onSave,
    onShare,
    onAddComment,
    onStatusVote,
    isInteractionLoading = false
}) => {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const commentInputRef = useRef<HTMLTextAreaElement>(null);

    const images = getReportImages(report.images);

    const handleSubmit = async () => {
        if (!newComment.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await onAddComment(newComment);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = (content: string, parentId: number) => {
        onAddComment(content, parentId);
    };

    // Organize comments into threads
    const organizeComments = (comments: CommentType[]): CommentType[] => {
        const commentMap = new Map<number, CommentType>();
        const rootComments: CommentType[] = [];

        // First pass: create comment map
        comments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: organize into threads
        comments.forEach(comment => {
            const commentWithReplies = commentMap.get(comment.id)!;
            
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) {
                    parent.replies = parent.replies || [];
                    parent.replies.push(commentWithReplies);
                }
            } else {
                rootComments.push(commentWithReplies);
            }
        });

        return rootComments;
    };

    const threadedComments = organizeComments(report.comments || []);

    const nextImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
                    onClick={(e) => e.stopPropagation()}
                >

                    <div className="flex-1 md:flex flex-col hidden">
                        <div className="p-4 h-17 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-white shadow">
                                    <Image 
                                        src={getImageURL(report?.profilePicture || '', "user")} 
                                        alt={report?.fullName}
                                        width={32}
                                        height={32}
                                        className="object-cover h-full w-full"
                                    />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-sky-900">{report?.fullName}</div>
                                    <div className="text-xs text-gray-500 flex items-center">
                                        <FaCalendarAlt className="mr-1" size={10} />
                                        {formattedDate(report?.reportCreatedAt, {
                                            formatStr: 'dd MMMM yyyy - HH:mm',
                                        })}
                                    </div>
                                </div>
                                <span className={`inline-block px-2 py-1 text-xs font-medium text-white rounded-full bg-sky-900`}>
                                    {getReportTypeLabel(report.reportType)}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`inline-block text-xs font-medium text-sky-900 rounded-full`}>
                                    <BsThreeDots size={20}/>
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{report.reportTitle}</h2>
                                <p className="text-gray-700">{report.reportDescription}</p>
                            </div>

                            <div className="flex items-start mb-4 text-gray-600">
                                <FaMapMarkerAlt className="mt-1 mr-2 flex-shrink-0 text-red-500" />
                                <div>
                                    <div className="font-medium">{report.location.detailLocation}</div>
                                    {report.location.displayName && (
                                        <div className="text-sm text-gray-500">{report.location.displayName}</div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="h-48 rounded-lg overflow-hidden">
                                    <StaticMap
                                        latitude={report.location.latitude}
                                        longitude={report.location.longitude}
                                        height={200}
                                        markerColor='red'
                                        popupText={report.reportTitle}
                                    />
                                </div>
                            </div>

                            {images.length > 0 && (
                                <div className="mb-4">
                                    <div className="relative aspect-[5/3] rounded-lg overflow-hidden bg-gray-100 mb-2">
                                        <Image 
                                            src={getImageURL(`/report/${images[currentImageIndex]}`, "main")}
                                            alt={`Foto ${currentImageIndex + 1} untuk laporan ${report.reportTitle}`}
                                            fill
                                            className="object-cover"
                                        />
                                        
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                                >
                                                    <FaChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                                >
                                                    <FaChevronRight className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    
                                    {images.length > 1 && (
                                        <div className="flex space-x-2 overflow-x-auto pb-2">
                                            {images.map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                        index === currentImageIndex 
                                                            ? 'border-sky-500 ring-2 ring-sky-200' 
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <Image 
                                                        src={getImageURL(`/report/${image}`, "main")}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        width={64}
                                                        height={64}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <ReportInteractionBar
                                reactionStats={report.reactionStats || { likes: 0, dislikes: 0 }}
                                userInteraction={report.userInteraction || { hasLiked: false, hasDisliked: false, hasSaved: false }}
                                commentCount={report.commentCount || 0}
                                onLike={onLike}
                                showSecondaryActions={false}
                                onDislike={onDislike}
                                onSave={onSave}
                                onComment={() => {}}
                                onShare={onShare}
                                isLoading={isInteractionLoading}
                            />

                            <StatusVoting
                                currentStatus={report.status || 'PENDING'}
                                statusVoteStats={report.statusVoteStats || { resolved: 0, notResolved: 0, neutral: 0 }}
                                userCurrentVote={report.userInteraction?.currentVote || null}
                                onVote={(voteType: string) => onStatusVote(voteType as 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL')}
                                isLoading={isInteractionLoading}
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col max-h-96 md:max-h-none">
                        <div className="flex h-17 justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-sky-900">
                                Komentar ({report.comments?.length || 0})
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FaTimes className="w-4 h-4 text-sky-900" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {threadedComments.length > 0 ? (
                                threadedComments.map((comment) => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        currentUserId={currentUserId}
                                        onReply={handleReply}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-300 mb-2">
                                        <MdOutlineCategory className="w-8 h-8 mx-auto" />
                                    </div>
                                    <p className="text-sm text-gray-500">Belum ada komentar</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-stretch gap-2 w-full">
                                    <textarea
                                        ref={commentInputRef}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Tulis komentar..."
                                        className="flex-1 p-2 text-sm border border-gray-200 rounded-lg resize-none shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-800 focus:border-sky-800 transition-all duration-200"
                                        rows={2}
                                        disabled={isSubmitting}
                                    />
                                    <div className='flex items-center justify-center border border-gray-200 rounded-lg px-3'>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!newComment.trim() || isSubmitting}
                                            className="text-sky-700 hover:text-sky-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <BiSend size={20}/>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};