"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { FaCheck, FaTimes, FaMinus, FaUsers, FaCrown, FaCamera } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useReportsStore, useUserProfileStore, useConfirmationModalStore } from '@/stores';
import { ButtonSubmit, MultipleImageField, TextAreaField } from '@/components/form';
import { BiMessageDetail } from 'react-icons/bi';
import { useGetProgressReport, useUploadProgressReport } from '@/hooks/main';
import { getImageURL, getErrorResponseDetails, getErrorResponseMessage, getFormattedDate as formattedDate } from '@/utils';
import { IUploadProgressReportRequest } from '@/types/api/report';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadProgressReportSchema } from '../../schema';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorSection, SuccessSection } from '@/components/feedback';
import { LuNotebookText } from 'react-icons/lu';
import { FiEdit } from 'react-icons/fi';
import { Accordion } from '@/components/UI';

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
    onImageClick: (imageUrl: string) => void;
    onStatusUpdate?: (reportID: number, newStatus: string, note?: string, images?: File[]) => void;
    isLoading?: boolean;
}

const StatusVoting: React.FC<StatusVotingProps> = ({
    currentStatus,
    statusVoteStats,
    userCurrentVote,
    onVote,
    isLoading = false,
    onImageClick,
    reportID,
}) => {
    const [animateButton, setAnimateButton] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [progressImages, setProgressImages] = useState<File[]>([]);
    const { openConfirm } = useConfirmationModalStore();

    const handleVote = (voteType: string) => {
        if (isLoading) return;
        setAnimateButton(voteType);
        onVote(voteType);
        setTimeout(() => setAnimateButton(null), 300);
    };

    const queryClient = useQueryClient();

    const handleImageClick = (imageUrl: string) => {
        onImageClick(imageUrl);
    };

    const totalVotes = statusVoteStats.resolved + statusVoteStats.notResolved + statusVoteStats.neutral || 0;
    const resolvedPercentage = totalVotes > 0 ? (statusVoteStats.resolved / totalVotes) * 100 : 0;
    const notResolvedPercentage = totalVotes > 0 ? (statusVoteStats.notResolved / totalVotes) * 100 : 0;
    const neutralPercentage = totalVotes > 0 ? (statusVoteStats.neutral / totalVotes) * 100 : 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return 'bg-green-700 border-green-700 text-white';
            case 'NOT_RESOLVED':
                return 'bg-red-700 text-white';
            case 'IN_PROGRESS':
                return 'bg-yellow-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const handleConfirmationModal = (formData: IUploadProgressReportRequest) => {
        openConfirm({
            type: "info",
            title: formData.progressStatus === 'RESOLVED'
                ?   "Konfirmasi Penutupan Laporan"
                :   "Konfirmasi Pembaruan Status Laporan",
            message: formData.progressStatus === 'RESOLVED'
                ?   "Apakah Anda yakin ingin menutup laporan ini?."
                :   "Apakah Anda yakin ingin memperbarui status laporan ini?",
            isPending: isUploadProgressReportPending,
            explanation: formData.progressStatus === 'RESOLVED'
                ?   "Perkembangan Laporan yang sudah ditutup tidak bisa dibuka kembali."
                :   "Perkembangan Laporan ini akan diperbarui.",
            confirmTitle: formData.progressStatus === 'RESOLVED' ? "Tutup Laporan" : "Perbarui Status",
            cancelTitle: "Batal",
            icon: <LuNotebookText />,
            onConfirm: () => onSubmit(formData),
        });
    }

    const onSubmit = (formData: IUploadProgressReportRequest) => {
        if (reportID) {
            const preparedFormData = prepareFormData(formData);
            uploadProgress({
                reportID: reportID,
                data: preparedFormData
            });
        }
    }

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
    const { data: progressData, isLoading: isProgressLoading } = useGetProgressReport(reportID || 0);
    
    const { 
        mutate: uploadProgress, 
        isPending: isUploadProgressReportPending, 
        isError: isUploadProgressError, 
        isSuccess: isUploadProgressSuccess, 
        error: uploadProgressError,
        data: uploadProgressData,
        reset: resetUploadProgress
    } = useUploadProgressReport();

    const {
        register: registerProgress,
        handleSubmit: handleSubmitProgress,
        formState: { errors: progressErrors },
        reset: resetProgress,
        setValue: setProgressValue
    } = useForm<IUploadProgressReportRequest>({
        resolver: zodResolver(UploadProgressReportSchema),
    });

    const prepareFormData = (formData: IUploadProgressReportRequest): FormData => {
        const data = new FormData();
        data.append('reportID', String(reportID));
        data.append('progressStatus', formData.progressStatus);
        if (formData.progressNotes) {
            data.append('progressNotes', formData.progressNotes);
        }
        if (progressImages && progressImages.length > 0 ) {
            progressImages.forEach((file) => {
                data.append('progressAttachments', file);
            });
        }
        return data;
    }

    const handleProgressUpload = async (formData: IUploadProgressReportRequest) => {
        if (!reportID) return;
        handleConfirmationModal(formData);
    };

    useEffect(() => {
        if (isUploadProgressSuccess && uploadProgressData) {
            resetProgress();
            setProgressImages([]);
            setSelectedStatus(null);
            resetUploadProgress();
            queryClient.invalidateQueries({ queryKey: ['report-progress', reportID] });
        }
    }, [isUploadProgressSuccess, uploadProgressData, resetProgress, queryClient, reportID, resetUploadProgress]);

    useErrorToast(isUploadProgressError, uploadProgressError);
    useSuccessToast(isUploadProgressSuccess, uploadProgressData);
    
    return (
        <div className="bg-gray-50 rounded-2xl p-4 mt-4">
            <div className='mb-4'>
                {isUploadProgressSuccess && (
                    <SuccessSection message={uploadProgressData.message || "Laporan berhasil dikirim!"} />
                )}

                {isUploadProgressError && (
                    <ErrorSection 
                        message={getErrorResponseMessage(uploadProgressError)} 
                        errors={getErrorResponseDetails(uploadProgressError)} 
                    />
                )}
            </div>

            <Accordion type="single" className="space-y-0">
                <Accordion.Item
                    id="status-laporan"
                    title="Status Laporan"
                    icon={<FaUsers className="w-5 h-5" />}
                    badge={isReportOwner ? (
                        <div className="flex items-center space-x-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full border border-yellow-200">
                            <FaCrown size={14}/>
                            <span className="text-sm font-bold">Laporan Anda</span>
                        </div>  
                    ) : undefined}
                    rightContent={!isReportOwner ? (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                            {getStatusLabel(currentStatus)}
                        </div>
                    ) : undefined}
                    className="bg-transparent border-0 shadow-none"
                    headerClassName="bg-transparent"
                >
                    <div className="space-y-4">
                        {reportID && (
                            <div className='mb-3'>
                                {progressData?.data && progressData.data.length > 0 && (
                                    <div className="mb-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <h4 className="text-sm font-semibold text-sky-900">Perkembangan Terbaru</h4>
                                        </div>
                                        
                                        {(() => {
                                            const latestProgress = progressData.data
                                                .sort((a, b) => b.createdAt - a.createdAt)[0];
                                            
                                            return (
                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(latestProgress.status)}`}>
                                                            {getStatusLabel(latestProgress.status)}
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {formattedDate(latestProgress.createdAt, { withTime: true })}
                                                        </span>
                                                    </div>
                                                    
                                                    {latestProgress.notes && (
                                                        <p className="text-sm text-gray-700">{latestProgress.notes}</p>
                                                    )}
                                                    
                                                    {(latestProgress.attachment1 || latestProgress.attachment2) && (
                                                        <div className="flex space-x-2">
                                                            {latestProgress.attachment1 && (
                                                                <Image 
                                                                    src={getImageURL(`/report/progress/${latestProgress.attachment1}`, "main")} 
                                                                    alt="Progress attachment 1"
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                                    onClick={() => handleImageClick(getImageURL(`/report/progress/${latestProgress.attachment1}`, "main"))}
                                                                />
                                                            )}
                                                            {latestProgress.attachment2 && (
                                                                <Image 
                                                                    src={getImageURL(`/report/progress/${latestProgress.attachment2}`, "main")} 
                                                                    alt="Progress attachment 2"
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                                    onClick={() => handleImageClick(getImageURL(`/report/progress/${latestProgress.attachment2}`, "main"))}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                <Accordion type="single">
                                    <Accordion.Item
                                        id="progress-report"
                                        title={`Perkembangan Laporan${progressData?.data ? ` (${progressData.data.length} pembaruan)` : ''}`}
                                        icon={<BiMessageDetail className="w-4 h-4 text-sky-900" />}
                                        headerClassName="text-sky-900"
                                    >
                                        {isUploadProgressReportPending && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-center justify-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4"
                                            >
                                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-sm text-blue-600 font-medium">Mengirim progress laporan...</p>
                                            </motion.div>
                                        )}

                                        {isProgressLoading ? (
                                            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                                <span className="text-sm text-gray-600">Memuat progress...</span>
                                            </div>
                                        ) : progressData?.data && progressData.data.length > 0 ? (
                                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 pt-3 mt-1">
                                                {progressData.data
                                                    .sort((a, b) => b.createdAt - a.createdAt)
                                                    .map((progress, index) => (
                                                    <div key={index} className="relative">
                                                        {index < progressData.data!.length - 1 && (
                                                            <div className="absolute left-[22px] top-12 w-0.5 h-8 bg-gray-300"></div>
                                                        )}
                                                        
                                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm transition-all duration-200">
                                                            <div className="flex items-start space-x-4">
                                                                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                                                                    progress.status === 'RESOLVED' ? 'bg-green-700' : 'bg-red-700'
                                                                }`}></div>
                                                                
                                                                <div className="flex-1">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(progress.status)}`}>
                                                                            {getStatusLabel(progress.status)}
                                                                        </div>
                                                                        <span className="text-xs text-gray-500">
                                                                            {formattedDate(progress.createdAt, { withTime: true })}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    {progress.notes && (
                                                                        <p className="text-sm text-gray-700 mb-3">{progress.notes}</p>
                                                                    )}
                                                                    
                                                                    {(progress.attachment1 || progress.attachment2) && (
                                                                        <div className="flex space-x-2">
                                                                            {progress.attachment1 && (
                                                                                <Image 
                                                                                    src={getImageURL(`/report/progress/${progress.attachment1}`, "main")} 
                                                                                    alt="Progress attachment 1"
                                                                                    width={64}
                                                                                    height={64}
                                                                                    className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                                                    onClick={() => handleImageClick(getImageURL(`/report/progress/${progress.attachment1}`, "main"))}
                                                                                />
                                                                            )}
                                                                            {progress.attachment2 && (
                                                                                <Image 
                                                                                    src={getImageURL(`/report/progress/${progress.attachment2}`, "main")} 
                                                                                    alt="Progress attachment 2"
                                                                                    width={64}
                                                                                    height={64}
                                                                                    className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                                                    onClick={() => handleImageClick(getImageURL(`/report/progress/${progress.attachment2}`, "main"))}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : !isProgressLoading && (
                                            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 mt-3">
                                                <BiMessageDetail className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-500">Belum ada progress yang dilaporkan</span>
                                            </div>
                                        )}
                                    </Accordion.Item>
                                </Accordion>
                            </div>
                        )}

                        {isReportOwner && (
                            <Accordion type="single">
                                <Accordion.Item
                                    id="update-status"
                                    title="Perbarui Status Laporan"
                                    icon={<FiEdit className="w-4 h-4 text-sky-900" />}
                                    headerClassName="text-sky-900"
                                >
                                    <form onSubmit={handleSubmitProgress(handleProgressUpload)} className='mt-4'>
                                        <div className='mb-4'>
                                            <div className="grid grid-cols-2 gap-3">
                                                <motion.button
                                                    type="button"
                                                    className={`flex items-center justify-center space-x-2 px-1 py-2 rounded-xl font-medium transition-all duration-200 border-1 ${
                                                        selectedStatus === 'RESOLVED'
                                                            ? 'bg-green-700 border-green-700 text-white shadow-lg'
                                                            : currentStatus === 'RESOLVED'
                                                            ? 'bg-green-100 text-green-700 border-green-500'
                                                            : 'bg-white text-green-600 border-green-500 hover:bg-green-50'
                                                    } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => {
                                                        setSelectedStatus('RESOLVED');
                                                        setProgressValue('progressStatus', 'RESOLVED');
                                                    }}
                                                    disabled={isUploadProgressReportPending}
                                                    whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                                                >
                                                    <FaCheck className="w-4 h-4" />
                                                    <span className="text-sm">Tandai Selesai</span>
                                                </motion.button>

                                                <motion.button
                                                    type="button"
                                                    className={`flex items-center justify-center space-x-2 px-1 py-2 rounded-xl font-medium transition-all duration-200 border-2 ${
                                                        selectedStatus === 'NOT_RESOLVED'
                                                            ? 'bg-red-700 text-white border-red-700 shadow-lg'
                                                            : currentStatus === 'NOT_RESOLVED'
                                                            ? 'bg-red-100 text-red-700 border-red-500'
                                                            : 'bg-white text-red-600 border-red-500 hover:bg-red-50'
                                                    } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => {
                                                        setSelectedStatus('NOT_RESOLVED');
                                                        setProgressValue('progressStatus', 'NOT_RESOLVED');
                                                    }}
                                                    disabled={isUploadProgressReportPending}
                                                    whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                                                >
                                                    <FaTimes className="w-4 h-4" />
                                                    <span className="text-sm">Belum Selesai</span>
                                                </motion.button>
                                            </div>
                                        </div>

                                        {selectedStatus && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                                            >
                                                <div className="space-y-3">
                                                    <TextAreaField
                                                        id="progressNotes"
                                                        register={registerProgress("progressNotes")}
                                                        rows={2}
                                                        className="w-full"
                                                        withLabel={true}
                                                        labelTitle="Catatan Progress"
                                                        labelIcon={<BiMessageDetail size={20} />}
                                                        placeHolder="Jelaskan progress dari laporan ini"
                                                    />
                                                    <div className="text-red-500 text-sm font-semibold">{progressErrors.progressNotes?.message as string}</div>
                                                    
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <FaCamera className="w-4 h-4 text-sky-900" />
                                                            <label className="text-sm font-medium text-sky-900">
                                                                Lampiran Foto (Opsional, Maks. 2)
                                                            </label>
                                                        </div>
                                                        <MultipleImageField
                                                            id="statusImages"
                                                            withLabel={false}
                                                            buttonTitle="Pilih Foto"
                                                            width={120}
                                                            height={120}
                                                            shape="square"
                                                            maxImages={2}
                                                            onChange={(files) => setProgressImages(files)}
                                                            onImageClick={handleImageClick}
                                                        />
                                                        <p className="text-xs text-gray-500">
                                                            Tambahkan foto untuk memperjelas status
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex space-x-2">
                                                        <ButtonSubmit
                                                            className="group relative w-1/2 flex items-center justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-pingspot-gradient-hoverable focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-colors duration-300"
                                                            title={selectedStatus === 'RESOLVED' ? 'Tutup Laporan' : 'Perbarui Status'}
                                                            progressTitle="Memproses..."
                                                            isProgressing={isUploadProgressReportPending}
                                                        />
                                                        
                                                        <motion.button
                                                            type="button"
                                                            className="px-4 w-1/2 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                                                            onClick={() => {
                                                                setSelectedStatus(null);
                                                            }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            Batal
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {currentStatus === 'RESOLVED' && (
                                            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200 mt-4">
                                                <FaCheck className="w-4 h-4 text-green-600" />
                                                <p className="text-sm text-green-700 font-medium">
                                                    Laporan ini telah ditandai sebagai terselesaikan
                                                </p>
                                            </div>
                                        )}
                                    </form>
                                </Accordion.Item>
                            </Accordion>
                        )}

                        {!isReportOwner && (
                            <div className="space-y-3">
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
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

export default StatusVoting;