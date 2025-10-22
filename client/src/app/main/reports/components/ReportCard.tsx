import React from 'react';
import Image from 'next/image';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { BsThreeDots } from "react-icons/bs";
import dynamic from 'next/dynamic';
import { ReportType } from '@/types/model/report';
import { getImageURL, getFormattedDate as formattedDate } from '@/utils';
import { ReportInteractionBar } from '@/app/main/reports/components/ReportInteractionBar';
import StatusVoting from './StatusVoting';
import { useReportsStore, useImagePreviewModalStore } from '@/stores';

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
        OTHER: 'Lainnya'
    };
    return types[type] || 'Lainnya';
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
    const { openImagePreview } = useImagePreviewModalStore();

    const report = reports.find(r => r.id === reportID);

    if (!report) return null;

    const onImageClick = (imageURL: string) => {
        openImagePreview(imageURL);
    }

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
                        <span className={`inline-flex items-center px-2.5 py-1 bg-blue-50 text-xs font-medium text-blue-700 rounded-full`}>
                            {getReportTypeLabel(report.reportType)}
                        </span>
                        <button className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
                            <BsThreeDots size={20} className="text-gray-600"/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-3">
                <h2 className="text-base font-semibold text-gray-900 mb-1">{report.reportTitle}</h2>
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{report.reportDescription}</p>
                
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                        <FaMapMarkerAlt className="mr-1.5 text-red-500" size={14} />
                        <span className="line-clamp-1">{report.location.detailLocation}</span>
                    </div>
                </div>
            </div>
            
            <div className="w-full">
                <div className="relative w-full overflow-hidden bg-gray-100">
                    <StaticMap
                        latitude={report.location.latitude}
                        longitude={report.location.longitude}
                        height={380}
                        markerColor='red'
                        popupText={report.reportTitle}
                    />
                </div>
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
                        currentStatus={report.status || 'PENDING'}
                        onVote={(voteType: string) => onStatusVote(report.id, voteType as 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL')}
                        onImageClick={onImageClick}
                    />
                </div>
            )}
        </div>
    );
};

export default ReportCard;