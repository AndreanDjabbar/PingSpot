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
import { IReport, ReportType } from '@/types/model/report';
import { EmptyState } from '@/components/UI';
import { 
    ReportSkeleton, 
    ReportSearchAndFilter,
    ReportModal,
    ReportList
} from './components';
import { useReactReport } from '@/hooks/main/useReactReport';
import { useReportsStore } from '@/stores/reportsStore';
import { useUserProfileStore } from '@/stores/userProfileStore';

const ReportsPage = () => {
    const currentPath = usePathname();
    const [filteredReports, setFilteredReports] = useState<IReport[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<ReportType | "all">("all");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const {
        reports,
        setReports,
        selectedReport,
        setSelectedReport,
    } = useReportsStore();
    const { userProfile } = useUserProfileStore();

    const router = useRouter();
    const { 
        mutate: reactReport, 
        isError: isReactReportError,  
        error: reactReportError,
    } = useReactReport();

    const { 
        data: getReportData, 
        isLoading: getReportLoading, 
        isSuccess: isGetReportSuccess,
        isError: isGetReportError, 
        error: getReportError,
        refetch: refetchGetReport,
    } = useGetReport()

    useEffect(() => {
        if (isGetReportSuccess && getReportData) {
            setReports(getReportData?.data ?? []);
        }
    }, [isGetReportSuccess, getReportData])

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
                const currentlyLiked = report.isLikedByCurrentUser || false;
                const currentlyDisliked = report.isDislikedByCurrentUser || false;
                
                return {
                    ...report,
                    totalLikeReactions: currentlyLiked 
                        ? (report?.totalLikeReactions || 1) - 1 
                        : (report?.totalLikeReactions || 0) + 1,
                    totalDislikeReactions: currentlyDisliked 
                        ? (report?.totalDislikeReactions || 1) - 1 
                        : (report?.totalDislikeReactions || 0),
                    totalReactions: report.totalReactions,
                    isLikedByCurrentUser: currentlyLiked ? false : true,
                    isDislikedByCurrentUser: currentlyDisliked ? false : false,
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
                const currentlyLiked = report.isLikedByCurrentUser || false;
                const currentlyDisliked = report.isDislikedByCurrentUser || false;
                
                return {
                    ...report,
                    totalReactions: report.totalReactions,
                    totalLikeReactions: currentlyLiked 
                        ? (report?.totalLikeReactions || 1) - 1 
                        : (report?.totalLikeReactions || 0),
                    totalDislikeReactions: currentlyDisliked 
                        ? (report?.totalDislikeReactions || 1) - 1 
                        : (report?.totalDislikeReactions || 0) + 1,
                    isLikedByCurrentUser: currentlyLiked ? false : false,
                    isDislikedByCurrentUser: currentlyDisliked ? false : true,
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

    const handleStatusUpdate = async (reportID: number, newStatus: string) => {
        // The status is already updated in the store by the StatusVoting component
        // This is just a placeholder for any additional logic needed
        console.log(`Report ${reportID} status updated to ${newStatus}`);
    };

    useErrorToast(
        isGetReportError, 
        getErrorResponseMessage(getReportError) || 'Terjadi kesalahan saat mengambil data laporan'
    );

    useErrorToast(
        isReactReportError, 
        getErrorResponseMessage(reactReportError) || 'Terjadi kesalahan saat bereaksi pada laporan'
    );

    useEffect(() => {
        if (isReactReportError) {
            refetchGetReport();
        }
    }, [isReactReportError, refetchGetReport]);

    if (getReportLoading) {
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

            {!getReportLoading && reports.length > 0 && (
                <ReportSearchAndFilter
                    searchTerm={searchTerm}
                    activeFilter={activeFilter}
                    onSearchChange={setSearchTerm}
                    onFilterChange={setActiveFilter}
                />
            )}
            
            {!getReportLoading && (
                <>
                    {filteredReports.length > 0 ? (
                        <ReportList
                            onImageClick={handleImageClick}
                            onLike={handleLike}
                            onDislike={handleDislike}
                            onSave={handleSave}
                            onComment={handleComment}
                            onShare={handleShare}
                            onStatusVote={handleStatusVote}
                            onStatusUpdate={handleStatusUpdate}
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
                    isOpen={isReportModalOpen}
                    onClose={handleCloseReportModal}
                    onLike={() => handleLike(selectedReport.id)}
                    onDislike={() => handleDislike(selectedReport.id)}
                    onSave={() => handleSave(selectedReport.id)}
                    onShare={() => handleShare(selectedReport.id, selectedReport.reportTitle)}
                    onAddComment={(content, parentId) => handleAddComment(selectedReport.id, content, parentId)}
                    onStatusVote={(voteType) => handleStatusVote(selectedReport.id, voteType)}
                    onStatusUpdate={handleStatusUpdate}
                    // isInteractionLoading={reactionMutation.isPending || saveMutation.isPending || voteMutation.isPending || commentMutation.isPending}
                />
            )}
        </div>
    );
};

export default ReportsPage;