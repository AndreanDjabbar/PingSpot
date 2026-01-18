"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { BiPlus } from 'react-icons/bi';
import HeaderSection from '../components/HeaderSection';
import { useRouter } from 'next/navigation';
import { ErrorSection } from '@/components/feedback';
import { useDeleteReport, useGetReport, useReactReport, useGetReportComments, useCreateReportCommentReport } from '@/hooks/main';
import { useVoteReport } from '@/hooks/main/useVoteReport';
import { RxCrossCircled } from "react-icons/rx";
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { getErrorResponseDetails, getErrorResponseMessage, isInternalServerError } from '@/utils';
import { Button, EmptyState, Loading } from '@/components/UI';
import { 
    ReportSkeleton, 
    ReportSearchAndFilter,
    ReportModal,
    ReportList,
    ReportSidebar,
    ReportFilterModal
} from './components';
import { useReportsStore, useLocationStore, useReportCommentStore } from '@/stores';
import { useInView } from 'react-intersection-observer';
import { useCurrentLocation } from '@/hooks/main';
import { FaLocationDot } from 'react-icons/fa6';

const ReportsPage = () => {
    const currentPath = usePathname();
    const [searchTerm, setSearchTerm] = useState("");
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const filterButtonRef = useRef<HTMLButtonElement>(null);

    const { ref, inView } = useInView({
        threshold: 0,
    });

    const reports = useReportsStore((s) => s.reports);
    const filteredReports = useReportsStore((s) => s.filteredReports);
    const setFilteredReports = useReportsStore((s) => s.setFilteredReports);
    const setReports = useReportsStore((s) => s.setReports);
    const selectedReport = useReportsStore((s) => s.selectedReport);
    const setSelectedReport = useReportsStore((s) => s.setSelectedReport);
    const setReportCount = useReportsStore((s) => s.setReportCount);
    const userLocation = useLocationStore((s) => s.location);
    const reportFilters = useReportsStore((s) => s.reportFilters);
    const updateReportFilters = useReportsStore((s) => s.updateReportFilters);
    const hasCoords = userLocation && userLocation?.lat !== null && userLocation?.lat !== '' && userLocation?.lng !== null && userLocation?.lng !== '';

    const { requestLocation, loading: loadingRequestLocation, permissionDenied, isPermissionDenied, } = useCurrentLocation();
    const setReportCommentCounts = useReportCommentStore((state) => state.setReportCommentsCount);
    const setReportComments = useReportCommentStore((state) => state.setReportComments);

    const router = useRouter();
    const { 
        mutate: reactReport, 
        isError: isReactReportError,  
        error: reactReportError,
    } = useReactReport();

    const { 
        mutate: createReportComment, 
        isError: isCreateReportCommentError, 
        error: createReportCommentError,
    } = useCreateReportCommentReport();

    const {
        mutate: voteReport,
        data: voteReportData,
        isError: isVoteReportError,
        isSuccess: voteReportSuccess,
        error: voteReportError,
    } = useVoteReport();

    const {
        mutate: deleteReport,
        data: deleteReportData,
        isError: isDeleteReportError,
        isSuccess: isDeleteReportSuccess,
        error: deleteReportError,
        isPending: deleteReportPending,
    } = useDeleteReport();

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
        reportFilters.reportType !== 'all' ? reportFilters.reportType : undefined,
        reportFilters.status !== 'all' ? reportFilters.status : undefined,
        reportFilters.sortBy,
        reportFilters.hasProgress !== 'all' ? reportFilters.hasProgress : undefined,
        reportFilters.distance,
        hasCoords ? hasCoords : false
    );

    const {
        data: commentsData,
        isLoading: commentsLoading,
        fetchNextPage: fetchNextComments,
        isSuccess: isGetReportCommentsSuccess,
        hasNextPage: hasNextComments,
        isFetchingNextPage: isFetchingNextComments,
    } = useGetReportComments(
        selectedReport?.id || 0,
        isReportModalOpen && !!selectedReport
    );

    const handleCloseReportModal = () => {
        setIsReportModalOpen(false);
        setSelectedReport(null);
    };

    const activeFiltersCount = 
    (reportFilters.reportType !== 'all' ? 1 : 0) +
    (reportFilters.status !== 'all' ? 1 : 0) +
    ((reportFilters.distance.distance !== 'all' && reportFilters.distance.lat != null && reportFilters.distance.lng != null) ? 1 : 0) +
    (reportFilters.sortBy !== 'latest' ? 1 : 0) +
    (reportFilters.hasProgress !== 'all' ? 1 : 0);
    const isUsingFilters = activeFiltersCount > 0;

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
        setFilteredReports(updatedReports);
        
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

    const handleRemoveReport = (reportId: number) => {
        deleteReport({ reportID: reportId });
    }

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

    useErrorToast(
        isGetReportError, 
        getErrorResponseMessage(getReportError) || 'Terjadi kesalahan saat mengambil data laporan'
    );

    useErrorToast(
        isDeleteReportError, 
        getErrorResponseMessage(deleteReportError) || 'Terjadi kesalahan saat mengambil data laporan'
    );

    useErrorToast(
        isReactReportError, 
        getErrorResponseMessage(reactReportError) || 'Terjadi kesalahan saat bereaksi pada laporan'
    );

    useErrorToast(isPermissionDenied, permissionDenied);

    useErrorToast(
        isVoteReportError,
        getErrorResponseMessage(voteReportError) || 'Terjadi kesalahan saat melakukan vote status'
    );

    useSuccessToast(
        isDeleteReportSuccess,
        deleteReportData || 'Laporan berhasil dihapus'
    );

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    useEffect(() => {
        if (isGetReportSuccess && getReportData) {
            const allReports = getReportData.pages.flatMap(page => page.data?.reports.reports ?? []);
            setReports(allReports);
            const totalCounts = getReportData.pages[0].data?.reports?.totalCounts;
            if (totalCounts) {
                setReportCount(totalCounts);
            }
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
        if (isDeleteReportSuccess) {
            const updatedReports = reports.filter(report => report.id !== (deleteReportData?.data?.reportID|| 0));
            setReports(updatedReports);
            setFilteredReports(updatedReports);
            setSelectedReport(null);
        }
    }, [isDeleteReportSuccess, deleteReportData]);

    useEffect(() => {
        if (isGetReportCommentsSuccess && commentsData) {
            const allComments = commentsData.pages.flatMap(
                page => page.data?.comments.comments || []
            ) || [];
            setReportComments(allComments);
            setReportCommentCounts(commentsData.pages[0].data?.comments.totalCounts || 0);
        }
    }, [isGetReportCommentsSuccess, commentsData]);

    useEffect(() => {
        if (voteReportData?.data) {
            const { reportID, reportStatus } = voteReportData.data;
            
            const updatedReports = reports.map(report => {
                if (report.id === reportID) {
                    return {
                        ...report,
                        reportStatus: reportStatus,
                    };
                }
                return report;
            });
            
            setReports(updatedReports);
            
            if (selectedReport && selectedReport.id === reportID) {
                const updatedSelectedReport = updatedReports.find(r => r.id === reportID);
                if (updatedSelectedReport) {
                    setSelectedReport(updatedSelectedReport);
                }
            }
        }
    }, [voteReportData, voteReportSuccess]);

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

    if (deleteReportPending) {
        return <Loading text='Menghapus Laporan...' size='lg' className='absolute inset-0 left-0 xl:left-60'/>
    }

    if (isGetReportError) {
        const isServerError = isInternalServerError(getReportError);
        
        if (isServerError) {
            return (
                <div className=''>
                    <HeaderSection currentPath={currentPath || '/main/reports'}
                    message='Temukan dan lihat laporan masalah di sekitar Anda untuk meningkatkan kesadaran dan partisipasi masyarakat.'>
                        <button 
                            className="bg-sky-700 hover:bg-sky-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
                            onClick={() => router.push('/main/reports/create-report')}>
                            <BiPlus className="w-5 h-5" />
                            <span>Buat Laporan</span>
                        </button>
                    </HeaderSection>
                    
                    <div className='mt-4'>
                        <ErrorSection
                            message={getErrorResponseMessage(getReportError) || 'Terjadi kesalahan saat mengambil data laporan'}
                            errors={getErrorResponseDetails(getReportError)}
                            onRetry={() => refetchGetReport()}
                            showRetryButton={true}
                        />
                    </div>
                </div>
            );
        }
    }

    return (
        <div className=''>
            <div className='flex gap-6 lg:gap-8 '>
                <div className="flex-1 space-y-4">
                    <HeaderSection currentPath={currentPath || '/main/reports'}
                    message='Temukan dan lihat laporan masalah di sekitar Anda untuk meningkatkan kesadaran dan partisipasi masyarakat.'>
                        <Button 
                        icon={<BiPlus className='w-5 h-5'/>}
                        onClick={() => router.push('/main/reports/create-report')}
                        >
                            Buat laporan
                        </Button>
                    </HeaderSection>
                    
                    {isDeleteReportError && (
                        <ErrorSection
                            message={getErrorResponseMessage(deleteReportError)}
                            errors={getErrorResponseDetails(deleteReportError)}
                        />
                    )}

                    {isPermissionDenied && (
                        <ErrorSection 
                            message={getErrorResponseMessage(permissionDenied)} 
                            errors={getErrorResponseDetails(permissionDenied)}
                        />
                    )}

                    {!getReportLoading && (
                        <ReportSearchAndFilter
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onFilterClick={() => setIsFilterModalOpen(true)}
                            filterButtonRef={filterButtonRef}
                            activeFiltersCount={
                                (reportFilters.reportType !== 'all' ? 1 : 0) +
                                (reportFilters.status !== 'all' ? 1 : 0) +
                                ((reportFilters.distance.distance !== 'all' && reportFilters.distance.lat != null && reportFilters.distance.lng != null) ? 1 : 0) +
                                (reportFilters.sortBy !== 'latest' ? 1 : 0) +
                                (reportFilters.hasProgress !== 'all' ? 1 : 0)
                            }
                        />
                    )}
                    
                    {!getReportLoading && (
                        <div className='flex justify-between gap-10 lg:gap-5'>
                            <div className='w-full xl:w-2/3 lg:w-160'>
                                {filteredReports.length > 0 && hasCoords ? (
                                    <>
                                        <ReportList
                                            onLike={handleLike}
                                            onDislike={handleDislike}
                                            onSave={handleSave}
                                            onRemove={handleRemoveReport}
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
                                ) : !hasCoords ? (
                                    <EmptyState
                                        emptyTitle='Lokasi tidak tersedia'
                                        emptyMessage='Untuk menampilkan laporan di sekitar Anda, izinkan aplikasi mengakses lokasi Anda.'
                                        emptyIcon={<RxCrossCircled />}
                                        showCommandButton={true}
                                        commandLabel='Deteksi Lokasi'
                                        commandLoading={loadingRequestLocation}
                                        commandIcon={<FaLocationDot/>}
                                        commandLoadingMessage='Mendeteksi...'
                                        onCommandButton={() => {requestLocation()}}
                                    />
                                ) : reports.length === 0 && !isGetReportError && !isUsingFilters ? (
                                    <EmptyState 
                                        emptyTitle='Belum ada laporan'
                                        emptyMessage='Jadilah yang pertama membuat laporan untuk komunitas Anda'
                                        showCommandButton={true}
                                        commandLabel='Buat Laporan'
                                        emptyIcon={<RxCrossCircled />}
                                        onCommandButton={() => router.push('/main/reports/create-report')} 
                                    />
                                ) : filteredReports.length === 0 && reports.length === 0 && isUsingFilters ? (
                                    <EmptyState 
                                        emptyTitle='Tidak ada hasil yang cocok'
                                        emptyMessage={
                                            searchTerm 
                                                ? `Tidak ada laporan yang cocok dengan "${searchTerm}". Coba kata kunci lain atau hapus filter.`
                                                : 'Tidak ada laporan yang cocok dengan filter yang dipilih. Coba sesuaikan filter Anda.'
                                        }
                                        emptyIcon={<RxCrossCircled />}
                                        showCommandButton={true}
                                        commandLabel={searchTerm ? 'Hapus Pencarian' : 'Reset Filter'}
                                        onCommandButton={() => {
                                            setSearchTerm('');
                                            updateReportFilters({
                                                sortBy: 'latest',
                                                reportType: 'all',
                                                status: 'all',
                                                distance: {
                                                    distance: 'all',
                                                    lat: null,
                                                    lng: null,
                                                },
                                                hasProgress: 'all'
                                            });
                                        }}
                                    />
                                ) : null} 
                            </div>
                            <ReportSidebar />
                        </div>
                    )}

                    {selectedReport && (
                        <ReportModal
                            reportID={selectedReport.id}
                            isOpen={isReportModalOpen}
                            createReportCommentMutation={createReportComment}
                            onClose={handleCloseReportModal}
                            onLike={() => handleLike(selectedReport.id)}
                            onDislike={() => handleDislike(selectedReport.id)}
                            onSave={() => handleSave(selectedReport.id)}
                            onShare={() => handleShare(selectedReport.id, selectedReport.reportTitle)}
                            onStatusVote={(voteType) => handleStatusVote(selectedReport.id, voteType)}
                            commentsLoading={commentsLoading}
                            onLoadMoreComments={fetchNextComments}
                            hasMoreComments={hasNextComments}
                            isCreateReportCommentError={isCreateReportCommentError}
                            createReportCommentError={createReportCommentError!}
                            isFetchingMoreComments={isFetchingNextComments}
                        />
                    )}

                    <ReportFilterModal
                        isOpen={isFilterModalOpen}
                        onClose={() => setIsFilterModalOpen(false)}
                        buttonRef={filterButtonRef}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;