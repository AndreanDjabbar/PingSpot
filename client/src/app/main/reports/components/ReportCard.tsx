import React from 'react';
import Image from 'next/image';
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { BsThreeDots } from "react-icons/bs";
import dynamic from 'next/dynamic';
import { ReportType, IReportImage } from '@/types/entity/mainTypes';
import { getImageURL } from '@/utils/getImageURL';
import { formattedDate } from '@/utils/getFormattedDate';
import { ReportInteractionBar } from '@/app/main/reports/components/ReportInteractionBar';
import StatusVoting from './StatusVoting';
import { useReportsStore } from '@/stores/reportsStore';

const StaticMap = dynamic(() => import('@/app/main/components/StaticMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded-lg"></div>
});

interface ReportCardProps {
    reportID: number;
    onImageClick: (imageUrl: string) => void;
    onLike: (reportId: number) => void;
    onDislike: (reportId: number) => void;
    onSave: (reportId: number) => void;
    onComment: (reportId: number) => void;
    onShare: (reportId: number, reportTitle: string) => void;
    onStatusVote: (reportId: number, voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL') => void;
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
    onImageClick,
    onLike,
    onDislike,
    onSave,
    onComment,
    onShare,
    onStatusVote
}) => {
    const { reports } = useReportsStore();
    const report = reports.find(r => r.id === reportID);

    if (!report) return null;

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl overflow-hidden transition-all duration-300">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className='flex gap-5'>
                        <div className="flex items-center">
                            {report && (
                                <div className="h-10 w-10 rounded-full overflow-hidden mr-3 border-2 border-white shadow">
                                <Image 
                                    src={getImageURL(report?.profilePicture || '', "user")} 
                                    alt={report?.fullName}
                                    width={40}
                                    height={40}
                                    className="object-cover h-full w-full"
                                />
                                </div>
                            )}
                            <div>
                                <div className="font-medium text-sky-900">{report?.userName}</div>
                                <div className="text-xs text-gray-500 flex items-center">
                                <FaCalendarAlt className="mr-1" size={12} />
                                {formattedDate(report?.reportCreatedAt, {
                                    formatStr: 'dd MMMM yyyy - HH:mm',
                                })}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`inline-block px-3 py-1 bg-sky-900 text-xs font-medium text-white rounded-full ${report.reportType}`}>
                                {getReportTypeLabel(report.reportType)}
                            </span>
                        </div>
                    </div>
                    <div className='flex gap-10'>
                        <div className="flex items-center space-x-2">
                            <span className={`inline-block text-xs font-medium text-sky-900 rounded-full`}>
                                <BsThreeDots size={20}/>
                            </span>
                        </div>
                    </div>
                </div>
                
                <h2 className="text-xl font-bold text--900 graymb-2">{report.reportTitle}</h2>
                <p className="text-gray-700 mb-4">{report.reportDescription}</p>
                
                <div className="flex items-start mb-5 text-gray-600">
                    <FaMapMarkerAlt className="mt-1 mr-2 flex-shrink-0 text-red-500" />
                    <div>
                        <div className="font-medium">{report.location.detailLocation}</div>
                        {report.location.displayName && (
                        <div className="text-sm text-gray-500">{report.location.displayName}</div>
                        )}
                    </div>
                </div>
                
                <div className='flex flex-col items lg:flex-row gap-4'>
                    <div className="lg:w-1/2">
                        <div className="h-full rounded-lg overflow-hidden">
                            <StaticMap
                                latitude={report.location.latitude}
                                longitude={report.location.longitude}
                                height={403}
                                markerColor='red'
                                popupText={report.reportTitle}
                            />
                        </div>
                    </div>
                    
                    <div className="lg:w-1/2">
                        {getReportImages(report.images).length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Foto Permasalahan:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {getReportImages(report.images).map((imageUrl, index) => (
                                <div 
                                key={`${report.id}-image-${index}`}
                                className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border-2 border-white shadow"
                                onClick={() => onImageClick(getImageURL(`/report/${imageUrl}`, "main"))}
                                >
                                <Image 
                                    src={getImageURL(`/report/${imageUrl}`, "main")}
                                    alt={`Foto ${index + 1} untuk laporan ${report.reportTitle}`}
                                    fill
                                    className="object-cover"
                                />
                                </div>
                            ))}
                            </div>
                        </div>
                        )}
                    </div>
                </div>

                <ReportInteractionBar
                reportID={report.id}
                userInteraction={report.userInteraction || { hasLiked: false, hasDisliked: false, hasSaved: false }}
                commentCount={report.commentCount || 0}
                onLike={() => onLike(report.id)}
                onDislike={() => onDislike(report.id)}
                onSave={() => onSave(report.id)}
                onComment={() => onComment(report.id)}
                onShare={() => onShare(report.id, report.reportTitle)}
                // isLoading={reactionMutation.isPending || saveMutation.isPending}
                />

                <StatusVoting
                currentStatus={report.status || 'PENDING'}
                statusVoteStats={report.statusVoteStats || { resolved: 0, notResolved: 0, neutral: 0 }}
                userCurrentVote={report.userInteraction?.currentVote || null}
                onVote={(voteType: string) => onStatusVote(report.id, voteType as 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL')}
                // isLoading={voteMutation.isPending}
                />
            </div>
        </div>
    );
};

export default ReportCard;