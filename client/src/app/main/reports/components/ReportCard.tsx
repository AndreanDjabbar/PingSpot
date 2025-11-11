/* eslint-disable react-hooks/purity */
import React, { useState } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaImage, FaMap, FaCrown, FaShare, FaBookmark, FaFlag, FaEdit, FaTrash, FaComment } from 'react-icons/fa';
import { BsThreeDots } from "react-icons/bs";
import { useOptionsModalStore } from '@/stores';
import type { OptionItem } from '@/stores/optionsModalStore';
import { useConfirmationModalStore } from '@/stores/confirmationModalStore';
import dynamic from 'next/dynamic';
import { IReportImage, ReportType } from '@/types/model/report';
import { getImageURL, getFormattedDate as formattedDate } from '@/utils';
import { ReportInteractionBar } from '@/app/main/reports/components/ReportInteractionBar';
import StatusVoting from './StatusVoting';
import { useReportsStore, useImagePreviewModalStore, useUserProfileStore } from '@/stores';
import { useRouter } from 'next/navigation';
import { LuNotepadText } from 'react-icons/lu';
import { cn } from '@/lib/utils';

const StaticMap = dynamic(() => import('@/app/main/components/StaticMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded-lg"></div>
});

interface ReportCardProps {
    reportID: number;
    onLike: (reportId: number) => void;
    onDislike: (reportId: number) => void;
    onSave: (reportId: number) => void;
    onComment: (reportId: number) => void;
    onShare: (reportId: number, reportTitle: string) => void;
    onStatusVote: (reportId: number, voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL') => void;
    onStatusUpdate?: (reportID: number, newStatus: string) => void;
}

const getReportTypeLabel = (type: ReportType): string => {
    const types = {
        INFRASTRUCTURE: 'Infrastruktur',
        ENVIRONMENT: 'Lingkungan',
        SAFETY: 'Keamanan',
        TRAFFIC: 'Lalu Lintas',
        PUBLIC_FACILITY: 'Fasilitas Umum',
	    WASTE: 'Sampah',
	    WATER: 'Air',
	    ELECTRICITY: 'Listrik',
	    HEALTH: 'Kesehatan',
	    SOCIAL: 'Sosial',
	    EDUCATION: 'Pendidikan',	
        ADMINISTRATIVE: 'Administratif',
	    DISASTER: 'Bencana Alam',
        OTHER: 'Lainnya'
    };
    return types[type] || 'Lainnya';
};

const getReportImages = (images: IReportImage): string[] => {
    if (!images) return [];
    return [
        images.image1URL, 
        images.image2URL, 
        images.image3URL,
        images.image4URL,
        images.image5URL
    ].filter((url): url is string => typeof url === 'string');
};

const ReportCard: React.FC<ReportCardProps> = ({
    reportID,
    onLike,
    onDislike,
    onSave,
    onComment,
    onShare,
    onStatusVote,
}) => {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'attachment' | 'map'>('map');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const reports = useReportsStore((s) => s.reports);
    const userProfile = useUserProfileStore((s) => s.userProfile);
    const openOptionsModal = useOptionsModalStore((s) => s.openOptionsModal);
    const openConfirm = useConfirmationModalStore((s) => s.openConfirm);
    const userID = Number(userProfile?.userID);
    const openImagePreview = useImagePreviewModalStore((s) => s.openImagePreview);
    const report = reports.find(r => r.id === reportID);
    const optionsButtonRef = React.useRef<HTMLButtonElement | null>(null);
    
    const opts: OptionItem[] = [
        { label: 'Bagikan',  description: "Lihat komentar dan berikan komentar anda mengenai laporan ini", icon: <FaShare size={14} />, onClick: () => onShare(report?.id || 0, report?.reportTitle || "") }
    ];

    const images = getReportImages(
        report?.images ?? { id: 0, reportID: 0 }
    );

    if (!report) return null;
    const isReportOwner = userID === report?.userID;

    const onImageClick = (imageURL: string) => {
        const url = getImageURL(imageURL, "main");
        console.log("Opening image preview for URL:", url);
        openImagePreview(url);
    }

    const nextImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    return (
        <div id={`report-${report.id}`} className="bg-white backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                        <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                            <Image 
                                src={getImageURL(report?.profilePicture || '', "user")} 
                                alt={report?.fullName}
                                width={40}
                                height={40}
                                className="object-cover h-full w-full"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className='flex gap-2 items-center'>
                                <div className="font-semibold text-sm text-gray-900 truncate">{report?.userName}</div>
                                <div>
                                    {isReportOwner && (  
                                        <FaCrown size={14} className='text-amber-500'/>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                                <div className="whitespace-nowrap">
                                    {formattedDate(report?.reportCreatedAt, {
                                        formatStr: 'dd MMM yyyy',
                                    })}
                                </div>
                                <span>-</span>
                                <div>
                                    {formattedDate(report?.reportCreatedAt, {
                                        formatStr: 'HH:mm',
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex items-center gap-1 sm:gap-2 flex-shrink-0'>
                        <span className={`inline-flex items-center px-2.5 py-1 bg-blue-50 text-xs font-bold text-sky-800 rounded-full`}>
                            {getReportTypeLabel(report.reportType)}
                        </span>

                        <button
                            ref={optionsButtonRef}
                            className='p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors'
                            onClick={() => {
                                if (!report) return;
                                const optionsToShow: OptionItem[] = [...opts];
                                if (isReportOwner) {
                                    optionsToShow.push({ label: 'Sunting Laporan', description: "Anda dapat menyunting laporan ini.", icon: <FaEdit size={14} />, onClick: () => router.push(`/main/reports/${report.id}/edit`) });
                                    optionsToShow.push({ label: 'Detail Laporan', description: "Lihat detail laporan yang telah anda buat", icon: <LuNotepadText size={14} />, onClick: () => router.push(`/main/reports/${report.id}`) });
                                    optionsToShow.push({ label: 'Perbarui Perkembangan Laporan', description: "Perbarui perkembangan laporan ini", icon: <FaEdit size={14} />, onClick: () => router.push(`/main/reports/${report.id}/update-progress`) });
                                    optionsToShow.push({ label: 'Hapus', icon: <FaTrash size={14} />, onClick: () => openConfirm({ title: 'Hapus laporan', message: 'Yakin ingin menghapus laporan ini?', type: 'warning', onConfirm: () => { console.log('delete report', report.id); } }) });
                                } else {
                                    optionsToShow.push({ label: 'Simpan',  description: "Simpan laporan ini", icon: <FaBookmark size={14} />, onClick: () => onSave(report?.id || 0) },)
                                    optionsToShow.push({ label: 'Laporkan', icon: <FaFlag size={14} />, onClick: () => router.push(`/main/reports/${report.id}/report`) });
                                }

                                openOptionsModal({ optionsList: optionsToShow, anchorRef: optionsButtonRef });
                            }}
                        >
                            <BsThreeDots size={18} className="text-gray-600 sm:w-5 sm:h-5"/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg" onClick={() => router.push(`/main/reports/${report.id}`)}>
                <h2 className="text-base font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">{report.reportTitle}</h2>
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{report.reportDescription}</p>
            </div>

            {images.length > 0 && (
                <div className="px-4 pb-3 cursor-pointer">
                    <div className="flex items-center justify-center">
                        <div className="inline-flex items-center w-full max-w-md rounded-lg overflow-hidden shadow-sm">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`flex-1 flex items-center justify-center gap-2 px-1 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                                    viewMode === 'map'
                                        ? 'bg-gray-400 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <FaMap size={15} />
                                <span>Peta</span>
                            </button>
                            <button
                                onClick={() => setViewMode('attachment')}
                                className={`flex-1 flex items-center justify-center gap-2 px-1 py-2 text-sm font-medium transition-all cursor-pointer duration-200 ${
                                    viewMode === 'attachment'
                                        ? 'bg-gray-400 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <FaImage size={15} />
                                <span>Lampiran</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="w-full px-4 pb-4">
                {viewMode == 'attachment' && images.length > 0 && (
                    <div className="relative">
                        <div className="relative h-[380px] rounded-xl overflow-hidden bg-gray-100 shadow-md">
                            <Image 
                                src={getImageURL(`/report/${images[currentImageIndex]}`, "main")}
                                alt={`Foto ${currentImageIndex + 1} untuk laporan ${report?.reportTitle}`}
                                fill
                                className="object-cover cursor-pointer transition-transform duration-300"
                                onClick={() => onImageClick(`/report/${images[currentImageIndex]}`)}
                            />
                            
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-2.5 rounded-full hover:bg-opacity-100 hover:scale-110 transition-all shadow-lg"
                                        aria-label="Previous image"
                                    >
                                        <FaChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-2.5 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                                        aria-label="Next image"
                                    >
                                        <FaChevronRight className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                                        {currentImageIndex + 1} / {images.length}
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {images.length > 1 && (
                            <div className="flex justify-center gap-1.5 mt-3">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`h-2 rounded-full transition-all duration-200 ${
                                            index === currentImageIndex
                                                ? 'w-6 bg-blue-600'
                                                : 'w-2 bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {viewMode == 'map' && (
                    <div className="relative">
                        <div className="relative w-full overflow-hidden bg-gray-100 rounded-xl shadow-md">
                                <StaticMap
                                    key={`map-${report.id}-${Date.now()}`}
                                    latitude={report.location.latitude}
                                    longitude={report.location.longitude}
                                    height={380}
                                    markerColor='red'
                                    popupText={report.reportTitle}
                                />
                        </div>
                        <div className="mt-4 bg-gray-100 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <FaMapMarkerAlt className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{report.location.detailLocation}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {report.location.displayName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className={cn("border-gray-200", report.hasProgress && "")}>
                <ReportInteractionBar
                    reportID={report.id}
                    userInteraction={report.userInteraction || { hasLiked: false, hasDisliked: false, hasSaved: false }}
                    commentCount={report.commentCount || 0}
                    onLike={() => onLike(report.id)}
                    onDislike={() => onDislike(report.id)}
                    onSave={() => onSave(report.id)}
                    onComment={() => onComment(report.id)}
                    onShare={() => onShare(report.id, report.reportTitle)}
                />
            </div>

            {report.hasProgress && (
                <div className="border-t border-gray-200">
                    <StatusVoting
                        reportID={report.id}
                        onVote={(voteType: string) => onStatusVote(report.id, voteType as 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL')}
                        onImageClick={onImageClick}
                    />
                </div>
            )}
        </div>
    );
};

export default ReportCard;