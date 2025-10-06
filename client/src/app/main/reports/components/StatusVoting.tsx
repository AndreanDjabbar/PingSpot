"use client";

import React, { useState } from 'react';
import { FaCheck, FaTimes, FaMinus, FaUsers, FaCrown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useReportsStore } from '@/stores/reportsStore';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { updateReportStatusService } from '@/services/mainService';
import { toast } from 'react-toastify';

interface StatusVoteStatsType {
    resolved: number;
    notResolved: number;
    neutral: number;
}

interface StatusVotingProps {
    reportID?: number;
    currentStatus: string;
    statusVoteStats: StatusVoteStatsType;
    userCurrentVote: string | null;
    onVote: (voteType: string) => void;
    onStatusUpdate?: (reportID: number, newStatus: string, note?: string) => void;
    isLoading?: boolean;
}

const StatusVoting: React.FC<StatusVotingProps> = ({
    currentStatus,
    statusVoteStats,
    userCurrentVote,
    onVote,
    onStatusUpdate,
    isLoading = false,
    reportID
}) => {
    const [animateButton, setAnimateButton] = useState<string | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusNote, setStatusNote] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const handleVote = (voteType: string) => {
        if (isLoading) return;
        setAnimateButton(voteType);
        onVote(voteType);
        setTimeout(() => setAnimateButton(null), 300);
    };

    const { updateReportStatus } = useReportsStore();

    const handleStatusUpdate = async (newStatus: string, note?: string) => {
        if (!reportID || isUpdatingStatus) return;
        
        try {
            setIsUpdatingStatus(true);
            await updateReportStatusService(reportID, newStatus);
            
            updateReportStatus(reportID, newStatus);
            
            if (onStatusUpdate) {
                onStatusUpdate(reportID, newStatus, note);
            }
            
            if (newStatus === 'RESOLVED') {
                toast.success('Laporan berhasil ditandai sebagai terselesaikan dan catatan telah diposting');
            } else {
                toast.success('Status berhasil diperbarui dan update progress telah diposting');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Gagal mengubah status laporan');
        } finally {
            setIsUpdatingStatus(false);
            setSelectedStatus(null);
            setStatusNote('');
        }
    };

    const totalVotes = statusVoteStats.resolved + statusVoteStats.notResolved + statusVoteStats.neutral || 0;
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
    const { reports } = useReportsStore();
    const { userProfile } = useUserProfileStore();
    
    const report = reports.find(r => r.id === reportID);
    const currentUserId = userProfile ? Number(userProfile.userID) : null;

    const isReportOwner = report && currentUserId === report.userID;

    return (
        <div className="bg-gray-50 rounded-2xl p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <FaUsers className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Status Laporan</h3>
                    {isReportOwner && (
                        <div className="flex items-center space-x-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full border border-yellow-200">
                            <FaCrown size={14}/>
                            <span className="text-sm font-bold">Laporan Anda</span>
                        </div>
                    )}
                </div>
                {!isReportOwner && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                        {getStatusLabel(currentStatus)}
                    </div>
                )}
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

            {isReportOwner ? (
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">
                            Perbarui Status Laporan
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                className={`flex items-center justify-center space-x-2 px-1 py-2 rounded-xl font-medium transition-all duration-200 border-1 ${
                                    selectedStatus === 'RESOLVED'
                                        ? 'bg-green-700 border-green-700 text-white shadow-lg'
                                        : currentStatus === 'RESOLVED'
                                        ? 'bg-green-100 text-green-700 border-green-500'
                                        : 'bg-white text-green-600 border-green-500 hover:bg-green-50'
                                } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setSelectedStatus('RESOLVED')}
                                disabled={isUpdatingStatus}
                                whileTap={{ scale: isUpdatingStatus ? 1 : 0.98 }}
                            >
                                <FaCheck className="w-4 h-4" />
                                <span className="text-sm">Tandai Selesai</span>
                            </motion.button>

                            <motion.button
                                className={`flex items-center justify-center space-x-2 px-1 py-2 rounded-xl font-medium transition-all duration-200 border-2 ${
                                    selectedStatus === 'NOT_RESOLVED'
                                        ? 'bg-red-700 text-white border-red-700 shadow-lg'
                                        : currentStatus === 'NOT_RESOLVED'
                                        ? 'bg-red-100 text-red-700 border-red-500'
                                        : 'bg-white text-red-600 border-red-500 hover:bg-red-50'
                                } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setSelectedStatus('NOT_RESOLVED')}
                                disabled={isUpdatingStatus}
                                whileTap={{ scale: isUpdatingStatus ? 1 : 0.98 }}
                            >
                                <FaTimes className="w-4 h-4" />
                                <span className="text-sm">Belum Selesai</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Note Input Section */}
                    {selectedStatus && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white rounded-xl p-4 border border-gray-200"
                        >
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 block">
                                    {selectedStatus === 'RESOLVED' 
                                        ? 'Catatan Penyelesaian (Akan diposting ke laporan)' 
                                        : 'Update Progress (Akan diposting ke laporan)'}
                                </label>
                                <textarea
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    placeholder={selectedStatus === 'RESOLVED' 
                                        ? "Jelaskan bagaimana masalah ini telah diselesaikan..." 
                                        : "Berikan update tentang progress pengerjaan laporan ini..."}
                                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500 resize-none ${
                                        selectedStatus === 'RESOLVED' 
                                            ? 'focus:ring-green-700 focus:border-green-700 outline-none' 
                                            : 'focus:ring-red-700 focus:border-red-700 outline-none'
                                    }`}
                                    rows={3}
                                />
                                
                                <div className="flex space-x-2">
                                    <motion.button
                                        className={`flex-1 w-1/2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                            selectedStatus === 'RESOLVED' 
                                                ? 'bg-green-700 hover:bg-green-800' 
                                                : 'bg-red-700 hover:bg-red-800'
                                        }`}
                                        onClick={() => handleStatusUpdate(selectedStatus, statusNote)}
                                        disabled={isUpdatingStatus}
                                        whileTap={{ scale: isUpdatingStatus ? 1 : 0.98 }}
                                    >
                                        {isUpdatingStatus ? 'Memposting...' : 
                                            selectedStatus === 'RESOLVED' ? 'Tutup Laporan' : 'Update Status'}
                                    </motion.button>
                                    
                                    <motion.button
                                        className="px-4 w-1/2 py-2 rounded-lg text-sm font-medium bg-gray-300 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                                        onClick={() => {
                                            setSelectedStatus(null);
                                            setStatusNote('');
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Batal
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStatus === 'RESOLVED' && (
                        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <FaCheck className="w-4 h-4 text-green-600" />
                            <p className="text-sm text-green-700 font-medium">
                                Laporan ini telah ditandai sebagai terselesaikan
                            </p>
                        </div>
                    )}

                    {isUpdatingStatus && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
                        >
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-blue-600 font-medium">Memperbarui status...</p>
                        </motion.div>
                    )}
                </div>
            ) : (
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
            )}
        </div>
    );
};

export default StatusVoting;