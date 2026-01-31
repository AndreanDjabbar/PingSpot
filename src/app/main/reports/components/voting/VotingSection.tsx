import React, { useState } from "react"
import { FaCheck, FaHourglassEnd, FaTimes, FaUsers } from "react-icons/fa"
import { RiProgress3Fill } from "react-icons/ri"
import { motion } from "framer-motion"
import { useConfirmationModalStore } from "@/stores";

interface VotingSectionProps {
    totalVotes: number;
    totalResolvedVotes: number;
    totalOnProgressVotes: number;
    totalNotResolvedVotes: number;
    isReportResolved: boolean;
    isReportExpired: boolean;
    getStatusLabel: (status: string) => string;
    userCurrentVote: 'RESOLVED' | 'ON_PROGRESS' | 'NOT_RESOLVED' | null;
    isLoading: boolean;
    onVote: (voteType: 'RESOLVED' | 'ON_PROGRESS' | 'NOT_RESOLVED') => void;
}

const VotingSection: React.FC<VotingSectionProps> = ({
    totalVotes,
    totalResolvedVotes,
    totalOnProgressVotes,
    totalNotResolvedVotes,
    isReportResolved,
    isReportExpired,
    userCurrentVote,
    isLoading,
    getStatusLabel,
    onVote
}) => {
    const [animateButton, setAnimateButton] = useState<string | null>(null);
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const resolvedPercentage = totalVotes > 0 ? ((totalResolvedVotes || 0) / totalVotes) * 100 : 0;
    const onProgressPercentage = totalVotes > 0 ? ((totalOnProgressVotes || 0) / totalVotes) * 100 : 0;
    const notResolvedPercentage = totalVotes > 0 ? ((totalNotResolvedVotes || 0) / totalVotes) * 100 : 0;

    const handleVote = (voteType: 'RESOLVED' | 'ON_PROGRESS' | 'NOT_RESOLVED') => {
        setAnimateButton(voteType);
        onVote(voteType);
        setTimeout(() => setAnimateButton(null), 300);
    }

    const handleVoteConfirmationModal = (voteType: 'RESOLVED' | 'ON_PROGRESS' | 'NOT_RESOLVED') => {
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
        <div>
            <div className="space-y-4">
                {totalVotes > 0 && (
                    <div className="mb-6 bg-white rounded-xl p-5 border border-gray-200 shadow-md">
                        <div className='mb-4'>
                            <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                                <span>Pendapat Komunitas</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                                    {totalVotes} vote
                                </span>
                            </div>
                            <span className='text-sm text-gray-600'>Pendapat komunitas mengenai proses perkembangan laporan:</span>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className='flex gap-2 font-medium text-green-700 items-center'>
                                        <FaCheck/>
                                        <span className="">Terselesaikan</span>
                                    </div>
                                    <span className="text-gray-600 font-semibold">{totalResolvedVotes} ({resolvedPercentage.toFixed(0)}%)</span>
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
                                    <span className="text-gray-600 font-semibold">{totalOnProgressVotes} ({onProgressPercentage.toFixed(0)}%)</span>
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
                                    <span className="text-gray-600 font-semibold">{totalNotResolvedVotes} ({notResolvedPercentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-red-400 to-red-500 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                        style={{ width: `${notResolvedPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                        {isReportExpired ? (
                            <>
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
                            </>
                        ) : (
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

                {userCurrentVote && !isReportResolved && !isReportExpired && (
                    <div className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="flex-1">
                                <p className="text-sm text-gray-700">
                                    Pendapat Anda: <span className={`font-bold ${
                                        userCurrentVote === 'RESOLVED' 
                                            ? 'text-green-700' 
                                            : userCurrentVote === 'ON_PROGRESS'
                                            ? 'text-yellow-700'
                                            : 'text-red-700'
                                    }`}>
                                        {userCurrentVote === 'RESOLVED' && 'Terselesaikan'}
                                        {userCurrentVote === 'ON_PROGRESS' && 'Dalam Proses'}
                                        {userCurrentVote === 'NOT_RESOLVED' && 'Tidak Ada Proses'}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Klik lagi untuk mengubah pendapat
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VotingSection