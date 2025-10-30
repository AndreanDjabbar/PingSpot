import React, { useState } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaImage, FaMap } from 'react-icons/fa';
import { BsThreeDots } from "react-icons/bs";
import dynamic from 'next/dynamic';
import { IReportImage, ReportType } from '@/types/model/report';
import { getImageURL, getFormattedDate as formattedDate } from '@/utils';
import { ReportInteractionBar } from '@/app/main/reports/components/ReportInteractionBar';
import StatusVoting from './StatusVoting';
import { useReportsStore, useImagePreviewModalStore } from '@/stores';
import { useRouter } from 'next/navigation';

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
    const { reports } = useReportsStore();
    const [viewMode, setViewMode] = useState<'attachment' | 'map'>('map');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { openImagePreview } = useImagePreviewModalStore();
    const router = useRouter();
    const report = reports.find(r => r.id === reportID);

    const images = getReportImages(
        report?.images ?? { id: 0, reportID: 0 }
    );

    if (!report) return null;

    const onImageClick = (imageURL: string) => {
        const url = getImageURL(imageURL, "main");
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
        <div className="bg-white backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className='flex items-center gap-3'>
                        <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200">
                            <Image 
                                src={getImageURL(report?.profilePicture || '', "user")} 
                                alt={report?.fullName}
                                width={40}
                                height={40}
                                className="object-cover h-full w-full"
                            />
                        </div>
                        <div>
                            <div className="font-semibold text-sm text-gray-900">{report?.userName}</div>
                            <div className="text-xs text-gray-500 flex items-center">
                                {formattedDate(report?.reportCreatedAt, {
                                    formatStr: 'dd MMMM yyyy',
                                })}
                            </div>
                        </div>
                    </div>
                    <div className='flex gap-4'>
                        <span className={`inline-flex items-center px-2.5 py-1 bg-blue-50 text-xs font-medium text-sky-800 rounded-full`}>
                            {getReportTypeLabel(report.reportType)}
                        </span>
                        <button className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
                            <BsThreeDots size={20} className="text-gray-600"/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg" onClick={() => router.push(`/main/reports/${report.id}`)}>
                <h2 className="text-base font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">{report.reportTitle}</h2>
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{report.reportDescription}</p>
            </div>

            {images.length > 0 && (
                <div className="px-4 pb-3">
                    <div className="flex items-center justify-center">
                        <div className="inline-flex items-center w-full max-w-md rounded-lg overflow-hidden shadow-sm">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`flex-1 flex items-center justify-center gap-2 px-1 py-2 text-sm font-medium transition-all duration-200 ${
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
                                className={`flex-1 flex items-center justify-center gap-2 px-1 py-2 text-sm font-medium transition-all duration-200 ${
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

            <div className="border-t border-gray-200">
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
                        currentStatus={report.reportStatus || 'PENDING'}
                        onVote={(voteType: string) => onStatusVote(report.id, voteType as 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL')}
                        onImageClick={onImageClick}
                    />
                </div>
            )}
        </div>
    );
};

export default ReportCard;