"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaCamera } from 'react-icons/fa';
import { RiProgress3Fill } from "react-icons/ri";
import { BiMessageDetail } from 'react-icons/bi';
import { ButtonSubmit, MultipleImageField, TextAreaField } from '@/components/form';
import { ImageItem } from '@/types/global/type';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormHandleSubmit } from 'react-hook-form';
import { IUploadProgressReportRequest } from '@/types/api/report';

interface ProgressSectionProps {
    reportID: number;
    currentStatus: string;
    isUploadProgressReportPending: boolean;
    registerProgress: UseFormRegister<IUploadProgressReportRequest>;
    handleSubmitProgress: UseFormHandleSubmit<IUploadProgressReportRequest>;
    handleProgressUpload: (formData: IUploadProgressReportRequest) => void;
    progressErrors: FieldErrors<IUploadProgressReportRequest>;
    setProgressValue: UseFormSetValue<IUploadProgressReportRequest>;
    handleImageClick: (imageUrl: string) => void;
    selectedStatus: string | null;
    setSelectedStatus: (status: string | null) => void;
    progressImages: ImageItem[];
    setProgressImages: (images: ImageItem[]) => void;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({
    reportID,
    currentStatus,
    isUploadProgressReportPending,
    registerProgress,
    handleSubmitProgress,
    handleProgressUpload,
    progressErrors,
    setProgressValue,
    handleImageClick,
    selectedStatus,
    setSelectedStatus,
    progressImages,
    setProgressImages,
}) => {
    const handleStatusChange = (status: 'RESOLVED' | 'ON_PROGRESS' | 'NOT_RESOLVED') => {
        if (selectedStatus === status) {
            setSelectedStatus(null);
            setProgressImages([]);
        } else {
            setSelectedStatus(status);
            setProgressValue('progressStatus', status);
        }
    };

    const handleCancel = () => {
        setSelectedStatus(null);
        setProgressImages([]);
    };

    const handleAnimationComplete = () => {
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
    };

    return (
        <form onSubmit={handleSubmitProgress(handleProgressUpload)} className='mt-4'>
            <div className='mb-5'>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                    Pilih Status Perkembangan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* RESOLVED Button */}
                    <motion.button
                        type="button"
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                            selectedStatus === 'RESOLVED'
                                ? 'bg-green-600 text-white border-green-700 shadow-lg scale-105'
                                : 'bg-white text-green-700 border-gray-200 hover:border-green-300 hover:bg-green-50 shadow-sm'
                        } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => handleStatusChange('RESOLVED')}
                        disabled={isUploadProgressReportPending}
                        whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                            selectedStatus === 'RESOLVED' ? 'bg-white/20' : 'bg-green-100'
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

                    {/* ON_PROGRESS Button */}
                    <motion.button
                        type="button"
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                            selectedStatus === 'ON_PROGRESS'
                                ? 'bg-yellow-600 text-white border-yellow-700 shadow-lg scale-105'
                                : 'bg-white text-yellow-700 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 shadow-sm'
                        } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => handleStatusChange('ON_PROGRESS')}
                        disabled={isUploadProgressReportPending}
                        whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                            selectedStatus === 'ON_PROGRESS' ? 'bg-white/20' : 'bg-yellow-100'
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

                    {/* NOT_RESOLVED Button */}
                    <motion.button
                        type="button"
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                            selectedStatus === 'NOT_RESOLVED'
                                ? 'bg-red-600 text-white border-red-700 shadow-lg scale-105'
                                : 'bg-white text-red-700 border-gray-200 hover:border-red-300 hover:bg-red-50 shadow-sm'
                        } ${isUploadProgressReportPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => handleStatusChange('NOT_RESOLVED')}
                        disabled={isUploadProgressReportPending}
                        whileTap={{ scale: isUploadProgressReportPending ? 1 : 0.98 }}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                            selectedStatus === 'NOT_RESOLVED' ? 'bg-white/20' : 'bg-red-100'
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
                onExitComplete={handleAnimationComplete}
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
                                required
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
                                images={progressImages}
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
                                onClick={handleCancel}
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
    );
};

export default ProgressSection;