"use client";

import React, { useState } from 'react';
import { FaCheck, FaTimes, FaMinus, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface StatusVoteStatsType {
    resolved: number;
    notResolved: number;
    neutral: number;
}

interface StatusVotingProps {
    reportId?: number;
    currentStatus: string;
    statusVoteStats: StatusVoteStatsType;
    userCurrentVote: string | null;
    onVote: (voteType: string) => void;
    isLoading?: boolean;
}

export const StatusVoting: React.FC<StatusVotingProps> = ({
    currentStatus,
    statusVoteStats,
    userCurrentVote,
    onVote,
    isLoading = false
}) => {
    const [animateButton, setAnimateButton] = useState<string | null>(null);

    const handleVote = (voteType: string) => {
        if (isLoading) return;
        setAnimateButton(voteType);
        onVote(voteType);
        setTimeout(() => setAnimateButton(null), 300);
    };

    const totalVotes = statusVoteStats.resolved + statusVoteStats.notResolved + statusVoteStats.neutral;
    const resolvedPercentage = totalVotes > 0 ? (statusVoteStats.resolved / totalVotes) * 100 : 0;
    const notResolvedPercentage = totalVotes > 0 ? (statusVoteStats.notResolved / totalVotes) * 100 : 0;
    const neutralPercentage = totalVotes > 0 ? (statusVoteStats.neutral / totalVotes) * 100 : 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return 'bg-green-500 text-white';
            case 'NOT_RESOLVED':
                return 'bg-red-500 text-white';
            case 'IN_PROGRESS':
                return 'bg-yellow-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return 'Terselesaikan';
            case 'NOT_RESOLVED':
                return 'Belum Terselesaikan';
            case 'IN_PROGRESS':
                return 'Sedang Dikerjakan';
            default:
                return 'Menunggu';
        }
    };

    return (
        <div className="bg-gray-50 rounded-2xl p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <FaUsers className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Status Laporan</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                    {getStatusLabel(currentStatus)}
                </div>
            </div>

            {totalVotes > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Pendapat Komunitas ({totalVotes} vote)</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 w-24">
                                <FaCheck className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-medium text-green-600">Selesai</span>
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${resolvedPercentage}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-600 w-8">
                                {statusVoteStats.resolved}
                            </span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 w-24">
                                <FaTimes className="w-3 h-3 text-red-600" />
                                <span className="text-xs font-medium text-red-600">Belum</span>
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${notResolvedPercentage}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-600 w-8">
                                {statusVoteStats.notResolved}
                            </span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 w-24">
                                <FaMinus className="w-3 h-3 text-gray-600" />
                                <span className="text-xs font-medium text-gray-600">Netral</span>
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${neutralPercentage}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-600 w-8">
                                {statusVoteStats.neutral}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">
                    Bagaimana pendapat Anda tentang status laporan ini?
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                    <motion.button
                        className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                            userCurrentVote === 'RESOLVED'
                                ? 'bg-green-500 text-white shadow-lg'
                                : 'bg-white text-green-600 border-2 border-green-500 hover:bg-green-50'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleVote('RESOLVED')}
                        disabled={isLoading}
                        animate={animateButton === 'RESOLVED' ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.3 }}
                    >
                        <FaCheck className="w-4 h-4" />
                        <span className="text-sm">Terselesaikan</span>
                    </motion.button>

                    <motion.button
                        className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                            userCurrentVote === 'NOT_RESOLVED'
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-white text-red-600 border-2 border-red-500 hover:bg-red-50'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleVote('NOT_RESOLVED')}
                        disabled={isLoading}
                        animate={animateButton === 'NOT_RESOLVED' ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.3 }}
                    >
                        <FaTimes className="w-4 h-4" />
                        <span className="text-sm">Belum Selesai</span>
                    </motion.button>
                </div>

                {userCurrentVote && (
                    <div className="mt-3 text-center">
                        <p className="text-sm text-gray-500">
                            Anda memilih: <span className="font-medium">
                                {userCurrentVote === 'RESOLVED' && 'Terselesaikan'}
                                {userCurrentVote === 'NOT_RESOLVED' && 'Belum Selesai'}
                                {userCurrentVote === 'NEUTRAL' && 'Tidak Yakin'}
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};