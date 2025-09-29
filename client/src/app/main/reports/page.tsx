"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HeaderSection from '../components/HeaderSection';
import { BiPlus } from 'react-icons/bi';
import { useRouter } from 'next/navigation';
import { ErrorSection, ImagePreviewModal } from '@/components/feedback';
import { useGetReport } from '@/hooks/main/useGetReport';
import { RxCrossCircled } from "react-icons/rx";
import useErrorToast from '@/hooks/useErrorToast';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils/gerErrorResponse';
import { getDataResponseDetails } from '@/utils/getDataResponse';
import { ReportType, Report } from './types';
import { EmptyState } from '@/components/UI';
import { 
    ReportSkeleton, 
    ReportSearchAndFilter,
    ReportModal,
    ReportList
} from './components';
import { useReactReport } from '@/hooks/main/useReactReport';

const ReportsPage = () => {
    const currentPath = usePathname();
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<ReportType | "all">("all");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const router = useRouter();
    const { 
        mutate: reactReport, 
        isError: isReactReportError,  
        error: reactReportError, 
    } = useReactReport();

    const { 
        mutate: getReport, 
        isPending: getReportPending, 
        isError: isGetReportError, 
        isSuccess: isGetReportSuccess, 
        error: getReportError, 
        data: getReportData 
    } = useGetReport();

    useEffect(() => {
        getReport();
    }, [getReport]);

    useEffect(() => {
        if (isGetReportSuccess && getReportData) {
            const reportData = getDataResponseDetails(getReportData) || [];
            console.log(reportData);
            setReports(reportData);
        }
    }, [isGetReportSuccess, getReportData]);

    useEffect(() => {
        let filtered = reports;
        
        if (searchTerm) {
            filtered = filtered.filter(report => 
                report.reportTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                report.reportDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.location.detailLocation.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (activeFilter !== "all") {
            filtered = filtered.filter(report => report.reportType === activeFilter);
        }
        
        setFilteredReports(filtered);
    }, [searchTerm, activeFilter, reports]);

    const handleImageClick = (imageUrl: string) => {
        setPreviewImage(imageUrl);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPreviewImage(null);
    };

    const handleCloseReportModal = () => {
        setIsReportModalOpen(false);
        setSelectedReport(null);
    };

    const handleLike = async (reportId: number) => {
        const updatedReports = reports.map(report => {
            if (report.id === reportId) {
                const currentlyLiked = report.userInteraction?.hasLiked || false;
                const currentlyDisliked = report.userInteraction?.hasDisliked || false;
                
                return {
                    ...report,
                    reactionStats: {
                        ...report.reactionStats,
                        likes: currentlyLiked 
                            ? (report.reactionStats?.likes || 1) - 1 
                            : (report.reactionStats?.likes || 0) + 1,
                        dislikes: currentlyDisliked 
                            ? (report.reactionStats?.dislikes || 1) - 1 
                            : (report.reactionStats?.dislikes || 0)
                    },
                    userInteraction: {
                        ...report.userInteraction,
                        hasLiked: !currentlyLiked,
                        hasDisliked: false
                    }
                };
            }
            return report;
        });
        
        setReports(updatedReports);
        
        if (selectedReport && selectedReport.id === reportId) {
            const updatedSelectedReport = updatedReports.find(r => r.id === reportId);
            if (updatedSelectedReport) {
                setSelectedReport(updatedSelectedReport);
            }
        }
        
        try {
            reactReport({
                reportID: reportId,
                data: {
                    reactionType: 'LIKE'
                }
            });
        } catch (error) {
            console.error('Error liking report:', error);
        }
    };

    const handleDislike = async (reportId: number) => {
        const updatedReports = reports.map(report => {
            if (report.id === reportId) {
                const currentlyLiked = report.userInteraction?.hasLiked || false;
                const currentlyDisliked = report.userInteraction?.hasDisliked || false;
                
                return {
                    ...report,
                    reactionStats: {
                        ...report.reactionStats,
                        likes: currentlyLiked 
                            ? (report.reactionStats?.likes || 1) - 1 
                            : (report.reactionStats?.likes || 0),
                        dislikes: currentlyDisliked 
                            ? (report.reactionStats?.dislikes || 1) - 1 
                            : (report.reactionStats?.dislikes || 0) + 1
                    },
                    userInteraction: {
                        ...report.userInteraction,
                        hasLiked: false,
                        hasDisliked: !currentlyDisliked
                    }
                };
            }
            return report;
        });
        
        setReports(updatedReports);
        
        if (selectedReport && selectedReport.id === reportId) {
            const updatedSelectedReport = updatedReports.find(r => r.id === reportId);
            if (updatedSelectedReport) {
                setSelectedReport(updatedSelectedReport);
            }
        }
        
        try {
            reactReport({
                reportID: reportId,
                data: {
                    reactionType: 'DISLIKE'
                }
            });
        } catch (error) {
            console.error('Error disliking report:', error);
        }
    }

    const handleSave = async (reportId: number) => {
        try {

        } catch (error) {
            console.error('Error saving report:', error);
        }
    };

    const handleComment = (reportId: number) => {
        const report = filteredReports.find(r => r.id === reportId);
        if (report) {
            setSelectedReport(report);
            setIsReportModalOpen(true);
        }
    };

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

    const handleAddComment = async (reportId: number, content: string, parentId?: number) => {
        try {
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleStatusVote = async (reportId: number, voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL') => {
        try {

        } catch (error) {
            console.error('Error voting on status:', error);
        }
    };

    useErrorToast(
        isGetReportError, 
        getErrorResponseMessage(getReportError) || 'Terjadi kesalahan saat mengambil data laporan'
    );

    // Add this new error toast for reaction errors
    useErrorToast(
        isReactReportError, 
        getErrorResponseMessage(reactReportError) || 'Terjadi kesalahan saat bereaksi pada laporan'
    );

    // Rollback optimistic update on error
    useEffect(() => {
        if (isReactReportError) {
            // Rollback by refetching data
            getReport();
        }
    }, [isReactReportError, getReport]);

    if (getReportPending) {
        return <ReportSkeleton currentPath={currentPath} />;
    }

    return (
        <div className="space-y-8">
            <HeaderSection 
                currentPath={currentPath}
                message='Temukan dan lihat laporan masalah di sekitar Anda untuk meningkatkan kesadaran dan partisipasi masyarakat.'>
                <button 
                    className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-sky-500/25 transition-all flex items-center space-x-2"
                    onClick={() => router.push('/main/reports/create-report')}>
                    <BiPlus className="w-5 h-5" />
                    <span>Buat Laporan Baru</span>
                </button>
            </HeaderSection>
            
            {isGetReportError && (
                <ErrorSection
                    message={getErrorResponseMessage(getReportError) || 'Terjadi kesalahan saat mengambil data laporan'}
                    errors={getErrorResponseDetails(getReportError) || []}
                />
            )}

            {!getReportPending && reports.length > 0 && (
                <ReportSearchAndFilter
                    searchTerm={searchTerm}
                    activeFilter={activeFilter}
                    onSearchChange={setSearchTerm}
                    onFilterChange={setActiveFilter}
                />
            )}
            
            {!getReportPending && (
                <>
                    {filteredReports.length > 0 ? (
                        <ReportList
                            reports={filteredReports}
                            onImageClick={handleImageClick}
                            onLike={handleLike}
                            onDislike={handleDislike}
                            onSave={handleSave}
                            onComment={handleComment}
                            onShare={handleShare}
                            onStatusVote={handleStatusVote}
                        />
                    ) : reports.length === 0 && !isGetReportError ? (
                        <EmptyState 
                            emptyTitle='Belum ada laporan'
                            emptyMessage='Jadilah yang pertama membuat laporan untuk komunitas Anda'
                            showCommandButton={true}
                            commandLabel='Buat Laporan'
                            emptyIcon={<RxCrossCircled />}
                            onCommandButton={() => router.push('/main/reports/create-report')} 
                        />
                    ) : (
                        <EmptyState 
                            emptyTitle='Laporan tidak ditemukan'
                            emptyMessage='Coba sesuaikan kata kunci pencarian atau filter Anda'
                            emptyIcon={<RxCrossCircled />}
                            showCommandButton={false}
                        />
                    )}
                </>
            )}
            
            <ImagePreviewModal
                imageUrl={previewImage}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />

            {selectedReport && (
                <ReportModal
                    report={selectedReport}
                    isOpen={isReportModalOpen}
                    onClose={handleCloseReportModal}
                    currentUserId={1}
                    onLike={() => handleLike(selectedReport.id)}
                    onDislike={() => handleDislike(selectedReport.id)}
                    onSave={() => handleSave(selectedReport.id)}
                    onShare={() => handleShare(selectedReport.id, selectedReport.reportTitle)}
                    onAddComment={(content, parentId) => handleAddComment(selectedReport.id, content, parentId)}
                    onStatusVote={(voteType) => handleStatusVote(selectedReport.id, voteType)}
                    // isInteractionLoading={reactionMutation.isPending || saveMutation.isPending || voteMutation.isPending || commentMutation.isPending}
                />
            )}
        </div>
    );
};

export default ReportsPage;