import React from 'react';
import ReportCard from './ReportCard';
import { useReportsStore } from '@/stores/reportsStore';

interface ReportListProps {
    onImageClick: (imageUrl: string) => void;
    onLike: (reportId: number) => void;
    onDislike: (reportId: number) => void;
    onSave: (reportId: number) => void;
    onComment: (reportId: number) => void;
    onShare: (reportId: number, reportTitle: string) => void;
    onStatusVote: (reportId: number, voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL') => void;
}

const ReportList: React.FC<ReportListProps> = ({
    onImageClick,
    onLike,
    onDislike,
    onSave,
    onComment,
    onShare,
    onStatusVote
}) => {
    const { reports } = useReportsStore();
    return (
        <div className="space-y-6">
        {reports.map(report => (
            <ReportCard
            key={report.id}
            reportID={report.id}
            onImageClick={onImageClick}
            onLike={onLike}
            onDislike={onDislike}
            onSave={onSave}
            onComment={onComment}
            onShare={onShare}
            onStatusVote={onStatusVote}
            />
        ))}
        </div>
    );
};

export default ReportList;