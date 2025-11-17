/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { FaCheck } from 'react-icons/fa';
import { LuNotebookText } from 'react-icons/lu';
import { ButtonSubmit } from '@/components/form';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { useUploadProgressReport, useGetReportByID } from '@/hooks/main';
import { useReportsStore, useUserProfileStore, useConfirmationModalStore, useImagePreviewModalStore } from '@/stores';
import { IUploadProgressReportRequest } from '@/types/api/report';
import { UploadProgressReportSchema } from '../../../schema';
import { ImageItem } from '@/types/global/type';
import { DetailSection, GuideSection, ProgressSection, ResponseSection } from './components';
import { HeaderSection } from '@/app/main/components';

const UpdateProgressPage = () => {
    const params = useParams();
    const router = useRouter();
    const reportId = Number(params.id);
    const queryClient = useQueryClient();
    
    const [selectedStatus, setSelectedStatus] = useState<'RESOLVED' | 'ON_PROGRESS' | 'NOT_RESOLVED' | null>(null);
    const [progressImages, setProgressImages] = useState<ImageItem[]>([]);
    
    const reports = useReportsStore((s) => s.reports);
    const userProfile = useUserProfileStore((s) => s.userProfile);
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    
    const report = reports.find(r => r.id === reportId);
    const { data: freshReportData } = useGetReportByID(reportId);
    const freshReport = freshReportData?.data?.report?.report;
    const currentReport = freshReport || report;
    const customCurrentPath = `/main/reports/${reportId}/Perbarui Perkembangan`;
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = currentReport && currentUserId === currentReport.userID;
    const isReportResolved = currentReport?.reportStatus === 'RESOLVED';
    const openImagePreview = useImagePreviewModalStore((s) => s.openImagePreview);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm<IUploadProgressReportRequest>({
        resolver: zodResolver(UploadProgressReportSchema),
    });

    const { 
        mutate: uploadProgress, 
        isPending: isUploadProgressReportPending, 
        isError: isUploadProgressError, 
        isSuccess: isUploadProgressSuccess, 
        error: uploadProgressError,
        data: uploadProgressData,
        reset: resetUploadProgress
    } = useUploadProgressReport();

    const handleConfirmationModal = (formData: IUploadProgressReportRequest) => {
        openConfirm({
            type: "info",
            title: formData.progressStatus === 'RESOLVED'
                ?   "Konfirmasi Penutupan Laporan"
                :   "Konfirmasi Pembaruan Status Laporan",
            message: formData.progressStatus === 'RESOLVED'
                ?   "Apakah Anda yakin ingin menutup laporan ini?"
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
    };

    const prepareFormData = (formData: IUploadProgressReportRequest): FormData => {
        const data = new FormData();
        data.append('reportID', String(reportId));
        data.append('progressStatus', formData.progressStatus);
        if (formData.progressNotes) {
            data.append('progressNotes', formData.progressNotes);
        }
        if (progressImages && progressImages.length > 0) {
            progressImages.forEach((file) => {
                data.append('progressAttachments', file.file);
            });
        }
        return data;
    };

    const onSubmit = (formData: IUploadProgressReportRequest) => {
        if (reportId) {
            const preparedFormData = prepareFormData(formData);
            uploadProgress({
                reportID: reportId,
                data: preparedFormData
            });
        }
    };

    const handleProgressUpload = async (formData: IUploadProgressReportRequest) => {
        if (isReportResolved) return;
        if (!reportId) return;
        handleConfirmationModal(formData);
    };

    const handleImageClick = (imageUrl: string) => {
        openImagePreview(imageUrl);
    };

    const handleImageChange = (files: ImageItem[]) => {
        setProgressImages(files);
    }

    const handleStatusChange = (status: 'RESOLVED' | 'ON_PROGRESS' | 'NOT_RESOLVED') => {
        setSelectedStatus(status);
        setValue('progressStatus', status);
    };

    useEffect(() => {
        if (isUploadProgressSuccess && uploadProgressData) {
            reset();
            setProgressImages([]);
            setSelectedStatus(null);
            resetUploadProgress();
            queryClient.invalidateQueries({ queryKey: ['report-progress', reportId] });
            queryClient.invalidateQueries({ queryKey: ['report', reportId] });
            
            setTimeout(() => {
                router.push(`/main/reports/${reportId}`);
            }, 1500);
        }
    }, [isUploadProgressSuccess, uploadProgressData, reset, queryClient, reportId, resetUploadProgress, router]);

    useErrorToast(isUploadProgressError, uploadProgressError);
    useSuccessToast(isUploadProgressSuccess, uploadProgressData);

    useEffect(() => {
        if (currentReport && !isReportOwner) {
            router.push(`/main/reports/${reportId}`);
        }
    }, [currentReport, isReportOwner, reportId, router]);

    if (!currentReport || !isReportOwner) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Anda tidak memiliki akses ke halaman ini</p>
                    <button
                        onClick={() => router.push('/main/reports')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Kembali ke Daftar Laporan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <HeaderSection currentPath={customCurrentPath} message='Perbarui status perkembangan laporan Anda untuk memberi informasi terkini kepada komunitas.'/>
            <div className="max-w-7xl mx-auto py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-300">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Perbarui Perkembangan Laporan</h1>
                                <p className="text-gray-700 text-sm">{currentReport.reportTitle}</p>
                            </div>

                            <div className="p-6">
                                <ResponseSection 
                                isUploadProgressError={isUploadProgressError}
                                uploadProgressData={uploadProgressData!}
                                uploadProgressError={uploadProgressError}
                                isUploadProgressSuccess={isUploadProgressSuccess}
                                />
                            </div>

                            <div className="p-6 pt-0">
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
                                                Pembaruan progress dinonaktifkan
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(handleProgressUpload)} className="space-y-6">
                                        <ProgressSection
                                            selectedStatus={selectedStatus}
                                            onStatusChange={handleStatusChange}
                                            isDisabled={isUploadProgressReportPending}
                                            errors={errors}
                                        />

                                        {selectedStatus && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-md space-y-5"
                                            >
                                                <DetailSection 
                                                onImagesChange={handleImageChange}
                                                errors={errors}
                                                register={register}
                                                onImageClick={handleImageClick}
                                                images={progressImages}
                                                />

                                                <div className="flex">
                                                    <ButtonSubmit
                                                        title={selectedStatus === 'RESOLVED' ? 'Tutup Laporan' : 'Perbarui Status'}
                                                        progressTitle="Memproses..."
                                                        isProgressing={isUploadProgressReportPending}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <GuideSection/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateProgressPage;
