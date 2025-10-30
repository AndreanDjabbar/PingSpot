"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from '@/components/layouts';
import { BiPlus } from 'react-icons/bi';
import { useRouter } from 'next/navigation';
import { ErrorSection } from '@/components/feedback';
import { useGetReport, useReactReport } from '@/hooks/main';
import { useVoteReport } from '@/hooks/main/useVoteReport';
import { RxCrossCircled } from "react-icons/rx";
import { useErrorToast } from '@/hooks/toast';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils';
import { EmptyState } from '@/components/UI';
import { 
    ReportSkeleton, 
    ReportSearchAndFilter,
    ReportModal,
    ReportList,
    ReportSidebar,
    ReportFilterModal
} from './components';
import { useReportsStore } from '@/stores';
import { useInView } from 'react-intersection-observer';
import type { FilterOptions } from './components/ReportFilterModal';

const ReportsPage = () => {
    const currentPath = usePathname();
    const [searchTerm, setSearchTerm] = useState("");
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const filterButtonRef = useRef<HTMLButtonElement>(null);
    const [filters, setFilters] = useState<FilterOptions>({
        sortBy: 'latest',
        reportType: 'all',
        status: 'all',
        distance: 'all'
    });

    const { ref, inView } = useInView({
        threshold: 0,
    });

    const {
        reports,
        filteredReports,
        setFilteredReports,
        setReports,
        selectedReport,
        setSelectedReport,
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
    } = useGetReport(
        filters.reportType !== 'all' ? filters.reportType : undefined,
        filters.status !== 'all' ? filters.status : undefined,
        filters.sortBy
    );

    const handleCloseReportModal = () => {
        setIsReportModalOpen(false);
        setSelectedReport(null);
    };

    const handleLike = (reportId: number) => {
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
        
        reactReport({
            reportID: reportId,
            data: {
                reactionType: 'LIKE'
            }
        });
    };

    const handleDislike = (reportId: number) => {
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
        
        reactReport({
            reportID: reportId,
            data: {
                reactionType: 'DISLIKE'
            }
        });
    };

    const handleStatusVote = (reportId: number, voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'ON_PROGRESS' | 'NEUTRAL') => {
        const updatedReports = reports.map(report => {
            if (report.id !== reportId) return report;

            let totalResolvedVotes = report.totalResolvedVotes || 0;
            let totalOnProgressVotes = report.totalOnProgressVotes || 0;
            let totalNotResolvedVotes = report.totalNotResolvedVotes || 0;
            let totalVotes = report.totalVotes !== undefined
                ? report.totalVotes
                : (totalResolvedVotes + totalNotResolvedVotes + totalOnProgressVotes);

            const isResolved = !!report.isResolvedByCurrentUser;
            const isOnProgress = !!report.isOnProgressByCurrentUser;
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
                        isOnProgressByCurrentUser: false,
                        isNotResolvedByCurrentUser: false,
                    };
                } else if (isOnProgress) {
                    totalOnProgressVotes = Math.max(0, totalOnProgressVotes - 1);
                    totalResolvedVotes = totalResolvedVotes + 1;
                    return {
                        ...report,
                        totalOnProgressVotes,
                        totalResolvedVotes,
                        isResolvedByCurrentUser: true,
                        isOnProgressByCurrentUser: false,
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
                        isOnProgressByCurrentUser: false,
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
                        isOnProgressByCurrentUser: false,
                        isNotResolvedByCurrentUser: false,
                    };
                }
            }

            if (voteType === 'ON_PROGRESS') {
                if (isOnProgress) {
                    totalOnProgressVotes = Math.max(0, totalOnProgressVotes - 1);
                    totalVotes = Math.max(0, totalVotes - 1);
                    return {
                        ...report,
                        totalOnProgressVotes,
                        totalVotes,
                        isResolvedByCurrentUser: false,
                        isOnProgressByCurrentUser: false,
                        isNotResolvedByCurrentUser: false,
                    };
                } else if (isResolved) {
                    totalResolvedVotes = Math.max(0, totalResolvedVotes - 1);
                    totalOnProgressVotes = totalOnProgressVotes + 1;
                    return {
                        ...report,
                        totalResolvedVotes,
                        totalOnProgressVotes,
                        isResolvedByCurrentUser: false,
                        isOnProgressByCurrentUser: true,
                        isNotResolvedByCurrentUser: false,
                    };
                } else if (isNotResolved) {
                    totalNotResolvedVotes = Math.max(0, totalNotResolvedVotes - 1);
                    totalOnProgressVotes = totalOnProgressVotes + 1;
                    return {
                        ...report,
                        totalNotResolvedVotes,
                        totalOnProgressVotes,
                        isResolvedByCurrentUser: false,
                        isOnProgressByCurrentUser: true,
                        isNotResolvedByCurrentUser: false,
                    };
                } else {
                    totalOnProgressVotes = totalOnProgressVotes + 1;
                    totalVotes = totalVotes + 1;
                    return {
                        ...report,
                        totalOnProgressVotes,
                        totalVotes,
                        isResolvedByCurrentUser: false,
                        isOnProgressByCurrentUser: true,
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
                        isOnProgressByCurrentUser: false,
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
                        isOnProgressByCurrentUser: false,
                        isNotResolvedByCurrentUser: true,
                    };
                } else if (isOnProgress) {
                    totalOnProgressVotes = Math.max(0, totalOnProgressVotes - 1);
                    totalNotResolvedVotes = totalNotResolvedVotes + 1;
                    return {
                        ...report,
                        totalOnProgressVotes,
                        totalNotResolvedVotes,
                        isResolvedByCurrentUser: false,
                        isOnProgressByCurrentUser: false,
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
                        isOnProgressByCurrentUser: false,
                        isNotResolvedByCurrentUser: true,
                    };
                }
            }

            if (voteType === 'NEUTRAL') {
                if (isResolved) {
                    totalResolvedVotes = Math.max(0, totalResolvedVotes - 1);
                    totalVotes = Math.max(0, totalVotes - 1);
                } else if (isOnProgress) {
                    totalOnProgressVotes = Math.max(0, totalOnProgressVotes - 1);
                    totalVotes = Math.max(0, totalVotes - 1);
                } else if (isNotResolved) {
                    totalNotResolvedVotes = Math.max(0, totalNotResolvedVotes - 1);
                    totalVotes = Math.max(0, totalVotes - 1);
                }
                return {
                    ...report,
                    totalResolvedVotes,
                    totalOnProgressVotes,
                    totalNotResolvedVotes,
                    totalVotes,
                    isResolvedByCurrentUser: false,
                    isOnProgressByCurrentUser: false,
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

        if (voteType !== 'NEUTRAL') {
            voteReport({
                reportID: reportId,
                data: { voteType: voteType as 'RESOLVED' | 'NOT_RESOLVED' | 'ON_PROGRESS' },
            });
        }
    };

    const handleSave = async (reportId: number) => {
        console.log('Saving report:', reportId);
    };

    const handleComment = (reportId: number) => {
        const report = reports.find(r => r.id === reportId);
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
    }, [inView, hasNextPage, fetchNextPage]);

    useEffect(() => {
        if (isGetReportSuccess && getReportData) {
            const allReports = getReportData.pages.flatMap(page => page.data?.reports ?? []);
            setReports(allReports);
            
            let filtered = allReports;
            if (searchTerm) {
                filtered = filtered.filter(report => 
                    report.reportTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    report.reportDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    report.location.detailLocation.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            setFilteredReports(filtered);
        }
    }, [isGetReportSuccess, getReportData, setReports, searchTerm]);

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
        <div className=''>
            <div className='flex gap-6 lg:gap-8 '>
                <div className="flex-1 space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className='flex flex-col gap-3'>
                                <Breadcrumb path={currentPath}/>
                                <p className="text-gray-600 text-sm">
                                    Temukan dan lihat laporan masalah di sekitar Anda untuk meningkatkan kesadaran dan partisipasi masyarakat.
                                </p>
                            </div>
                            <button 
                                className="bg-sky-700 hover:bg-sky-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
                                onClick={() => router.push('/main/reports/create-report')}>
                                <BiPlus className="w-5 h-5" />
                                <span>Buat Laporan</span>
                            </button>
                        </div>
                    </div>
                    
                    {isGetReportError && (
                        <ErrorSection
                            message={getErrorResponseMessage(getReportError) || 'Terjadi kesalahan saat mengambil data laporan'}
                            errors={getErrorResponseDetails(getReportError) || []}
                        />
                    )}

                    {!getReportLoading && reports.length > 0 && (
                        <ReportSearchAndFilter
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onFilterClick={() => setIsFilterModalOpen(true)}
                            filterButtonRef={filterButtonRef}
                            activeFiltersCount={
                                (filters.reportType !== 'all' ? 1 : 0) +
                                (filters.status !== 'all' ? 1 : 0) +
                                (filters.distance !== 'all' ? 1 : 0) +
                                (filters.sortBy !== 'latest' ? 1 : 0)
                            }
                        />
                    )}
                    
                    {!getReportLoading && (
                        <div className='flex justify-between gap-10 lg:gap-5'>
                            <div className='w-full xl:w-2/3 lg:w-160'>
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

                                        <div ref={ref} className="py-6 flex justify-center">
                                            {isFetchingNextPage && (
                                                <div className="flex items-center space-x-2 text-blue-500">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : reports.length === 0 && !isGetReportError ? (
                                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
                                        <EmptyState 
                                            emptyTitle='Belum ada laporan'
                                            emptyMessage='Jadilah yang pertama membuat laporan untuk komunitas Anda'
                                            showCommandButton={true}
                                            commandLabel='Buat Laporan'
                                            emptyIcon={<RxCrossCircled />}
                                            onCommandButton={() => router.push('/main/reports/create-report')} 
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
                                        <EmptyState 
                                            emptyTitle='Laporan tidak ditemukan'
                                            emptyMessage='Coba sesuaikan kata kunci pencarian atau filter Anda'
                                            emptyIcon={<RxCrossCircled />}
                                            showCommandButton={false}
                                        />
                                    </div>
                                )} 
                            </div>
                            <ReportSidebar />
                        </div>
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

                    <ReportFilterModal
                        isOpen={isFilterModalOpen}
                        onClose={() => setIsFilterModalOpen(false)}
                        onApply={(newFilters) => setFilters(newFilters)}
                        currentFilters={filters}
                        buttonRef={filterButtonRef}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;