import React from 'react';
import { Report } from '@/app/main/reports/types';
import ReportCard from './ReportCard';

interface ReportListProps {
    reports: Report[];
    onImageClick: (imageUrl: string) => void;
    onLike: (reportId: number) => void;
    onDislike: (reportId: number) => void;
    onSave: (reportId: number) => void;
    onComment: (reportId: number) => void;
    onShare: (reportId: number, reportTitle: string) => void;
    onStatusVote: (reportId: number, voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL') => void;
}

const ReportList: React.FC<ReportListProps> = ({
    reports,
    onImageClick,
    onLike,
    onDislike,
    onSave,
    onComment,
    onShare,
    onStatusVote
}) => {
    return (
        <div className="space-y-6">
        {reports.map(report => (
            <ReportCard
            key={report.id}
            report={report}
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