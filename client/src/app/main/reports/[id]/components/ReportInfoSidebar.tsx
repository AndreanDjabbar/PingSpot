"use client";

import React from 'react';
import { IReport, ReportType } from '@/types/model/report';
import { getFormattedDate as formattedDate } from '@/utils';
import { useFormInformationModalStore, useUserProfileStore } from '@/stores';
import { MdWarning } from 'react-icons/md';
import { ImInfo } from 'react-icons/im';

interface ReportInfoSidebarProps {
    report: IReport;
    getReportTypeLabel: (type: ReportType) => string;
}

const getReportLastUpdatedBy = (lastUpdatedBy?: string): string | null => {
    const types: Record<string, string> = {
        OWNER: 'Pemilik Laporan',
        SYSTEM: 'Sistem'
    };
    if (!lastUpdatedBy) return null;
    return types[lastUpdatedBy] ?? null;
};

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

const getStatusColor = (status: string) => {
    switch (status) {
        case 'RESOLVED':
            return 'bg-green-700 border-green-700 text-white';
        case 'EXPIRED':
            return 'bg-indigo-700 text-white';
        case 'POTENTIALLY_RESOLVED':
            return 'bg-blue-700 text-white';
        case 'NOT_RESOLVED':
            return 'bg-red-700 text-white';
        case 'ON_PROGRESS':
            return 'bg-yellow-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
};

export const ReportInfoSidebar: React.FC<ReportInfoSidebarProps> = ({ 
    report, 
    getReportTypeLabel 
}) => {
    const { userProfile } = useUserProfileStore();
    const { openFormInfo } = useFormInformationModalStore();
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = report && currentUserId === report.userID;
    const isPotentiallyResolved = report?.reportStatus === 'POTENTIALLY_RESOLVED';
    const showWarning = isReportOwner && isPotentiallyResolved;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Informasi Laporan</h3>
            <div className="space-y-3">
                {report.hasProgress ? (
                    <>
                        <div className='flex'>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
                                <div className='flex items-center'>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.reportStatus)}`}>
                                        {getStatusLabel(report.reportStatus)}
                                    </span>
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
                            </div>
                            <div>
                            </div>
                        </div>
                        <div className="h-px bg-gray-200"></div>
                    </>
                ) : (
                    <>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                            <span className="text-xs text-gray-600 font-medium">Tipe Laporan Tidak Menggunakan Status</span>
                        </div>
                        <div className="h-px bg-gray-200"></div>
                    </>
                )}
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dilaporkan</p>
                    <p className="text-sm text-gray-900">
                        {formattedDate(report.reportCreatedAt, {
                            formatStr: 'dd MMMM yyyy',
                        })}
                    </p>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kategori</p>
                    <p className="text-sm text-gray-900">{getReportTypeLabel(report.reportType)}</p>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Terakhir diperbarui oleh</p>
                    {report.hasProgress ? (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col leading-tight">
                                <span className="text-sm font-bold text-gray-700">{getReportLastUpdatedBy(report.lastUpdatedBy) ?? '-'}</span>
                                <span className="text-[11px] text-gray-500">pada: <span className="font-medium text-gray-700">{formattedDate(report.reportUpdatedAt, { formatStr: 'dd MMM yyyy, HH:mm' })}</span></span>
                            </div>
                            <button 
                                onClick={() => openFormInfo({
                                    title: 'Laporan Diperbarui Oleh Pemilik Laporan',
                                    type: 'warning',
                                    description: 'Status laporan ini diperbarui oleh pemilik laporan. Kebenaran informasi sepenuhnya bergantung pada validasi dari pemilik laporan.',
                                    additionalInfo: 'Pastikan anda memastikan ulang informasi dari laporan ini.'
                                })}
                                className='ml-auto inline-flex items-center p-1.5 sm:p-2 hover:bg-yellow-50 rounded-full transition-colors group cursor-pointer'
                                aria-label="Informasi status laporan"
                            >
                                <ImInfo size={16} className="text-yellow-600 group-hover:text-yellow-700 transition-colors sm:w-6 sm:h-6"/>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div>
                                <span className="text-xs text-gray-600 font-medium">Tipe Laporan Tidak Menggunakan pembaruan status</span>
                            </div>
                            <div className="h-px bg-gray-200"></div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
