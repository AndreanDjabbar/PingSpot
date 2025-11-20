"use client";

import React from 'react';
import Image from 'next/image';
import { BsThreeDots } from 'react-icons/bs';
import { FaCrown, FaEdit, FaFlag, FaMapMarkerAlt, FaShare, FaTrash } from 'react-icons/fa';
import { getImageURL, getFormattedDate as formattedDate } from '@/utils';
import { IReport, ReportType } from '@/types/model/report';
import { useConfirmationModalStore, useUserProfileStore } from '@/stores';
import { OptionItem, useOptionsModalStore } from '@/stores/optionsModalStore';
import { useRouter } from 'next/navigation';

interface ReportHeaderProps {
    report: IReport;
}

const getReportTypeLabel = (type: ReportType): string => {
    const types: Record<ReportType, string> = {
        INFRASTRUCTURE: 'Infrastruktur',
        ENVIRONMENT: 'Lingkungan',
        SAFETY: 'Keamanan',
        OTHER: 'Lainnya',
        TRAFFIC: 'Lalu Lintas',
        PUBLIC_FACILITY: 'Fasilitas Umum',
        WASTE: 'Sampah',
        WATER: 'Air',
        ELECTRICITY: 'Listrik',
        HEALTH: 'Kesehatan',
        SOCIAL: 'Sosial',
        EDUCATION: 'Pendidikan',
        ADMINISTRATIVE: 'Administratif',
        DISASTER: 'Bencana Alam'
    };
    return types[type] || 'Lainnya';
};

export const ReportHeader: React.FC<ReportHeaderProps> = ({ report }) => {
    const router = useRouter();
    const optionsButtonRef = React.useRef<HTMLButtonElement | null>(null);
    const userProfile = useUserProfileStore((s) => s.userProfile);
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const openOptionsModal = useOptionsModalStore((s) => s.openOptionsModal);
    const isReportOwner = userProfile ? Number(userProfile.userID) === report.userID : false;

    const handleShare = async (reportId: number, reportTitle: string) => {
        try {
            const shareUrl = `${window.location.origin}/main/reports/${reportId}`;
            if (navigator.share) {
                await navigator.share({
                    title: reportTitle,
                    text: 'Lihat laporan ini di PingSpot',
                    url: shareUrl
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link telah disalin ke clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const opts: OptionItem[] = [
        { label: 'Bagikan',  description: "Lihat komentar dan berikan komentar anda mengenai laporan ini", icon: <FaShare size={14} />, onClick: () => handleShare(report?.id || 0, report?.reportTitle || "") }
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200">
                        <Image
                            src={getImageURL(report.profilePicture || '', "user")}
                            alt={report.fullName}
                            width={48}
                            height={48}
                            className="object-cover h-full w-full"
                        />
                    </div>
                    <div>
                        <div className='flex items-center gap-2'>
                            <div className="font-semibold text-base text-gray-900">{report.userName}</div>
                            <div>
                                {isReportOwner && (  
                                    <FaCrown size={14} className='text-amber-500'/>
                                )}
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            {formattedDate(report.reportCreatedAt, {
                                formatStr: 'dd MMMM yyyy - HH:mm',
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-sm font-semibold text-blue-700 rounded-full">
                        {getReportTypeLabel(report.reportType)}
                    </span>
                    <button
                        ref={optionsButtonRef}
                        className='p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors'
                        onClick={() => {
                            if (!report) return;
                            const optionsToShow: OptionItem[] = [...opts];
                            if (isReportOwner) {
                                if (report.reportStatus !== 'RESOLVED' && report.reportStatus !== 'EXPIRED') {
                                    optionsToShow.push({ label: 'Sunting Laporan', description: "Anda dapat menyunting laporan ini.", icon: <FaEdit size={14} />, onClick: () => router.push(`/main/reports/${report.id}/edit`) });
                                }
                                if (report.reportStatus !== 'RESOLVED' && report.hasProgress) {
                                    optionsToShow.push({ label: 'Perbarui Perkembangan Laporan', description: "Perbarui perkembangan laporan ini", icon: <FaEdit size={14} />, onClick: () => router.push(`/main/reports/${report.id}/update-progress`) });
                                }
                                optionsToShow.push({ label: 'Hapus', icon: <FaTrash size={14} />, onClick: () => openConfirm({ title: 'Hapus laporan', message: 'Yakin ingin menghapus laporan ini?', type: 'warning', onConfirm: () => { console.log('delete report', report.id); } }) });
                            } else {
                                // optionsToShow.push({ label: 'Simpan',  description: "Simpan laporan ini", icon: <FaBookmark size={14} />, onClick: () => onSave(report?.id || 0) },)
                                optionsToShow.push({ label: 'Laporkan', icon: <FaFlag size={14} />, onClick: () => router.push(`/main/reports/${report.id}/report`) });
                            }

                            openOptionsModal({ optionsList: optionsToShow, anchorRef: optionsButtonRef });
                        }}
                    >
                        <BsThreeDots size={18} className="text-gray-600 sm:w-5 sm:h-5"/>
                    </button>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{report.reportTitle}</h1>
            <p className="text-base text-gray-700 leading-relaxed mb-4">{report.reportDescription}</p>

            <div className="flex items-start gap-2 text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <FaMapMarkerAlt className="mt-1 text-red-500 flex-shrink-0" size={16} />
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{report?.location?.detailLocation}</p>
                    {report?.location?.displayName && (
                        <p className="text-xs text-gray-600 mt-1">{report?.location?.displayName}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
