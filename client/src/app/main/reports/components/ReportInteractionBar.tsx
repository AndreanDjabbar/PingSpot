"use client";

import React, { useState } from 'react';
import { 
    FaHeart, 
    FaRegHeart, 
    FaThumbsDown,
    FaComment,
    FaShare
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { IReport } from '@/types/model/report';

interface ReactionStatsType {
    totalLikes: number;
    totalDislikes: number;
    totalReactions: number;
}

interface ReportInteractionBarProps {
    report: IReport;
    onLike: () => void;
    onDislike: () => void;
    onSave: () => void;
    onComment?: () => void;
    onShare: () => void;
    isLoading?: boolean;
    showSecondaryActions?: boolean;
}

export const ReportInteractionBar: React.FC<ReportInteractionBarProps> = ({
    report,
    onLike,
    onComment,
    onShare,
    isLoading = false,
}) => {
    const [animateLike, setAnimateLike] = useState(false);
    const isLikedByCurrentUser = report?.isLikedByCurrentUser || false;
        
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

    return (
        <div className="">
            {(reactionStats.totalLikes > 0 || reactionStats.totalDislikes > 0 || report.commentCount > 0) && (
                <div className="flex items-center justify-between text-xs text-gray-500 p-2">
                    <div className="flex items-center gap-2">
                        {reactionStats.totalLikes > 0 && (
                            <div className="flex items-center gap-1">
                                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <FaHeart className="w-2 h-2 text-white" />
                                </div>
                                <span className="font-medium">{reactionStats.totalLikes}</span>
                            </div>
                        )}
                        {reactionStats.totalDislikes > 0 && (
                            <div className="flex items-center gap-1">
                                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                                    <FaThumbsDown className="w-2 h-2 text-white" />
                                </div>
                                <span className="font-medium">{reactionStats.totalDislikes}</span>
                            </div>
                        )}
                    </div>
                    {report.commentCount > 0 && (
                        <button onClick={onComment} className="hover:underline">
                            {report.commentCount} komentar
                        </button>
                    )}
                </div>
            )}
    
            <div className="flex items-center justify-between py-1 mb-2">
                <div className="flex items-center flex-1">
                    <motion.button
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors flex-1 ${
                            isLikedByCurrentUser
                                ? 'text-red-500'
                                : 'text-gray-600 hover:bg-gray-100'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleLike}
                        disabled={isLoading}
                        animate={animateLike ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 0.2 }}
                    >
                        {isLikedByCurrentUser ? (
                            <FaHeart className="w-[18px] h-[18px]" />
                        ) : (
                            <FaRegHeart className="w-[18px] h-[18px]" />
                        )}
                        <span className="text-sm font-medium">Suka</span>
                    </motion.button>
                    
                    {onComment && (
                        <button
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors flex-1 cursor-pointer"
                            onClick={onComment}
                        >
                            <FaComment className="w-[18px] h-[18px]" />
                            <span className="text-sm font-medium">Komentar</span>
                        </button>
                    )}

                    <button
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors flex-1 cursor-pointer"
                        onClick={onShare}
                    >
                        <FaShare className="w-[18px] h-[18px]" />
                        <span className="text-sm font-medium">Bagikan</span>
                    </button>
                </div>
            </div>
        </div>
    );
};