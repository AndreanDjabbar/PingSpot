import React from 'react';
import ReportCard from './ReportCard';
import { useReportsStore } from '@/stores';

interface ReportListProps {
    onLike: (reportId: number) => void;
    onDislike: (reportId: number) => void;
    onSave: (reportId: number) => void;
    onComment: (reportId: number) => void;
    onShare: (reportId: number, reportTitle: string) => void;
    onStatusVote: (reportId: number, voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL') => void;
}

const ReportList: React.FC<ReportListProps> = ({
    onLike,
    onDislike,
    onSave,
    onComment,
    onShare,
    onStatusVote,
}) => { 
    const filteredReports = useReportsStore((s) => s.filteredReports);

    return (
        <div className="space-y-4">
            {filteredReports.map(report => (
                <ReportCard
                    key={report.id}
                    reportID={report.id}
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