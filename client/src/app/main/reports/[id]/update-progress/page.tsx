"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { FaCheck, FaTimes, FaCamera, FaArrowLeft } from 'react-icons/fa';
import { BiMessageDetail } from 'react-icons/bi';
import { LuNotebookText } from 'react-icons/lu';

import { ButtonSubmit, MultipleImageField, TextAreaField } from '@/components/form';
import { ErrorSection, SuccessSection } from '@/components/feedback';
import { Breadcrumb } from '@/components/layouts';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { useUploadProgressReport, useGetReportByID } from '@/hooks/main';
import { useReportsStore, useUserProfileStore, useConfirmationModalStore } from '@/stores';
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
    const freshReport = freshReportData?.data?.report;
    const currentReport = freshReport || report;
    
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = currentReport && currentUserId === currentReport.userID;
    const isReportResolved = currentReport?.reportStatus === 'RESOLVED';

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
        console.log('Image clicked:', imageUrl);
    };

    useEffect(() => {
        if (isUploadProgressSuccess && uploadProgressData) {
            reset();
            setProgressImages([]);
            setSelectedStatus(null);
            resetUploadProgress();
            queryClient.invalidateQueries({ queryKey: ['report-progress', reportId] });
            queryClient.invalidateQueries({ queryKey: ['report', reportId] });
            
            // Navigate back to report detail page after success
            setTimeout(() => {
                router.push(`/main/reports/${reportId}`);
            }, 1500);
        }
    }, [isUploadProgressSuccess, uploadProgressData, reset, queryClient, reportId, resetUploadProgress, router]);

    useErrorToast(isUploadProgressError, uploadProgressError);
    useSuccessToast(isUploadProgressSuccess, uploadProgressData);

    // Redirect if not report owner
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
                        <Breadcrumb path={`/main/reports/${currentReport.reportTitle}/update-progress`}/>
                        <p className="text-gray-600 text-sm">
                            Perbarui status perkembangan laporan Anda untuk memberi informasi terkini kepada komunitas.
                        </p>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Update Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-sky-600 to-sky-700 p-6">
                                <h1 className="text-2xl font-bold text-white mb-2">Update Progress Laporan</h1>
                                <p className="text-sky-100 text-sm">{currentReport.reportTitle}</p>
                            </div>

                            {/* Feedback Messages */}
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

                            {/* Form */}
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
                                        {/* Status Selection */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3">
                                                Pilih Status Progress *
                                            </label>
                                            <div className="inline-flex items-center w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
                                                <motion.button
                                                    type="button"
                                                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 font-semibold transition-all duration-200 ${
                                                        selectedStatus === 'RESOLVED'
                                                            ? 'bg-green-600 text-white shadow-inner'
                                                            : 'bg-gray-100 text-green-700 hover:bg-green-50'
                                                    } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => {
                                                        setSelectedStatus('RESOLVED');
                                                        setValue('progressStatus', 'RESOLVED');
                                                    }}
                                                    disabled={isUploadProgressReportPending}
                                                    whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                                                >
                                                    <FaCheck className="w-5 h-5" />
                                                    <span className="text-sm">Terselesaikan</span>
                                                </motion.button>

                                                <motion.button
                                                    type="button"
                                                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 font-semibold transition-all duration-200 ${
                                                        selectedStatus === 'NOT_RESOLVED'
                                                            ? 'bg-red-600 text-white shadow-inner'
                                                            : 'bg-gray-100 text-red-700 hover:bg-red-50'
                                                    } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => {
                                                        setSelectedStatus('NOT_RESOLVED');
                                                        setValue('progressStatus', 'NOT_RESOLVED');
                                                    }}
                                                    disabled={isUploadProgressReportPending}
                                                    whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                                                >
                                                    <FaTimes className="w-5 h-5" />
                                                    <span className="text-sm">Belum Terselesaikan</span>
                                                </motion.button>
                                            </div>
                                            {errors.progressStatus && (
                                                <p className="text-red-500 text-sm font-semibold mt-2">
                                                    {errors.progressStatus.message as string}
                                                </p>
                                            )}
                                        </div>

                                        {/* Progress Form */}
                                        {selectedStatus && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-md space-y-5"
                                            >
                                                {/* Notes Field */}
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

                                                {/* Action Buttons */}
                                                <div className="flex space-x-3 pt-3">
                                                    <ButtonSubmit
                                                        className="group relative w-full flex items-center justify-center py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title={selectedStatus === 'RESOLVED' ? 'Tutup Laporan' : 'Perbarui Status'}
                                                        progressTitle="Memproses..."
                                                        isProgressing={isUploadProgressReportPending}
                                                    />
                                                    
                                                    <motion.button
                                                        type="button"
                                                        className="px-4 w-1/3 py-3.5 rounded-xl text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => {
                                                            setSelectedStatus(null);
                                                            reset();
                                                            setProgressImages([]);
                                                        }}
                                                        disabled={isUploadProgressReportPending}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        Reset
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
                                <div className="flex items-center gap-2 text-white mb-2">
                                    <LuNotebookText className="w-5 h-5" />
                                    <h3 className="font-bold text-lg">Panduan Memperbarui</h3>
                                </div>
                                <p className="text-blue-100 text-xs">
                                    Ikuti langkah berikut untuk memperbarui progress laporan
                                </p>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                            1
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 mb-1">
                                                Pilih Status Progress
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Tentukan apakah laporan sudah terselesaikan atau belum terselesaikan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                            2
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 mb-1">
                                                Tulis Catatan Detail
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Jelaskan perkembangan laporan secara detail (minimal 5 karakter)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                            3
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 mb-1">
                                                Tambahkan Foto
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Upload foto pendukung (opsional, maksimal 2 foto)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                            4
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 mb-1">
                                                Konfirmasi Update
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Klik tombol untuk menyimpan perubahan progress laporan
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                        <div className="flex items-start gap-2">
                                            <span className="text-amber-600 text-lg">⚠️</span>
                                            <div>
                                                <p className="text-xs font-semibold text-amber-900 mb-1">
                                                    Penting!
                                                </p>
                                                <p className="text-xs text-amber-800">
                                                    Jika laporan ditutup (status: Terselesaikan), Anda tidak bisa membuka atau memperbarui progress lagi.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-600 text-lg">💡</span>
                                        <div>
                                            <p className="text-xs font-semibold text-green-900 mb-1">
                                                Tips
                                            </p>
                                            <p className="text-xs text-green-800">
                                                Berikan informasi yang jelas dan transparan agar komunitas dapat memantau perkembangan laporan dengan baik.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateProgressPage;
