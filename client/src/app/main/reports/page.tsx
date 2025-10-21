"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HeaderSection from '../components/HeaderSection';
import { BiPlus } from 'react-icons/bi';
import { useRouter } from 'next/navigation';
import { ErrorSection } from '@/components/feedback';
import { useGetReport, useReactReport } from '@/hooks/main';
import { useVoteReport } from '@/hooks/main/useVoteReport';
import { RxCrossCircled } from "react-icons/rx";
import { useErrorToast } from '@/hooks/toast';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils';
import { IReport, ReportType } from '@/types/model/report';
import { EmptyState } from '@/components/UI';
import { 
    ReportSkeleton, 
    ReportSearchAndFilter,
    ReportModal,
    ReportList
} from './components';
import { useReportsStore } from '@/stores';
import { useInView } from 'react-intersection-observer';

const ReportsPage = () => {
    const currentPath = usePathname();
    const [filteredReports, setFilteredReports] = useState<IReport[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<ReportType | "all">("all");
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const { ref, inView } = useInView({
        threshold: 0,
    });

    const {
        reports,
        setReports,
        selectedReport,
        setSelectedReport,
        setNextCursor
    } = useReportsStore();

    const router = useRouter();
    const { 
        mutate: reactReport, 
        isError: isReactReportError,  
        error: reactReportError,
    } = useReactReport();

    const {
        mutate: voteReport,
        isError: isVoteReportError,
        error: voteReportError,
    } = useVoteReport();

    const { 
        data: getReportData, 
        isLoading: getReportLoading, 
        isSuccess: isGetReportSuccess,
        isError: isGetReportError, 
        error: getReportError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch: refetchGetReport,
    } = useGetReport();

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
    };

    const handleStatusVote = async (reportId: number, voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'NEUTRAL') => {
        const updatedReports = reports.map(report => {
            if (report.id !== reportId) return report;

            let totalResolvedVotes = report.totalResolvedVotes || 0;
            let totalNotResolvedVotes = report.totalNotResolvedVotes || 0;
            let totalVotes = report.totalVotes !== undefined
                ? report.totalVotes
                : (totalResolvedVotes + totalNotResolvedVotes);

            const isResolved = !!report.isResolvedByCurrentUser;
            const isNotResolved = !!report.isNotResolvedByCurrentUser;

            if (voteType === 'RESOLVED') {
                if (isResolved) {
                    totalResolvedVotes = Math.max(0, totalResolvedVotes - 1);
                    totalVotes = Math.max(0, totalVotes - 1);
                    return {
                        ...report,
                        totalResolvedVotes,
                        totalVotes,
                        isResolvedByCurrentUser: false,
                        isNotResolvedByCurrentUser: false,
                    };
                } else if (isNotResolved) {
                    totalNotResolvedVotes = Math.max(0, totalNotResolvedVotes - 1);
                    totalResolvedVotes = totalResolvedVotes + 1;
                    return {
                        ...report,
                        totalNotResolvedVotes,
                        totalResolvedVotes,
                        isResolvedByCurrentUser: true,
                        isNotResolvedByCurrentUser: false,
                    };
                } else {
                    totalResolvedVotes = totalResolvedVotes + 1;
                    totalVotes = totalVotes + 1;
                    return {
                        ...report,
                        totalResolvedVotes,
                        totalVotes,
                        isResolvedByCurrentUser: true,
                        isNotResolvedByCurrentUser: false,
                    };
                }
            }

            if (voteType === 'NOT_RESOLVED') {
                if (isNotResolved) {
                    totalNotResolvedVotes = Math.max(0, totalNotResolvedVotes - 1);
                    totalVotes = Math.max(0, totalVotes - 1);
                    return {
                        ...report,
                        totalNotResolvedVotes,
                        totalVotes,
                        isResolvedByCurrentUser: false,
                        isNotResolvedByCurrentUser: false,
                    };
                } else if (isResolved) {
                    totalResolvedVotes = Math.max(0, totalResolvedVotes - 1);
                    totalNotResolvedVotes = totalNotResolvedVotes + 1;
                    return {
                        ...report,
                        totalResolvedVotes,
                        totalNotResolvedVotes,
                        isResolvedByCurrentUser: false,
                        isNotResolvedByCurrentUser: true,
                    };
                } else {
                    totalNotResolvedVotes = totalNotResolvedVotes + 1;
                    totalVotes = totalVotes + 1;
                    return {
                        ...report,
                        totalNotResolvedVotes,
                        totalVotes,
                        isResolvedByCurrentUser: false,
                        isNotResolvedByCurrentUser: true,
                    };
                }
            }

            if (voteType === 'NEUTRAL') {
                if (isResolved) {
                    totalResolvedVotes = Math.max(0, totalResolvedVotes - 1);
                    totalVotes = Math.max(0, totalVotes - 1);
                } else if (isNotResolved) {
                    totalNotResolvedVotes = Math.max(0, totalNotResolvedVotes - 1);
                    totalVotes = Math.max(0, totalVotes - 1);
                }
                return {
                    ...report,
                    totalResolvedVotes,
                    totalNotResolvedVotes,
                    totalVotes,
                    isResolvedByCurrentUser: false,
                    isNotResolvedByCurrentUser: false,
                };
            }

            return report;
        });

        setReports(updatedReports);
        
        if (selectedReport && selectedReport.id === reportId) {
            const updatedSelected = updatedReports.find(r => r.id === reportId);
            if (updatedSelected) setSelectedReport(updatedSelected);
        }

        try {
            if (voteType !== 'NEUTRAL') {
                voteReport({
                    reportID: reportId,
                    data: { voteType: voteType as 'RESOLVED' | 'NOT_RESOLVED' },
                });
            }
        } catch (error) {
            console.error('Error voting on status:', error);
        }
    };

    const handleSave = async (reportId: number) => {
        console.log('Saving report:', reportId);
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
        console.log("Adding comment to report:", reportId, "Content:", content, "Parent ID:", parentId);
    };

    useErrorToast(
        isGetReportError, 
        getErrorResponseMessage(getReportError) || 'Terjadi kesalahan saat mengambil data laporan'
    );

    useErrorToast(
        isReactReportError, 
        getErrorResponseMessage(reactReportError) || 'Terjadi kesalahan saat bereaksi pada laporan'
    );

    useErrorToast(
        isVoteReportError,
        getErrorResponseMessage(voteReportError) || 'Terjadi kesalahan saat melakukan vote status'
    );

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        if (isGetReportSuccess && getReportData) {
            const allReports = getReportData.pages.flatMap(page => page.data?.reports ?? []);
            setReports(allReports);
            
            const lastPage = getReportData.pages[getReportData.pages.length - 1];
            setNextCursor(lastPage.data?.nextCursor ?? null);
        }
    }, [isGetReportSuccess, getReportData, setReports, setNextCursor]);

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

    useEffect(() => {
        if (isReactReportError) {
            refetchGetReport();
        }
    }, [isReactReportError, refetchGetReport]);

    useEffect(() => {
        if (isVoteReportError) {
            refetchGetReport();
        }
    }, [isVoteReportError, refetchGetReport]);

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
                        <>
                            <ReportList
                                onLike={handleLike}
                                onDislike={handleDislike}
                                onSave={handleSave}
                                onComment={handleComment}
                                onShare={handleShare}
                                onStatusVote={handleStatusVote}
                            />

                            <div ref={ref} className="py-4 flex justify-center">
                                {isFetchingNextPage && (
                                    <div className="flex items-center space-x-2 text-sky-600">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
                                        <span>Memuat lebih banyak laporan...</span>
                                    </div>
                                )}
                                {!hasNextPage && reports.length > 0 && (
                                    <p className="text-gray-500 text-sm">Tidak ada laporan lagi</p>
                                )}
                            </div>
                        </>
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
                />
            )}
        </div>
    );
};

export default ReportsPage;