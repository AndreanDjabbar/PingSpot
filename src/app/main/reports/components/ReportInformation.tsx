/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from 'react';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { FaUsers } from 'react-icons/fa';
import { useReportsStore, useUserProfileStore, useConfirmationModalStore, useFormInformationModalStore } from '@/stores';
import { useUploadProgressReport } from '@/hooks/main';
import { compressImages, getErrorResponseDetails, getErrorResponseMessage } from '@/utils';
import { IUploadProgressReportRequest } from '@/types/api/report';
import { ImageItem } from '@/types/global/type';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadProgressReportSchema } from '../../schema';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorSection, SuccessSection } from '@/components/feedback';
import { LuNotebookText } from 'react-icons/lu';
import { FiEdit } from 'react-icons/fi';
import { Accordion } from '@/components/UI';
import { MdWarning } from 'react-icons/md';
import VotingSection from './VotingSection';
import ProgressHistory from './ProgressHistory';
import CurrentProgress from './CurrentProgress';
import ResolvedReport from './ResolvedReport';
import ProgressSection from './ProgressSection';
import PublicVotes from './PublicVotes';

interface ReportInformationProps {
    reportID?: number;
    onVote: (voteType: string) => void;
    onImageClick: (imageUrl: string) => void;
    isLoading?: boolean;
}

const ReportInformation: React.FC<ReportInformationProps> = ({
    reportID,
    onVote,
    onImageClick,
    isLoading = false,
}) => {
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [progressImages, setProgressImages] = useState<ImageItem[]>([]);
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const openFormInfo = useFormInformationModalStore((s) => s.openFormInfo);

    const handleVote = (voteType: string) => {
        if (isLoading || currentStatus === 'RESOLVED') return;
        onVote(voteType);
    };

    const queryClient = useQueryClient();

    const handleImageClick = (imageUrl: string) => {
        onImageClick(imageUrl);
    };

    const reports = useReportsStore((s) => s.reports);
    const addReportProgress = useReportsStore((s) => s.addReportProgress);
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
            progressImages.forEach(async(file) => {
                const compressedFile = await compressImages(file.file);
                data.append('progressAttachments', compressedFile);
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
            if (dataResponse && reportID) {
                const newProgressEntry = {
                    id: dataResponse.id,
                    reportID: dataResponse.reportID,
                    status: dataResponse.status,
                    notes: dataResponse?.notes,
                    attachment1: dataResponse?.attachment1,
                    attachment2: dataResponse?.attachment2,
                    createdAt: dataResponse.createdAt,
                };
                addReportProgress(reportID, newProgressEntry);
            }
            setProgressImages([]);
            setSelectedStatus(null);
            resetUploadProgress();
            queryClient.invalidateQueries({ queryKey: ['report-progress', reportID] });
        }
    }, [isUploadProgressSuccess, uploadProgressData, resetProgress, queryClient, reportID, resetUploadProgress, addReportProgress]);

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
                    id="informasi-laporan"
                    title="Informasi Laporan"
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
                                    <CurrentProgress 
                                    handleImageClick={handleImageClick} 
                                    reportProgress={report.reportProgress}/>
                                )}

                                {report && report?.reportProgress?.length > 1 && (
                                    <Accordion type="single" defaultValue={[]}>
                                        <Accordion.Item id="timeline" title={`Semua Perkembangan (${report.reportProgress.length})`}>
                                            <ProgressHistory handleImageClick={handleImageClick} reportProgress={report.reportProgress}/>
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
                                        <ResolvedReport/>
                                    ) : (
                                        reportID && (
                                            <ProgressSection
                                                reportID={reportID}
                                                currentStatus={currentStatus}
                                                isUploadProgressReportPending={isUploadProgressReportPending}
                                                registerProgress={registerProgress}
                                                handleSubmitProgress={handleSubmitProgress}
                                                handleProgressUpload={handleProgressUpload}
                                                progressErrors={progressErrors}
                                                setProgressValue={setProgressValue}
                                                handleImageClick={handleImageClick}
                                                selectedStatus={selectedStatus}
                                                setSelectedStatus={setSelectedStatus}
                                                progressImages={progressImages}
                                                setProgressImages={setProgressImages}
                                            />
                                        )
                                    )}
                                </Accordion.Item>
                                <Accordion.Item
                                    id="report-votes"
                                    title="Pendapat Tentang Laporan Ini"
                                    icon={<FaUsers className="w-4 h-4 text-gray-700" />}
                                    headerClassName="text-gray-900 font-semibold"
                                >
                                    {isReportOwner && (
                                        <PublicVotes 
                                        totalVotes={totalVotes}
                                        totalResolvedVotes={report?.totalResolvedVotes || 0}
                                        totalOnProgressVotes={report?.totalOnProgressVotes || 0}
                                        totalNotResolvedVotes={report?.totalNotResolvedVotes || 0}
                                        />
                                    )}
                                </Accordion.Item>
                            </Accordion>
                        )}

                        {!isReportOwner && (
                            <VotingSection
                                totalVotes={totalVotes}
                                totalResolvedVotes={report?.totalResolvedVotes || 0}
                                totalOnProgressVotes={report?.totalOnProgressVotes || 0}
                                totalNotResolvedVotes={report?.totalNotResolvedVotes || 0}
                                userCurrentVote={userCurrentVote}
                                onVote={handleVote}
                                isLoading={isLoading}
                                isReportResolved={isReportResolved}
                                isReportExpired={isReportExpired}
                                getStatusLabel={getStatusLabel}
                            />
                        )}
                    </div>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

export default ReportInformation;