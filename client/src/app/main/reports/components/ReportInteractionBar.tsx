"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
    FaHeart, 
    FaRegHeart, 
    FaThumbsDown, 
    FaRegThumbsDown, 
    FaBookmark, 
    FaRegBookmark,
    FaComment,
    FaShare
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useReportsStore } from '@/stores/reportsStore';

interface ReactionStatsType {
    totalLikes: number;
    totalDislikes: number;
    totalReactions: number;
}

interface UserInteractionType {
    hasLiked: boolean;
    hasDisliked: boolean;
    hasSaved: boolean;
}

interface ReportInteractionBarProps {
    reportID?: number;
    userInteraction: UserInteractionType;
    commentCount: number;
    onLike: () => void;
    onDislike: () => void;
    onSave: () => void;
    onComment: () => void;
    onShare: () => void;
    isLoading?: boolean;
    showSecondaryActions?: boolean;
}

export const ReportInteractionBar: React.FC<ReportInteractionBarProps> = ({
    // reactionStats,
    reportID,
    userInteraction,
    commentCount,
    onLike,
    onDislike,
    onSave,
    onComment,
    onShare,
    showSecondaryActions = true,
    isLoading = false
}) => {
    const [animateLike, setAnimateLike] = useState(false);
    const [animateDislike, setAnimateDislike] = useState(false);
    const [animateSave, setAnimateSave] = useState(false);
    const {reports} = useReportsStore();

    
    const report = reports.find(r => r.id === reportID);

    const isLikedByCurrentUser = report?.isLikedByCurrentUser || false;
    const isDislikedByCurrentUser = report?.isDislikedByCurrentUser || false; 
    const reactionStats: ReactionStatsType = {
        totalLikes: report?.totalLikeReactions || 0,
        totalDislikes: report?.totalDislikeReactions || 0,
        totalReactions: (report?.totalLikeReactions || 0) + (report?.totalDislikeReactions || 0)
    };

    const handleLike = () => {
        if (isLoading) return;
        setAnimateLike(true);
        onLike();
        setTimeout(() => setAnimateLike(false), 300);
    };

    const handleDislike = () => {
        if (isLoading) return;
        setAnimateDislike(true);
        onDislike();
        setTimeout(() => setAnimateDislike(false), 300);
    };

    const handleSave = () => {
        if (isLoading) return;
        setAnimateSave(true);
        onSave();
        setTimeout(() => setAnimateSave(false), 300);
    };

    return (
        <div className="border-t border-gray-100 pt-3 mt-4">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-4">
                    {(reactionStats.totalLikes > 0 || reactionStats.totalDislikes > 0) && (
                        <div className="flex items-center space-x-1">
                            {reactionStats.totalLikes > 0 && (
                                <div className="flex items-center space-x-1">
                                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                        <FaHeart className="w-2 h-2 text-white" />
                                    </div>
                                    <span>{reactionStats.totalLikes}</span>
                                </div>
                            )}
                            {reactionStats.totalDislikes > 0 && (
                                <div className="flex items-center space-x-1">
                                    <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                                        <FaThumbsDown className="w-2 h-2 text-white" />
                                    </div>
                                    <span>{reactionStats.totalDislikes}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div>
                    {commentCount > 0 && (
                        <span>{commentCount} komentar</span>
                    )}
                </div>
            </div>

            <div className={cn("flex items-center", !showSecondaryActions ? "justify-center" : "justify-center sm:justify-between")}>
                <div className="flex items-center space-x-1">
                    <motion.button
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            isLikedByCurrentUser
                                ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                        onClick={handleLike}
                        disabled={isLoading}
                        animate={animateLike ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                    >
                        {isLikedByCurrentUser ? (
                            <FaHeart className="w-5 h-5" />
                        ) : (
                            <FaRegHeart className="w-5 h-5" />
                        )}
                        <span className="font-medium">Suka</span>
                    </motion.button>

                    <motion.button
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            isDislikedByCurrentUser
                                ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                        onClick={handleDislike}
                        disabled={isLoading}
                        animate={animateDislike ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                    >
                        {isDislikedByCurrentUser ? (
                            <FaThumbsDown className="w-5 h-5" />
                        ) : (
                            <FaRegThumbsDown className="w-5 h-5" />
                        )}
                        <span className="font-medium">Tidak Suka</span>
                    </motion.button>

                    <button
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-700 hover:bg-gray-100 hover:scale-105"
                        onClick={onComment}
                    >
                        <FaComment className="w-5 h-5" />
                        <span className="font-medium">Komentar</span>
                    </button>
                </div>

                <div className={cn("items-center space-x-1 hidden", !showSecondaryActions ? "hidden" : "sm:flex")}>
                    <motion.button
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            userInteraction.hasSaved
                                ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                        onClick={handleSave}
                        disabled={isLoading}
                        animate={animateSave ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                    >
                        {userInteraction.hasSaved ? (
                            <FaBookmark className="w-5 h-5" />
                        ) : (
                            <FaRegBookmark className="w-5 h-5" />
                        )}
                    </motion.button>

                    <button
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-700 hover:bg-gray-100 hover:scale-105"
                        onClick={onShare}
                    >
                        <FaShare className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};