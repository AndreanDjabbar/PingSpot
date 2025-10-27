"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { FaCheck, FaTimes, FaUsers, FaCrown, FaCamera } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useReportsStore, useUserProfileStore, useConfirmationModalStore } from '@/stores';
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
import { MdDone } from 'react-icons/md';

interface StatusVotingProps {
    reportID?: number;
    currentStatus: string;
    onVote: (voteType: string) => void;
    onImageClick: (imageUrl: string) => void;
    isLoading?: boolean;
}

const StatusVoting: React.FC<StatusVotingProps> = ({
    reportID,
    currentStatus,
    onVote,
    onImageClick,
    isLoading = false,
}) => {
    const [animateButton, setAnimateButton] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [progressImages, setProgressImages] = useState<File[]>([]);
    const { openConfirm } = useConfirmationModalStore();

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

    const { reports } = useReportsStore();
    const { userProfile } = useUserProfileStore();
    
    const report = reports.find(r => r.id === reportID);
    const selectedReport = reports.find((report) => report.reportTitle.includes("Aansda"));
    console.log('Report in StatusVoting:', selectedReport);
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = report && currentUserId === report.userID;
    const isReportResolved = (report?.reportStatus ?? currentStatus) === 'RESOLVED';
    const progressData = report?.reportProgress || [];

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

            <Accordion type="single" className="space-y-0">
                <Accordion.Item
                    id="status-laporan"
                    title="Status Laporan"
                    icon={<FaUsers className="w-5 h-5" />}
                    badge={isReportOwner ? (
                        <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full border border-yellow-300 shadow-sm">
                            <FaCrown size={14}/>
                            <span className="text-xs font-semibold">Laporan Anda</span>
                        </div>  
                    ) : undefined}
                    rightContent={report?.reportProgress ? (
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(currentStatus)}`}>
                            {getStatusLabel(currentStatus)}
                        </div>
                    ) : (
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor('')}`}>
                            {getStatusLabel('')}
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
                                                                    onClick={() => onImageClick(imageUrl)}
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
                                                                                                onClick={() => onImageClick(imageUrl)}
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
                                    title="Perbarui Status Laporan"
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
                                                <div className="inline-flex items-center w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
                                                    <motion.button
                                                        type="button"
                                                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3.5 font-semibold transition-all duration-200 ${
                                                            selectedStatus === 'RESOLVED'
                                                                ? 'bg-green-600 text-white shadow-inner'
                                                                : currentStatus === 'RESOLVED'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-green-700 hover:bg-green-50'
                                                        } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={() => {
                                                            setSelectedStatus('RESOLVED');
                                                            setProgressValue('progressStatus', 'RESOLVED');
                                                        }}
                                                        disabled={isUploadProgressReportPending}
                                                        whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                                                    >
                                                        <FaCheck className="w-4 h-4" />
                                                        <span className="text-sm">Selesai</span>
                                                    </motion.button>

                                                    <motion.button
                                                        type="button"
                                                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3.5 font-semibold transition-all duration-200 ${
                                                            selectedStatus === 'NOT_RESOLVED'
                                                                ? 'bg-red-600 text-white shadow-inner'
                                                                : currentStatus === 'NOT_RESOLVED'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-gray-100 text-red-700 hover:bg-red-50'
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
                                                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md"
                                                >
                                                    <div className="space-y-4">
                                                        <TextAreaField
                                                            id="progressNotes"
                                                            register={registerProgress("progressNotes")}
                                                            rows={3}
                                                            className="w-full"
                                                            withLabel={true}
                                                            labelTitle="Catatan Progress"
                                                            labelIcon={<BiMessageDetail size={20} />}
                                                            placeHolder="Jelaskan progress dari laporan ini"
                                                        />
                                                        <div className="text-red-500 text-sm font-semibold">{progressErrors.progressNotes?.message as string}</div>
                                                        
                                                        <div className="space-y-2">
                                                            <div className="flex items-center space-x-2">
                                                                <FaCamera className="w-4 h-4 text-gray-700" />
                                                                <label className="text-sm font-semibold text-gray-900">
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
                                                            <p className="text-xs text-gray-600">
                                                                Tambahkan foto untuk memperjelas status
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="flex space-x-3 pt-2">
                                                            <ButtonSubmit
                                                                className="group relative w-1/2 flex items-center justify-center py-3.5 px-4 text-sm font-semibold rounded-xl text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-all duration-300 shadow-md hover:shadow-lg"
                                                                title={selectedStatus === 'RESOLVED' ? 'Tutup Laporan' : 'Perbarui Status'}
                                                                progressTitle="Memproses..."
                                                                isProgressing={isUploadProgressReportPending}
                                                            />
                                                            
                                                            <motion.button
                                                                type="button"
                                                                className="px-4 w-1/2 py-3.5 rounded-xl text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
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
                                                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-300 shadow-sm mt-4">
                                                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                                        <FaCheck className="w-4 h-4 text-white" />
                                                    </div>
                                                    <p className="text-sm text-green-800 font-semibold">
                                                        Laporan ini telah ditandai sebagai terselesaikan
                                                    </p>
                                                </div>
                                            )}
                                        </form>
                                    )}
                                </Accordion.Item>
                            </Accordion>
                        )}

                        {!isReportOwner && (
                            <div className="space-y-4">
                                {totalVotes > 0 && (
                                    <div className="mb-6 bg-white rounded-xl p-5 border border-gray-200 shadow-md">
                                        <div className="flex items-center justify-between text-sm font-semibold text-gray-900 mb-4">
                                            <span>Pendapat Komunitas</span>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                                                {totalVotes} vote
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2 w-28">
                                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                                                        <FaCheck className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-green-700">Selesai</span>
                                                </div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 shadow-inner">
                                                    <div 
                                                        className="bg-gradient-to-r from-green-600 to-green-500 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                                                        style={{ width: `${resolvedPercentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 w-10 text-right">
                                                    {report?.totalResolvedVotes}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2 w-28">
                                                    <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center shadow-sm">
                                                        <RiProgress3Fill className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-yellow-700">Dalam proses</span>
                                                </div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 shadow-inner">
                                                    <div 
                                                        className="bg-gradient-to-r from-yellow-600 to-yellow-500 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                                                        style={{ width: `${onProgressPercentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 w-10 text-right">
                                                    {report?.totalOnProgressVotes}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2 w-28">
                                                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow-sm">
                                                        <FaTimes className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-red-700">Tidak</span>
                                                </div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 shadow-inner">
                                                    <div 
                                                        className="bg-gradient-to-r from-red-600 to-red-500 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                                                        style={{ width: `${notResolvedPercentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 w-10 text-right">
                                                    {report?.totalNotResolvedVotes}
                                                </span>
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
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                            <p className="text-sm text-blue-800 font-medium text-center">
                                                Bagaimana pendapat Anda tentang perkembangan laporan ini?
                                            </p>
                                        </div>
                                        
                                        <div className="inline-flex items-center w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
                                            <motion.button
                                                className={`flex-1 flex items-center justify-center space-x-2 px-2 py-4 font-semibold transition-all duration-200 ${
                                                    userCurrentVote === 'RESOLVED'
                                                        ? 'bg-green-600 text-white shadow-inner'
                                                        : 'bg-gray-100 text-green-700 hover:bg-green-50'
                                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => handleVote('RESOLVED')}
                                                disabled={isLoading}
                                                animate={animateButton === 'RESOLVED' ? { scale: [1, 1.02, 1] } : {}}
                                                transition={{ duration: 0.3 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <FaCheck className="w-4 h-4" />
                                                <span className="text-sm">Terselesaikan</span>
                                            </motion.button>

                                            <motion.button
                                                className={`flex-1 flex items-center justify-center space-x-2 px-2 py-4 font-semibold transition-all duration-200 ${
                                                    userCurrentVote === 'ON_PROGRESS'
                                                        ? 'bg-yellow-600 text-white shadow-inner'
                                                        : 'bg-gray-100 text-yellow-700 hover:bg-yellow-50'
                                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => handleVote('ON_PROGRESS')}
                                                disabled={isLoading}
                                                animate={animateButton === 'ON_PROGRESS' ? { scale: [1, 1.02, 1] } : {}}
                                                transition={{ duration: 0.3 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <RiProgress3Fill className="w-4 h-4" />
                                                <span className="text-sm">Dalam Proses</span>
                                            </motion.button>

                                            <motion.button
                                                className={`flex-1 flex items-center justify-center space-x-2 px-2 py-4 font-semibold transition-all duration-200 ${
                                                    userCurrentVote === 'NOT_RESOLVED'
                                                        ? 'bg-red-600 text-white shadow-inner'
                                                        : 'bg-gray-100 text-red-700 hover:bg-red-50'
                                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => handleVote('NOT_RESOLVED')}
                                                disabled={isLoading}
                                                animate={animateButton === 'NOT_RESOLVED' ? { scale: [1, 1.02, 1] } : {}}
                                                transition={{ duration: 0.3 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <FaTimes className="w-4 h-4" />
                                                <span className="text-sm">Tidak Ada</span>
                                            </motion.button>
                                        </div>
                                    </>
                                )}

                                {userCurrentVote && !isReportResolved && (
                                    <div className="mt-3 text-center bg-gray-100 rounded-lg p-3 border border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            Anda memilih: <span className="font-bold text-gray-900">
                                                {userCurrentVote === 'RESOLVED' && '✓ Terselesaikan'}
                                                {userCurrentVote === 'ON_PROGRESS' && '-> Dalam Proses'}
                                                {userCurrentVote === 'NOT_RESOLVED' && '✗ Tidak Ada Perkembangan'}
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