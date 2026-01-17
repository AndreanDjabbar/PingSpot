"use client";

import React from 'react';
import { IReport, ReportType } from '@/types/model/report';
import { getFormattedDate as formattedDate } from '@/utils';
import { useConfirmationModalStore, useFormInformationModalStore, useUserProfileStore } from '@/stores';
import { MdWarning } from 'react-icons/md';
import { ImInfo } from 'react-icons/im';
import { Button } from '@/components/UI';
import { BiEdit } from 'react-icons/bi';
import { useRouter } from 'next/navigation';
import { IoMdTrash } from 'react-icons/io';
import { FaTrash } from 'react-icons/fa';

interface ReportInfoSidebarProps {
    report: IReport;
    onRemoveReport: (reportID: number) => void;
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
    getReportTypeLabel,
    onRemoveReport
}) => {
    const router = useRouter();
    const userProfile = useUserProfileStore((s) => s.userProfile);
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const openFormInfo = useFormInformationModalStore((s) => s.openFormInfo);
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = report && currentUserId === report.userID;
    const isPotentiallyResolved = report?.reportStatus === 'POTENTIALLY_RESOLVED';
    const showWarning = isReportOwner && isPotentiallyResolved;

    const openDeleteConfirm = () => {
        openConfirm({ 
            title: 'Hapus laporan', 
            message: 'Yakin ingin menghapus laporan ini?', 
            type: 'warning', 
                icon: <FaTrash className='text-white' />,
            confirmTitle: 'Hapus', 
            cancelTitle: 'Batal',
            onConfirm: () => { onDeleteClick(report.id); } 
        });
    }

    const onDeleteClick = (reportID: number) => {
        onRemoveReport(reportID);
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 lg:flex-col lg:items-start lg:gap-2 xl:items-center xl:flex-row">
                <h3 className="font-bold text-lg text-gray-900">Informasi Laporan</h3>
                {isReportOwner && report.hasProgress && (
                    <div className='flex gap-2'>
                        <Button
                            onClick={() => router.push(`/main/reports/${report.id}/edit`)}
                            icon={<BiEdit />}
                            size='sm'
                            disabled={report.reportStatus === 'RESOLVED' || report.reportStatus === 'EXPIRED'}
                        >
                            Perbarui  
                        </Button>
                        <Button
                            onClick={() => openDeleteConfirm()}
                            icon={<IoMdTrash />}
                            size='sm'
                            variant='danger'
                            disabled={report.reportStatus === 'RESOLVED' || report.reportStatus === 'EXPIRED'}
                        >
                            Hapus  
                        </Button>
                    </div>
                )}
            </div>
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
                    <p className="text-sm text-gray-900"><span className='text-[11px] text-gray-500'>Pada: </span>
                        {formattedDate(report.reportCreatedAt, {
                            formatStr: 'dd MMMM yyyy, HH:mm',
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
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Perkembangan diperbarui</p>
                    {report.hasProgress && report.reportProgress ? (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col leading-tight">
                                <span className='text-gray-500 text-[11px]'>Oleh: <span className="text-sm font-bold text-gray-700"> {getReportLastUpdatedBy(report.lastUpdatedBy) ?? '-'}</span></span>
                                <p className="text-sm text-gray-900"><span className='text-[11px] text-gray-500'>Pada: </span>
                                    {formattedDate(report.lastUpdatedProgressAt || 0, {
                                        formatStr: 'dd MMMM yyyy, HH:mm',
                                    })}
                                </p>
                            </div>
                            {report.lastUpdatedBy === 'OWNER' && (
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
                            )}
                        </div>
                    ) : (
                        <>
                            {report.hasProgress ? (
                                <span className="text-sm text-gray-900">-</span>
                            ): (
                                <>
                                    <div>
                                        <span className="text-xs text-gray-600 font-medium">Tipe Laporan Tidak Menggunakan pembaruan status</span>
                                    </div>
                                    <div className="h-px bg-gray-200"></div>
                                </>
                            )}
                        </>
                    )}
                </div>
                <div className="h-px bg-gray-200"></div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Laporan diperbarui oleh Pembuat</p>
                    {(report.reportUpdatedAt !== report.reportCreatedAt) && (report.reportUpdatedAt > report.reportCreatedAt) ? (
                        <p className="text-sm text-gray-900"><span className='text-[11px] text-gray-500'>Pada: </span>
                            {formattedDate(report.reportUpdatedAt, {
                                formatStr: 'dd MMMM yyyy, HH:mm',
                            })}
                        </p>
                    ) : (
                        <span className="text-sm text-gray-900">-</span>
                    )}
                </div>
            </div>
        </div>
    );
};
