/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { FaCheck, FaTimes, FaUsers, FaCamera, FaHourglassEnd } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useReportsStore, useUserProfileStore, useConfirmationModalStore, useFormInformationModalStore } from '@/stores';
import { ButtonSubmit, MultipleImageField, TextAreaField } from '@/components/form';
import { BiMessageDetail, BiX } from 'react-icons/bi';
import { useUploadProgressReport } from '@/hooks/main';
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
import { RiProgress3Fill } from "react-icons/ri";
import { MdDone, MdWarning } from 'react-icons/md';

interface StatusVotingProps {
    reportID?: number;
    onVote: (voteType: string) => void;
    onImageClick: (imageUrl: string) => void;
    isLoading?: boolean;
}

const StatusVoting: React.FC<StatusVotingProps> = ({
    reportID,
    onVote,
    onImageClick,
    isLoading = false,
}) => {
    const [animateButton, setAnimateButton] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [progressImages, setProgressImages] = useState<File[]>([]);
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const openFormInfo = useFormInformationModalStore((s) => s.openFormInfo);

    const handleVote = (voteType: string) => {
        if (isLoading || currentStatus === 'RESOLVED') return;
        setAnimateButton(voteType);
        onVote(voteType);
        setTimeout(() => setAnimateButton(null), 300);
    };

    const queryClient = useQueryClient();

    const handleImageClick = (imageUrl: string) => {
        onImageClick(imageUrl);
    };

    const reports = useReportsStore((s) => s.reports);
    const userProfile = useUserProfileStore((s) => s.userProfile);
    
    const report = reports.find(r => r.id === reportID);
    const currentStatus = report?.reportStatus || '';
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = report && currentUserId === report.userID;
    const isReportResolved = (report?.reportStatus ?? currentStatus) === 'RESOLVED';
    const isReportExpired = (report?.reportStatus ?? currentStatus) === 'EXPIRED';
    const isPotentiallyResolved = report?.reportStatus === 'POTENTIALLY_RESOLVED';
    const progressData = report?.reportProgress || [];
    const showWarning = isReportOwner && isPotentiallyResolved;

    const totalVotes = report?.totalVotes || 0;
    const resolvedPercentage = totalVotes > 0 ? ((report?.totalResolvedVotes || 0) / totalVotes) * 100 : 0;
    const onProgressPercentage = totalVotes > 0 ? ((report?.totalOnProgressVotes || 0) / totalVotes) * 100 : 0;
    const notResolvedPercentage = totalVotes > 0 ? ((report?.totalNotResolvedVotes || 0) / totalVotes) * 100 : 0;
    const userCurrentVote = report?.isResolvedByCurrentUser 
        ? 'RESOLVED'
        : report?.isNotResolvedByCurrentUser
            ? 'NOT_RESOLVED'
            : report?.isOnProgressByCurrentUser
                ? 'ON_PROGRESS'
                : null

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return 'bg-green-700 border-green-700 text-white';
            case 'POTENTIALLY_RESOLVED':
                return 'bg-blue-700 border-blue-700 text-white';
            case 'EXPIRED':
                return 'bg-indigo-700 text-white';
            case 'NOT_RESOLVED':
                return 'bg-red-700 text-white';
            case 'ON_PROGRESS':
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
                :   "Konfirmasi Pembaruan Perkembangan Laporan",
            message: formData.progressStatus === 'RESOLVED'
                ?   "Apakah Anda yakin ingin menutup laporan ini?."
                :   "Apakah Anda yakin ingin memperbarui perkembangan laporan ini?",
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

    const handleVoteConfirmationModal = (voteType: string) => {
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
        if (isReportResolved) return;
        if (!reportID) return;
        handleConfirmationModal(formData);
    };

    useEffect(() => {
        if (isUploadProgressSuccess && uploadProgressData) {
            resetProgress();
            const dataResponse = uploadProgressData.data;
            if (dataResponse) {
                const newProgressEntry = {
                    id: dataResponse.id,
                    reportID: dataResponse.reportID,
                    status: dataResponse.status,
                    notes: dataResponse?.notes,
                    attachment1: dataResponse?.attachment1,
                    attachment2: dataResponse?.attachment2,
                    createdAt: dataResponse.createdAt,
                }
                report?.reportProgress.unshift(newProgressEntry || []);
            }
            setProgressImages([]);
            setSelectedStatus(null);
            resetUploadProgress();
            queryClient.invalidateQueries({ queryKey: ['report-progress', reportID] });
        }
    }, [isUploadProgressSuccess, uploadProgressData, resetProgress, queryClient, reportID, resetUploadProgress]);

    useErrorToast(isUploadProgressError, uploadProgressError);
    useSuccessToast(isUploadProgressSuccess, uploadProgressData);
    
    return (
        <div className="rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white">
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

            <Accordion type="single" className="">
                <Accordion.Item
                    id="status-laporan"
                    title="Status Laporan"
                    icon={<FaUsers className="w-5 h-5" />}
                    rightContent={(
                        <div className='flex items-center gap-2'>
                            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(currentStatus)}`}>
                                {getStatusLabel(currentStatus)}
                            </div>
                            {showWarning && (
                                <button 
                                    onClick={() => openFormInfo({
                                        title: 'Konfirmasi Penyelesaian Laporan',
                                        type: 'warning',
                                        description: 'Status laporan Anda berpotensi terselesaikan berdasarkan voting komunitas. Mohon konfirmasi dengan mengunggah progres terbaru dalam waktu 1 minggu untuk memvalidasi penyelesaian masalah ini.',
                                        additionalInfo: 'Jika tidak ada konfirmasi dalam 1 minggu, status akan otomatis berubah menjadi "Terselesaikan".'
                                    })}
                                    className='inline-flex items-center p-1.5 sm:p-2 hover:bg-blue-50 rounded-full transition-colors group'
                                    aria-label="Informasi status laporan"
                                >
                                    <MdWarning size={25} className="text-blue-600 group-hover:text-blue-700 transition-colors sm:w-6 sm:h-6"/>
                                </button>
                            )}
                        </div>
                    )}
                    className="bg-transparent border-0 shadow-none"
                    headerClassName="bg-transparent"
                >
                    <div className="space-y-4 mt-2">
                        {reportID && (
                            <div className='mb-3 space-y-4'>
                                {progressData && progressData.length > 0 && report && (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                        {(() => {
                                            const latestProgress = report.reportProgress[0];
                                            const latestImages = [
                                                latestProgress.attachment1,
                                                latestProgress.attachment2
                                            ].filter((url): url is string => typeof url === 'string' && url.length > 0);
                                            
                                            return (
                                                <>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-xs font-bold text-sky-700 uppercase tracking-wide">Perkembangan Terakhir</p>
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                            latestProgress.status === 'RESOLVED' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : latestProgress.status === 'ON_PROGRESS'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {latestProgress.status === 'RESOLVED' 
                                                                ? 'Terselesaikan' 
                                                                : latestProgress.status === 'ON_PROGRESS'
                                                                ? 'Dalam Proses'
                                                                : 'Tidak Ada Proses'}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        {formattedDate(latestProgress.createdAt, {
                                                            formatStr: 'dd MMMM yyyy - HH:mm',
                                                        })}
                                                    </p>
                                                    
                                                    {latestProgress.notes && (
                                                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                                            {latestProgress.notes}
                                                        </p>
                                                    )}
                                                    
                                                    {latestImages.length > 0 && (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {latestImages.map((imageUrl, imgIndex) => (
                                                                <div 
                                                                    key={imgIndex}
                                                                    className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                                    onClick={() => onImageClick(`report/progress/${imageUrl}`)}
                                                                >
                                                                    <Image
                                                                        src={getImageURL(`/report/progress/${imageUrl}`, "main")}
                                                                        alt={`Latest progress - Image ${imgIndex + 1}`}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}

                                {report && report?.reportProgress?.length > 1 && (
                                    <Accordion type="single" defaultValue={[]}>
                                        <Accordion.Item id="timeline" title={`Semua Perkembangan (${report.reportProgress.length})`}>
                                            <div className="max-h-[500px] overflow-y-auto  mt-2">
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        {report.reportProgress.map((progress, index) => {
                                                            const isLast = index === report.reportProgress.length - 1;
                                                            const progressImages = [
                                                                progress.attachment1,
                                                                progress.attachment2
                                                            ].filter((url): url is string => typeof url === 'string' && url.length > 0);
                                                            
                                                            return (
                                                                <div key={`${progress.id}-${index}`} className="relative pb-6">
                                                                    {!isLast && (
                                                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-gray-200"></div>
                                                                    )}
                                                                    
                                                                    <div className="flex items-start gap-3">
                                                                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                                                                            progress.status === 'RESOLVED' 
                                                                                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                                                                                : progress.status === 'ON_PROGRESS'
                                                                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                                                                                : 'bg-gradient-to-br from-red-400 to-red-600'
                                                                        }`}>
                                                                            {progress.status === 'RESOLVED' ? (
                                                                                <MdDone className='text-white' size={20}/>
                                                                            ) : progress.status === 'ON_PROGRESS' ? (
                                                                                <RiProgress3Fill className='text-white' size={20}/>
                                                                            ) : (
                                                                                <BiX className='text-white' size={20}/>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className={`rounded-lg p-3 border ${
                                                                                progress.status === 'RESOLVED' 
                                                                                    ? 'bg-green-50 border-green-200' 
                                                                                    : progress.status === 'ON_PROGRESS'
                                                                                    ? 'bg-yellow-50 border-yellow-200'
                                                                                    : 'bg-red-50 border-red-200'
                                                                            }`}>
                                                                                <div className="flex items-center justify-between mb-2 lg:flex-col lg:items-start 2xl:flex-row">
                                                                                    <span className={`text-xs font-bold uppercase tracking-wide ${
                                                                                        progress.status === 'RESOLVED' 
                                                                                            ? 'text-green-700' 
                                                                                            : progress.status === 'ON_PROGRESS'
                                                                                            ? 'text-yellow-700'
                                                                                            : 'text-red-700'
                                                                                    }`}>
                                                                                        {progress.status === 'RESOLVED' 
                                                                                            ? 'Terselesaikan' 
                                                                                            : progress.status === 'ON_PROGRESS'
                                                                                            ? 'Dalam Proses'
                                                                                            : 'Tidak Ada Proses'}
                                                                                    </span>
                                                                                    <span className="text-xs text-gray-500">
                                                                                        {formattedDate(progress.createdAt, {
                                                                                            formatStr: 'dd MMM yyyy - HH:mm',
                                                                                        })}
                                                                                    </span>
                                                                                </div>
                                                                                
                                                                                {progress.notes && (
                                                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                                                        {progress.notes}
                                                                                    </p>
                                                                                )}
                                                                                
                                                                                {progressImages.length > 0 && (
                                                                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                                                                        {progressImages.map((imageUrl, imgIndex) => (
                                                                                            <div 
                                                                                                key={`${imgIndex}-${index}`}
                                                                                                className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                                                                onClick={() => onImageClick(`report/progress/${imageUrl}`)}
                                                                                            >
                                                                                                <Image
                                                                                                    src={getImageURL(`/report/progress/${imageUrl}`, "main")}
                                                                                                    alt={`Progress ${index + 1} - Image ${imgIndex + 1}`}
                                                                                                    fill
                                                                                                    className="object-cover"
                                                                                                />
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </Accordion.Item>
                                    </Accordion>
                                )}
                            </div>
                        )}

                        {isReportOwner && (
                            <Accordion type="single">
                                <Accordion.Item
                                    id="update-status"
                                    title="Perbarui Perkembangan Laporan"
                                    icon={<FiEdit className="w-4 h-4 text-gray-700" />}
                                    headerClassName="text-gray-900 font-semibold"
                                >
                                    {isReportResolved ? (
                                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-300 shadow-sm mt-4">
                                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-md">
                                                <FaCheck className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-green-800 font-semibold">
                                                    Laporan Terselesaikan
                                                </p>
                                                <p className="text-xs text-green-700 mt-0.5">
                                                    Pembaruan progress dinonaktifkan
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmitProgress(handleProgressUpload)} className='mt-4'>
                                            <div className='mb-5'>
                                                <label className="block text-sm font-bold text-gray-900 mb-3">
                                                    Pilih Status Perkembangan
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <motion.button
                                                        type="button"
                                                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                                                            selectedStatus === 'RESOLVED'
                                                                ? 'bg-green-600 text-white border-green-700 shadow-lg scale-105'
                                                                : 'bg-white text-green-700 border-gray-200 hover:border-green-300 hover:bg-green-50 shadow-sm'
                                                        } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        onClick={() => {
                                                            if (selectedStatus === 'RESOLVED') {
                                                                setSelectedStatus(null);
                                                                setProgressImages([]);
                                                            } else {
                                                                setSelectedStatus('RESOLVED');
                                                                setProgressValue('progressStatus', 'RESOLVED');
                                                            }
                                                        }}
                                                        disabled={isUploadProgressReportPending}
                                                        whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                                                    >
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                                                            selectedStatus === 'RESOLVED'
                                                                ? 'bg-white/20'
                                                                : 'bg-green-100'
                                                        }`}>
                                                            <FaCheck className={`w-5 h-5 ${
                                                                selectedStatus === 'RESOLVED' ? 'text-white' : 'text-green-600'
                                                            }`} />
                                                        </div>
                                                        <span className="text-xs sm:text-sm font-bold text-center leading-tight">
                                                            Terselesaikan
                                                        </span>
                                                        <span className={`text-xs mt-1 text-center ${
                                                            selectedStatus === 'RESOLVED' ? 'text-green-100' : 'text-gray-500'
                                                        }`}>
                                                            Masalah selesai
                                                        </span>
                                                    </motion.button>

                                                    <motion.button
                                                        type="button"
                                                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                                                            selectedStatus === 'ON_PROGRESS'
                                                                ? 'bg-yellow-600 text-white border-yellow-700 shadow-lg scale-105'
                                                                : 'bg-white text-yellow-700 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 shadow-sm'
                                                        } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        onClick={() => {
                                                            if (selectedStatus === 'ON_PROGRESS') {
                                                                setSelectedStatus(null);
                                                                setProgressImages([]);
                                                            } else {
                                                                setSelectedStatus('ON_PROGRESS');
                                                                setProgressValue('progressStatus', 'ON_PROGRESS');
                                                            }
                                                        }}
                                                        disabled={isUploadProgressReportPending}
                                                        whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                                                    >
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                                                            selectedStatus === 'ON_PROGRESS'
                                                                ? 'bg-white/20'
                                                                : 'bg-yellow-100'
                                                        }`}>
                                                            <RiProgress3Fill className={`w-5 h-5 ${
                                                                selectedStatus === 'ON_PROGRESS' ? 'text-white' : 'text-yellow-600'
                                                            }`} />
                                                        </div>
                                                        <span className="text-xs sm:text-sm font-bold text-center leading-tight">
                                                            Dalam Proses
                                                        </span>
                                                        <span className={`text-xs mt-1 text-center ${
                                                            selectedStatus === 'ON_PROGRESS' ? 'text-yellow-100' : 'text-gray-500'
                                                        }`}>
                                                            Sedang ditangani
                                                        </span>
                                                    </motion.button>

                                                    <motion.button
                                                        type="button"
                                                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                                                            selectedStatus === 'NOT_RESOLVED'
                                                                ? 'bg-red-600 text-white border-red-700 shadow-lg scale-105'
                                                                : 'bg-white text-red-700 border-gray-200 hover:border-red-300 hover:bg-red-50 shadow-sm'
                                                        } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        onClick={() => {
                                                            if (selectedStatus === 'NOT_RESOLVED') {
                                                                setSelectedStatus(null);
                                                                setProgressImages([]);
                                                            } else {
                                                                setSelectedStatus('NOT_RESOLVED');
                                                                setProgressValue('progressStatus', 'NOT_RESOLVED');
                                                            }
                                                        }}
                                                        disabled={isUploadProgressReportPending}
                                                        whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                                                    >
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                                                            selectedStatus === 'NOT_RESOLVED'
                                                                ? 'bg-white/20'
                                                                : 'bg-red-100'
                                                        }`}>
                                                            <FaTimes className={`w-5 h-5 ${
                                                                selectedStatus === 'NOT_RESOLVED' ? 'text-white' : 'text-red-600'
                                                            }`} />
                                                        </div>
                                                        <span className="text-xs sm:text-sm font-bold text-center leading-tight">
                                                            Tidak Ada Proses
                                                        </span>
                                                        <span className={`text-xs mt-1 text-center ${
                                                            selectedStatus === 'NOT_RESOLVED' ? 'text-red-100' : 'text-gray-500'
                                                        }`}>
                                                            Belum ditangani
                                                        </span>
                                                    </motion.button>
                                                </div>
                                            </div>
                                            <AnimatePresence
                                                mode='wait'
                                                initial={false}
                                                onExitComplete={() => {
                                                    setProgressImages([]);

                                                    try {
                                                        const reportCardElement = document.getElementById(`report-${reportID}`);
                                                        if (!reportCardElement) return;

                                                        const getScrollable = (node: Element | null): Element | null => {
                                                            while (node) {
                                                                const style = getComputedStyle(node);
                                                                const overflowY = style.overflowY;
                                                                if (overflowY === 'auto' || overflowY === 'scroll') return node;
                                                                node = node.parentElement as Element | null;
                                                            }
                                                            // Checking the parent node of report-id (from report card) element until found the scrollable container (overflow Y auto/scroll)
                                                            return null;
                                                        };

                                                        const scrollable = getScrollable(reportCardElement.parentElement) || document.scrollingElement || document.documentElement;

                                                        requestAnimationFrame(() => {
                                                            requestAnimationFrame(() => {
                                                                try {
                                                                    reportCardElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

                                                                    const reportCardRect = reportCardElement.getBoundingClientRect();
                                                                    const containerRect = (scrollable instanceof Element)
                                                                        ? (scrollable as Element).getBoundingClientRect()
                                                                        : { top: 0, bottom: window.innerHeight, height: window.innerHeight } as DOMRect;

                                                                    if (reportCardRect.top < containerRect.top || reportCardRect.bottom > containerRect.bottom) {
                                                                        // Is the card outside the visible area of the scroll container?

                                                                        const offset = reportCardRect.top - containerRect.top - (containerRect.height - reportCardRect.height) / 2;
                                                                        if (scrollable instanceof Element) {
                                                                            scrollable.scrollBy({ top: offset, behavior: 'smooth' });
                                                                        } else {
                                                                            window.scrollBy({ top: offset, behavior: 'smooth' });
                                                                        }
                                                                    }
                                                                } catch(err) {
                                                                    console.error("Error during scrollIntoView:", err);
                                                                }
                                                            });
                                                        });
                                                    } catch(err) {
                                                        console.error("Error in onExitComplete:", err);
                                                    }
                                                }}
                                            >
                                                {selectedStatus && (
                                                    <motion.div
                                                        key="progress-form"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md space-y-4"
                                                    >
                                                        <div>
                                                            <TextAreaField
                                                                id="progressNotes"
                                                                register={registerProgress("progressNotes")}
                                                                rows={4}
                                                                className="w-full"
                                                                withLabel={true}
                                                                labelTitle="Catatan Progress"
                                                                labelIcon={<BiMessageDetail size={20} />}
                                                                placeHolder="Jelaskan detail progress dari laporan ini. Misalnya: perbaikan sudah dimulai, material sudah disiapkan, dll."
                                                            />
                                                            {progressErrors.progressNotes && (
                                                                <p className="text-red-500 text-sm font-semibold mt-2">
                                                                    {progressErrors.progressNotes.message as string}
                                                                </p>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="space-y-3">
                                                            <div className="flex items-center space-x-2">
                                                                <FaCamera className="w-5 h-5 text-gray-700" />
                                                                <label className="text-sm font-bold text-gray-900">
                                                                    Lampiran Foto (Opsional, Maksimal 2)
                                                                </label>
                                                            </div>
                                                            <MultipleImageField
                                                                id="statusImages"
                                                                withLabel={false}
                                                                buttonTitle="Pilih Foto Progress"
                                                                width={150}
                                                                height={150}
                                                                shape="square"
                                                                maxImages={2}
                                                                onChange={(files) => setProgressImages(files)}
                                                                onImageClick={handleImageClick}
                                                            />
                                                            <p className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                                💡 Tips: Tambahkan foto untuk memperjelas perkembangan laporan dan meningkatkan kepercayaan komunitas
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                            <ButtonSubmit
                                                                className="group relative flex-1 flex items-center justify-center py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title={selectedStatus === 'RESOLVED' ? 'Tutup Laporan' : 'Perbarui Status'}
                                                                progressTitle="Memproses..."
                                                                isProgressing={isUploadProgressReportPending}
                                                            />
                                                            
                                                            <motion.button
                                                                type="button"
                                                                className="px-4 flex-1 sm:flex-none sm:w-32 py-3.5 rounded-xl text-sm font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                                                                onClick={() => {
                                                                    setSelectedStatus(null);
                                                                    setProgressImages([]);
                                                                }}
                                                                whileTap={{ scale: 0.98 }}
                                                                disabled={isUploadProgressReportPending}
                                                            >
                                                                Batal
                                                            </motion.button>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {currentStatus === 'RESOLVED' && (
                                                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-300 shadow-sm mt-4">
                                                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                                            <FaCheck className="w-4 h-4 text-white" />
                                                        </div>
                                                        <p className="text-sm text-green-800 font-semibold">
                                                            Laporan ini telah ditandai sebagai terselesaikan
                                                        </p>
                                                    </div>
                                                )}
                                            </AnimatePresence>
                                        </form>
                                    )}
                                </Accordion.Item>
                                <Accordion.Item
                                    id="report-votes"
                                    title="Pendapat Tentang Laporan Ini"
                                    icon={<FaUsers className="w-4 h-4 text-gray-700" />}
                                    headerClassName="text-gray-900 font-semibold"
                                >
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
                                                    <span className="text-gray-600 font-semibold">{report?.totalResolvedVotes} ({resolvedPercentage.toFixed(0)}%)</span>
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
                                                    <span className="text-gray-600 font-semibold">{report?.totalOnProgressVotes} ({onProgressPercentage.toFixed(0)}%)</span>
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
                                                    <span className="text-gray-600 font-semibold">{report?.totalNotResolvedVotes} ({notResolvedPercentage.toFixed(0)}%)</span>
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
                                </Accordion.Item>
                            </Accordion>
                        )}

                        {!isReportOwner && (
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
                                                    <span className="text-gray-600 font-semibold">{report?.totalResolvedVotes} ({resolvedPercentage.toFixed(0)}%)</span>
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
                                                    <span className="text-gray-600 font-semibold">{report?.totalOnProgressVotes} ({onProgressPercentage.toFixed(0)}%)</span>
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
                                                    <span className="text-gray-600 font-semibold">{report?.totalNotResolvedVotes} ({notResolvedPercentage.toFixed(0)}%)</span>
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
                        )}
                    </div>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

export default StatusVoting;