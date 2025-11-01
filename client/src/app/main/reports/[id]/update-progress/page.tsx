"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { FaCheck, FaTimes, FaCamera } from 'react-icons/fa';
import { BiMessageDetail } from 'react-icons/bi';
import { LuNotebookText } from 'react-icons/lu';
import { RiProgress3Fill } from 'react-icons/ri';
import { ButtonSubmit, MultipleImageField, TextAreaField } from '@/components/form';
import { ErrorSection, SuccessSection } from '@/components/feedback';
import { Breadcrumb } from '@/components/layouts';
import { Guide } from '@/components/UI';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { useUploadProgressReport, useGetReportByID } from '@/hooks/main';
import { useReportsStore, useUserProfileStore, useConfirmationModalStore, useImagePreviewModalStore } from '@/stores';
import { IUploadProgressReportRequest } from '@/types/api/report';
import { UploadProgressReportSchema } from '../../../schema';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils';

const UpdateProgressPage = () => {
    const params = useParams();
    const router = useRouter();
    const reportId = Number(params.id);
    const queryClient = useQueryClient();
    
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [progressImages, setProgressImages] = useState<File[]>([]);
    
    const { reports } = useReportsStore();
    const { userProfile } = useUserProfileStore();
    const { openConfirm } = useConfirmationModalStore();
    
    const report = reports.find(r => r.id === reportId);
    const { data: freshReportData } = useGetReportByID(reportId);
    const freshReport = freshReportData?.data?.report?.report;
    const currentReport = freshReport || report;
    const customCurrentPath = `/main/reports/${reportId}/Perbarui Perkembangan`;
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = currentReport && currentUserId === currentReport.userID;
    const isReportResolved = currentReport?.reportStatus === 'RESOLVED';
    const { openImagePreview } = useImagePreviewModalStore();

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
                data.append('progressAttachments', file);
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
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className='flex flex-col gap-3'>
                        <Breadcrumb path={customCurrentPath}/>
                        <p className="text-gray-600 text-sm">
                            Perbarui status perkembangan laporan Anda untuk memberi informasi terkini kepada komunitas.
                        </p>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-300">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Perbarui Perkembangan Laporan</h1>
                                <p className="text-gray-700 text-sm">{currentReport.reportTitle}</p>
                            </div>

                            <div className="p-6">
                                {isUploadProgressSuccess && (
                                    <div className="mb-4">
                                        <SuccessSection message={uploadProgressData.message || "Progress berhasil diperbarui!"} />
                                    </div>
                                )}

                                {isUploadProgressError && (
                                    <div className="mb-4">
                                        <ErrorSection 
                                            message={getErrorResponseMessage(uploadProgressError)} 
                                            errors={getErrorResponseDetails(uploadProgressError)} 
                                        />
                                    </div>
                                )}
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
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">
                                                Pilih Status Progress *
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <motion.button
                                                    type="button"
                                                    className={`relative flex flex-col items-center justify-center p-5 rounded-xl font-semibold transition-all duration-300 border-2 ${
                                                        selectedStatus === 'RESOLVED'
                                                            ? 'bg-green-600 text-white border-green-700 shadow-lg scale-105'
                                                            : 'bg-white text-green-700 border-gray-200 hover:border-green-300 hover:bg-green-50 shadow-sm'
                                                    } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    onClick={() => {
                                                        setSelectedStatus('RESOLVED');
                                                        setValue('progressStatus', 'RESOLVED');
                                                        if (selectedStatus === 'RESOLVED') {
                                                            setSelectedStatus(null);
                                                            reset();
                                                            setProgressImages([]);
                                                        }
                                                    }}
                                                    disabled={isUploadProgressReportPending}
                                                    whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                                                >
                                                    
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                                                        selectedStatus === 'RESOLVED'
                                                            ? 'bg-white/20'
                                                            : 'bg-green-100'
                                                    }`}>
                                                        <FaCheck className={`w-6 h-6 ${
                                                            selectedStatus === 'RESOLVED' ? 'text-white' : 'text-green-600'
                                                        }`} />
                                                    </div>
                                                    <span className="text-sm font-bold text-center leading-tight">
                                                        Terselesaikan
                                                    </span>
                                                    <span className={`text-xs mt-1.5 text-center ${
                                                        selectedStatus === 'RESOLVED' ? 'text-green-100' : 'text-gray-500'
                                                    }`}>
                                                        Masalah selesai
                                                    </span>
                                                </motion.button>

                                                <motion.button
                                                    type="button"
                                                    className={`relative flex flex-col items-center justify-center p-5 rounded-xl font-semibold transition-all duration-300 border-2 ${
                                                        selectedStatus === 'ON_PROGRESS'
                                                            ? 'bg-yellow-600 text-white border-yellow-700 shadow-lg scale-105'
                                                            : 'bg-white text-yellow-700 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 shadow-sm'
                                                    } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    onClick={() => {
                                                        setSelectedStatus('ON_PROGRESS');
                                                        setValue('progressStatus', 'ON_PROGRESS');
                                                        if (selectedStatus === 'ON_PROGRESS') {
                                                            setSelectedStatus(null);
                                                            reset();
                                                            setProgressImages([]);
                                                        }
                                                    }}
                                                    disabled={isUploadProgressReportPending}
                                                    whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                                                >
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                                                        selectedStatus === 'ON_PROGRESS'
                                                            ? 'bg-white/20'
                                                            : 'bg-yellow-100'
                                                    }`}>
                                                        <RiProgress3Fill className={`w-6 h-6 ${
                                                            selectedStatus === 'ON_PROGRESS' ? 'text-white' : 'text-yellow-600'
                                                        }`} />
                                                    </div>
                                                    <span className="text-sm font-bold text-center leading-tight">
                                                        Dalam Proses
                                                    </span>
                                                    <span className={`text-xs mt-1.5 text-center ${
                                                        selectedStatus === 'ON_PROGRESS' ? 'text-yellow-100' : 'text-gray-500'
                                                    }`}>
                                                        Sedang ditangani
                                                    </span>
                                                </motion.button>

                                                <motion.button
                                                    type="button"
                                                    className={`relative flex flex-col items-center justify-center p-5 rounded-xl font-semibold transition-all duration-300 border-2 ${
                                                        selectedStatus === 'NOT_RESOLVED'
                                                            ? 'bg-red-600 text-white border-red-700 shadow-lg scale-105'
                                                            : 'bg-white text-red-700 border-gray-200 hover:border-red-300 hover:bg-red-50 shadow-sm'
                                                    } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    onClick={() => {
                                                        setSelectedStatus('NOT_RESOLVED');
                                                        setValue('progressStatus', 'NOT_RESOLVED');
                                                        if (selectedStatus === 'NOT_RESOLVED') {
                                                            setSelectedStatus(null);
                                                            reset();
                                                            setProgressImages([]);
                                                        }
                                                    }}
                                                    disabled={isUploadProgressReportPending}
                                                    whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                                                >
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                                                        selectedStatus === 'NOT_RESOLVED'
                                                            ? 'bg-white/20'
                                                            : 'bg-red-100'
                                                    }`}>
                                                        <FaTimes className={`w-6 h-6 ${
                                                            selectedStatus === 'NOT_RESOLVED' ? 'text-white' : 'text-red-600'
                                                        }`} />
                                                    </div>
                                                    <span className="text-sm font-bold text-center leading-tight">
                                                        Tidak Ada Proses
                                                    </span>
                                                    <span className={`text-xs mt-1.5 text-center ${
                                                        selectedStatus === 'NOT_RESOLVED' ? 'text-red-100' : 'text-gray-500'
                                                    }`}>
                                                        Belum ditangani
                                                    </span>
                                                </motion.button>
                                            </div>
                                            {errors.progressStatus && (
                                                <p className="text-red-500 text-sm font-semibold mt-2">
                                                    {errors.progressStatus.message as string}
                                                </p>
                                            )}
                                        </div>

                                        {selectedStatus && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-md space-y-5"
                                            >
                                                <div>
                                                    <TextAreaField
                                                        id="progressNotes"
                                                        register={register("progressNotes")}
                                                        rows={5}
                                                        className="w-full"
                                                        withLabel={true}
                                                        labelTitle="Catatan Progress"
                                                        labelIcon={<BiMessageDetail size={20} />}
                                                        placeHolder="Jelaskan detail progress dari laporan ini. Misalnya: perbaikan sudah dimulai, material sudah disiapkan, dll."
                                                    />
                                                    {errors.progressNotes && (
                                                        <p className="text-red-500 text-sm font-semibold mt-2">
                                                            {errors.progressNotes.message as string}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Image Upload Field */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <FaCamera className="w-5 h-5 text-gray-700" />
                                                        <label className="text-sm font-bold text-gray-900">
                                                            Lampiran Foto (Opsional, Maksimal 2)
                                                        </label>
                                                    </div>
                                                    <MultipleImageField
                                                        id="progressImages"
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

                                                <div className="flex">
                                                    <ButtonSubmit
                                                        className="group relative w-full flex items-center justify-center py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <Guide
                            title="Panduan Memperbarui"
                            subtitle="Ikuti langkah berikut untuk memperbarui progress laporan"
                            icon={<LuNotebookText size={20}/>}
                            steps={[
                                {
                                    number: 1,
                                    title: "Pilih Status Progress",
                                    description: "Tentukan apakah laporan sudah terselesaikan, dalam proses, atau belum ada perkembangan"
                                },
                                {
                                    number: 2,
                                    title: "Tulis Catatan Detail",
                                    description: "Jelaskan perkembangan laporan secara detail (minimal 5 karakter)"
                                },
                                {
                                    number: 3,
                                    title: "Tambahkan Foto",
                                    description: "Upload foto pendukung (opsional, maksimal 2 foto)"
                                },
                                {
                                    number: 4,
                                    title: "Konfirmasi Update",
                                    description: "Klik tombol untuk menyimpan perubahan progress laporan"
                                }
                            ]}
                            alerts={[
                                {
                                    type: 'warning',
                                    emoji: '⚠️',
                                    title: 'Penting!',
                                    message: 'Jika laporan ditutup (status: Terselesaikan), Anda tidak bisa membuka atau memperbarui progress lagi.'
                                },
                                {
                                    type: 'success',
                                    emoji: '💡',
                                    title: 'Tips',
                                    message: 'Berikan informasi yang jelas dan transparan agar komunitas dapat memantau perkembangan laporan dengan baik.'
                                }
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateProgressPage;
