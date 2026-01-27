"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaHourglassEnd, FaTimes, FaUsers } from 'react-icons/fa';
import { RiProgress3Fill } from 'react-icons/ri';
import { IReport } from '@/types';
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

type VoteType = 'RESOLVED' | 'ON_PROGRESS' | 'NOT_RESOLVED';

const VOTE_STATUS = {
    RESOLVED: {
        label: 'Terselesaikan',
        description: 'Masalah selesai',
        icon: FaCheck,
        colorActive: 'bg-green-600 text-white border-green-700',
        colorInactive: 'bg-white text-green-700 border-gray-200 hover:border-green-300 hover:bg-green-50',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        descriptionColor: 'text-green-100',
        barColor: 'bg-gradient-to-r from-green-500 to-green-600',
        badgeBg: 'bg-green-50 border-green-100',
        badgeText: 'text-green-700',
        majorityBadge: 'bg-green-100 text-green-700',
    },
    ON_PROGRESS: {
        label: 'Dalam Proses',
        description: 'Sedang ditangani',
        icon: RiProgress3Fill,
        colorActive: 'bg-yellow-600 text-white border-yellow-700',
        colorInactive: 'bg-white text-yellow-700 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        descriptionColor: 'text-yellow-100',
        barColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        badgeBg: 'bg-yellow-50 border-yellow-100',
        badgeText: 'text-yellow-700',
        majorityBadge: 'bg-yellow-100 text-yellow-700',
    },
    NOT_RESOLVED: {
        label: 'Tidak Ada Proses',
        description: 'Belum ditangani',
        icon: FaTimes,
        colorActive: 'bg-red-600 text-white border-red-700',
        colorInactive: 'bg-white text-red-700 border-gray-200 hover:border-red-300 hover:bg-red-50',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        descriptionColor: 'text-red-100',
        barColor: 'bg-gradient-to-r from-red-400 to-red-500',
        badgeBg: 'bg-red-50 border-red-100',
        badgeText: 'text-red-700',
        majorityBadge: 'bg-red-100 text-red-700',
    },
};

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        RESOLVED: 'Terselesaikan',
        EXPIRED: 'Kadaluarsa',
        POTENTIALLY_RESOLVED: 'Dalam Peninjauan',
        NOT_RESOLVED: 'Belum Terselesaikan',
        ON_PROGRESS: 'Sedang Dikerjakan',
    };
    return labels[status] || 'Menunggu';
};

const getMajorityStyle = (majorityVote: string | null) => {
    if (!majorityVote) return { bg: 'bg-gray-300 border-gray-100', text: 'text-gray-700' };
    const config = VOTE_STATUS[majorityVote as VoteType];
    return config ? { bg: config.badgeBg, text: config.badgeText } : { bg: 'bg-gray-300 border-gray-100', text: 'text-gray-700' };
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
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const canVote = !isReportOwner && report.hasProgress && !isReportExpired;

    const voteDistributions = [
        { type: 'RESOLVED' as VoteType, count: report.totalResolvedVotes, percentage: resolvedPercentage },
        { type: 'ON_PROGRESS' as VoteType, count: report.totalOnProgressVotes, percentage: onProgressPercentage },
        { type: 'NOT_RESOLVED' as VoteType, count: report.totalNotResolvedVotes, percentage: notResolvedPercentage },
    ];

    const handleVoteConfirmationModal = (voteType: VoteType) => {
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
        });
    };

    const renderVoteButton = (type: VoteType) => {
        const config = VOTE_STATUS[type];
        const Icon = config.icon;
        const isActive = userCurrentVote === type;

        return (
            <motion.button
                key={type}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                    isActive ? `${config.colorActive} shadow-lg scale-105` : `${config.colorInactive} shadow-sm`
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => handleVoteConfirmationModal(type)}
                disabled={isLoading}
                animate={animateButton === type ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    isActive ? 'bg-white/20' : config.iconBg
                }`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : config.iconColor}`} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-center leading-tight">
                    {config.label}
                </span>
                <span className={`text-xs mt-1 text-center ${isActive ? config.descriptionColor : 'text-gray-500'}`}>
                    {config.description}
                </span>
            </motion.button>
        );
    };

    const renderEmptyState = (message: string) => (
        <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <LuLock size={32} />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Tidak ada Voting</p>
            <p className="text-xs text-gray-500">{message}</p>
        </div>
    );

    if (!report.reportProgress) {
        if (!report.hasProgress) {
            return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Hasil Voting Pengguna</h3>
                {renderEmptyState('Tipe laporan ini tidak akan menyediakan fitur voting pengguna')}
            </div>;
        }
        if (report.reportStatus === 'WAITING') {
            return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Hasil Voting Pengguna</h3>
                {renderEmptyState('Voting akan tersedia setelah pembuat laporan mengunggah progress pertama')}
            </div>;
        }
        if (isReportOwner && !report.reportVotes) {
            return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Hasil Voting Pengguna</h3>
                {renderEmptyState('Belum ada pengguna yang memberikan voting pada laporan ini')}
            </div>;
        }
    }

    const majorityStyle = getMajorityStyle(majorityVote);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Hasil Voting Pengguna</h3>
            <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-1">Total Voting</p>
                    <p className="text-3xl font-bold text-sky-800">{report.totalVotes}</p>
                    <p className="text-xs text-sky-700 mt-1">Pengguna telah memberikan voting</p>
                </div>

                <div className="h-px bg-gray-200"></div>

                <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Distribusi Vote</p>
                    {voteDistributions.map(({ type, count, percentage }) => {
                        const config = VOTE_STATUS[type];
                        const Icon = config.icon;
                        return (
                            <div key={type} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className={`flex gap-2 font-medium items-center ${config.badgeText}`}>
                                        <Icon />
                                        <span>{config.label}</span>
                                    </div>
                                    <span className="text-gray-600 font-semibold">
                                        {count} ({percentage.toFixed(0)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`${config.barColor} h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="h-px bg-gray-200"></div>

                <div className={`rounded-lg p-3 border transition-all duration-500 ${majorityStyle.bg}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-1 transition-colors duration-500 ${majorityStyle.text}`}>
                        Vote Mayoritas
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-colors duration-500 ${
                            majorityVote && VOTE_STATUS[majorityVote as VoteType]
                                ? VOTE_STATUS[majorityVote as VoteType].majorityBadge
                                : 'bg-gray-100 text-gray-700'
                        }`}>
                            {majorityVote && VOTE_STATUS[majorityVote as VoteType]
                                ? VOTE_STATUS[majorityVote as VoteType].label
                                : 'Belum Ada Vote'}
                        </span>
                        {majorityVote && (
                            <span className={`text-sm font-medium transition-colors duration-500 ${majorityStyle.text}`}>
                                {majorityPercentage.toFixed(0)}% pengguna
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4">
                {isReportResolved ? (
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-300 shadow-sm">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-md">
                            <FaCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-green-800 font-semibold">Laporan Terselesaikan</p>
                            <p className="text-xs text-green-700 mt-0.5">Voting ditutup</p>
                        </div>
                    </div>
                ) : isReportExpired && !isReportOwner && report.hasProgress ? (
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-300 shadow-sm">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
                            <FaHourglassEnd className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-indigo-800 font-semibold">Laporan Kadaluarsa</p>
                            <p className="text-xs text-indigo-700 mt-0.5">
                                Voting ditutup hingga laporan diperbarui oleh pembuat laporan
                            </p>
                        </div>
                    </div>
                ) : canVote ? (
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
                            {(['RESOLVED', 'ON_PROGRESS', 'NOT_RESOLVED'] as VoteType[]).map(renderVoteButton)}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};
