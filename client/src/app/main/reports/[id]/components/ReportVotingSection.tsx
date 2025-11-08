"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaHourglassEnd, FaTimes, FaUsers } from 'react-icons/fa';
import { RiProgress3Fill } from 'react-icons/ri';
import { IReport } from '@/types/model/report';
import { LuLock } from 'react-icons/lu';
import { useConfirmationModalStore } from '@/stores';

interface ReportVotingSectionProps {
    report: IReport;
    isReportOwner: boolean;
    isReportResolved: boolean;
    userCurrentVote: string | null;
    isLoading: boolean;
    animateButton: string | null;
    resolvedPercentage: number;
    onProgressPercentage: number;
    notResolvedPercentage: number;
    majorityVote: string | null;
    majorityPercentage: number;
    handleVote: (voteType: 'RESOLVED' | 'ON_PROGRESS' | 'NOT_RESOLVED') => void;
}

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'RESOLVED':
            return 'Terselesaikan';
        case 'EXPIRED':
            return 'Kadaluarsa';
        case 'POTENTIALLY_RESOLVED':
            return 'Dalam Peninjauan';
        case 'NOT_RESOLVED':
            return 'Belum Terselesaikan';
        case 'ON_PROGRESS':
            return 'Sedang Dikerjakan';
        default:
            return 'Menunggu';
    }
};

export const ReportVotingSection: React.FC<ReportVotingSectionProps> = ({
    report,
    isReportOwner,
    isReportResolved,
    userCurrentVote,
    isLoading,
    animateButton,
    resolvedPercentage,
    onProgressPercentage,
    notResolvedPercentage,
    majorityVote,
    majorityPercentage,
    handleVote,
}) => {
    const isReportExpired = report.reportStatus === 'EXPIRED';
    const { openConfirm } = useConfirmationModalStore();

    const handleVoteConfirmationModal = (voteType: "RESOLVED" | "ON_PROGRESS" | "NOT_RESOLVED") => {
        openConfirm({
            type: "info",
            title: "Konfirmasi Pemilihan Status Laporan",
            message: `Apakah Anda yakin memilih status "${getStatusLabel(voteType)}" untuk laporan ini?`,
            isPending: isLoading,
            explanation: "Status laporan akan diperbarui sesuai pilihan Anda.",
            confirmTitle: "Ya, Pilih Status",
            cancelTitle: "Batal",
            icon: <FaUsers />,
            onConfirm: () => handleVote(voteType),
        })
    }
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Hasil Voting Pengguna</h3>
            {report.reportVotes ? (
                <div>
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                            <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-1">Total Voting</p>
                            <p className="text-3xl font-bold text-sky-800">{report.totalVotes}</p>
                            <p className="text-xs text-sky-700 mt-1">Pengguna telah memberikan voting</p>
                        </div>

                        <div className="h-px bg-gray-200"></div>
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Distribusi Vote</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className='flex gap-2 font-medium text-green-700 items-center'>
                                        <FaCheck/>
                                        <span className="">Terselesaikan</span>
                                    </div>
                                    <span className="text-gray-600 font-semibold">{report.totalResolvedVotes} ({resolvedPercentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                        style={{ width: `${resolvedPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className='flex gap-2 font-medium text-yellow-700 items-center'>
                                        <RiProgress3Fill/>
                                        <span className="">Dalam Proses</span>
                                    </div>
                                    <span className="text-gray-600 font-semibold">{report.totalOnProgressVotes} ({onProgressPercentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                        style={{ width: `${onProgressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className='flex items-center gap-2 font-medium text-red-700'>
                                        <FaTimes/>
                                        <span className="">Tidak Ada Proses</span>
                                    </div>
                                    <span className="text-gray-600 font-semibold">{report.totalNotResolvedVotes} ({notResolvedPercentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-red-400 to-red-500 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                        style={{ width: `${notResolvedPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200"></div>

                        <div className={`rounded-lg p-3 border transition-all duration-500 ${
                            majorityVote === 'RESOLVED' 
                                ? 'bg-green-50 border-green-100' 
                                : majorityVote === 'ON_PROGRESS'
                                ? 'bg-yellow-50 border-yellow-100'
                                : 'bg-red-50 border-red-100'
                        }`}>
                            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 transition-colors duration-500 ${
                                majorityVote === 'RESOLVED'
                                    ? 'text-green-700'
                                    : majorityVote === 'ON_PROGRESS'
                                    ? 'text-yellow-700'
                                    : 'text-red-700'
                            }`}>Vote Mayoritas</p>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-colors duration-500 ${
                                    majorityVote === 'RESOLVED'
                                        ? 'bg-green-100 text-green-700'
                                        : majorityVote === 'ON_PROGRESS'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {majorityVote === 'RESOLVED' 
                                        ? 'Terselesaikan' 
                                        : majorityVote === 'ON_PROGRESS'
                                        ? 'Dalam Proses'
                                        : 'Tidak Ada Proses'}   
                                </span>
                                <span className={`text-sm font-medium transition-colors duration-500 ${
                                    majorityVote === 'RESOLVED'
                                        ? 'text-green-700'
                                        : majorityVote === 'ON_PROGRESS'
                                        ? 'text-yellow-700'
                                        : 'text-red-700'
                                }`}>{majorityPercentage.toFixed(0)}% pengguna</span>
                            </div>
                        </div>
                    </div>

                    <div className='mt-4'>
                        {isReportResolved ? (
                            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-300 shadow-sm">
                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-md">
                                    <FaCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-800 font-semibold">
                                        Laporan Terselesaikan
                                    </p>
                                    <p className="text-xs text-green-700 mt-0.5">
                                        Voting ditutup
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {!isReportOwner && report.hasProgress && isReportExpired && (
                                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-300 shadow-sm">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
                                            <FaHourglassEnd className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-indigo-800 font-semibold">
                                                Laporan Kadaluarsa
                                            </p>
                                            <p className="text-xs text-indigo-700 mt-0.5">
                                                Voting ditutup hingga laporan diperbarui oleh pembuat laporan
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {!isReportOwner && report.hasProgress && !isReportExpired && (
                                    <>
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                                            <p className="text-sm text-blue-800 font-bold text-center">
                                                Bagaimana pendapat Anda tentang laporan ini?
                                            </p>
                                            <p className="text-xs text-blue-600 text-center mt-1">
                                                Pilih salah satu untuk memberikan pendapat
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <motion.button
                                                className={`relative flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                                                    userCurrentVote === 'RESOLVED'
                                                        ? 'bg-green-600 text-white border-green-700 shadow-lg scale-105'
                                                        : 'bg-white text-green-700 border-gray-200 hover:border-green-300 hover:bg-green-50 shadow-sm'
                                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                onClick={() => handleVoteConfirmationModal('RESOLVED')}
                                                disabled={isLoading}
                                                animate={animateButton === 'RESOLVED' ? { scale: [1, 1.05, 1] } : {}}
                                                transition={{ duration: 0.3 }}
                                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                            >
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                                                    userCurrentVote === 'RESOLVED'
                                                        ? 'bg-white/20'
                                                        : 'bg-green-100'
                                                }`}>
                                                    <FaCheck className={`w-6 h-6 ${
                                                        userCurrentVote === 'RESOLVED' ? 'text-white' : 'text-green-600'
                                                    }`} />
                                                </div>
                                                <span className="text-xs sm:text-sm font-bold text-center leading-tight">
                                                    Terselesaikan
                                                </span>
                                                <span className={`text-xs mt-1 text-center ${
                                                    userCurrentVote === 'RESOLVED' ? 'text-green-100' : 'text-gray-500'
                                                }`}>
                                                    Masalah selesai
                                                </span>
                                            </motion.button>

                                            <motion.button
                                                className={`relative flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                                                    userCurrentVote === 'ON_PROGRESS'
                                                        ? 'bg-yellow-600 text-white border-yellow-700 shadow-lg scale-105'
                                                        : 'bg-white text-yellow-700 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 shadow-sm'
                                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                onClick={() => handleVoteConfirmationModal('ON_PROGRESS')}
                                                disabled={isLoading}
                                                animate={animateButton === 'ON_PROGRESS' ? { scale: [1, 1.05, 1] } : {}}
                                                transition={{ duration: 0.3 }}
                                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                            >
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                                                    userCurrentVote === 'ON_PROGRESS'
                                                        ? 'bg-white/20'
                                                        : 'bg-yellow-100'
                                                }`}>
                                                    <RiProgress3Fill className={`w-6 h-6 ${
                                                        userCurrentVote === 'ON_PROGRESS' ? 'text-white' : 'text-yellow-600'
                                                    }`} />
                                                </div>
                                                <span className="text-xs sm:text-sm font-bold text-center leading-tight">
                                                    Dalam Proses
                                                </span>
                                                <span className={`text-xs mt-1 text-center ${
                                                    userCurrentVote === 'ON_PROGRESS' ? 'text-yellow-100' : 'text-gray-500'
                                                }`}>
                                                    Sedang ditangani
                                                </span>
                                            </motion.button>

                                            <motion.button
                                                className={`relative flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                                                    userCurrentVote === 'NOT_RESOLVED'
                                                        ? 'bg-red-600 text-white border-red-700 shadow-lg scale-105'
                                                        : 'bg-white text-red-700 border-gray-200 hover:border-red-300 hover:bg-red-50 shadow-sm'
                                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                onClick={() => handleVoteConfirmationModal('NOT_RESOLVED')}
                                                disabled={isLoading}
                                                animate={animateButton === 'NOT_RESOLVED' ? { scale: [1, 1.05, 1] } : {}}
                                                transition={{ duration: 0.3 }}
                                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                            >
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                                                    userCurrentVote === 'NOT_RESOLVED'
                                                        ? 'bg-white/20'
                                                        : 'bg-red-100'
                                                }`}>
                                                    <FaTimes className={`w-6 h-6 ${
                                                        userCurrentVote === 'NOT_RESOLVED' ? 'text-white' : 'text-red-600'
                                                    }`} />
                                                </div>
                                                <span className="text-xs sm:text-sm font-bold text-center leading-tight">
                                                    Tidak Ada Proses
                                                </span>
                                                <span className={`text-xs mt-1 text-center ${
                                                    userCurrentVote === 'NOT_RESOLVED' ? 'text-red-100' : 'text-gray-500'
                                                }`}>
                                                    Belum ditangani
                                                </span>
                                            </motion.button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                        <LuLock size={32}/>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Tidak ada Voting</p>
                    <p className="text-xs text-gray-500">
                        Tipe laporan ini tidak akan menyediakan fitur voting pengguna
                    </p>
                </div>
            )}
        </div>
    );
};
