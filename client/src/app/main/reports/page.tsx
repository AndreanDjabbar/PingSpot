    "use client";
    import React, { useState, useEffect } from 'react';
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
                                activeFilter={activeFilter}
                                onSearchChange={setSearchTerm}
                                onFilterChange={setActiveFilter}
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
                                                {/* {!hasNextPage && reports.length > 0 && (
                                                    <p className="text-gray-400 text-sm">Tidak ada laporan lagi</p>
                                                )} */}
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

                                <div className='hidden lg:block w-1/3 lg:w-75 2xl:w-90 overflow-y-auto space-y-4'>
                                    <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-5'>
                                        <h3 className='font-bold text-lg text-gray-900 mb-3'>
                                            Tentang PingSpot
                                        </h3>
                                        <p className='text-gray-600 text-sm leading-relaxed mb-4'>
                                            PingSpot adalah platform pelaporan masalah komunitas yang memungkinkan warga melaporkan dan memantau permasalahan di lingkungan sekitar.
                                        </p>
                                        <div className='space-y-2'>
                                            <div className='flex items-center text-sm text-gray-700'>
                                                <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
                                                <span>Laporkan masalah infrastruktur</span>
                                            </div>
                                            <div className='flex items-center text-sm text-gray-700'>
                                                <div className='w-2 h-2 bg-green-500 rounded-full mr-3'></div>
                                                <span>Pantau status penanganan</span>
                                            </div>
                                            <div className='flex items-center text-sm text-gray-700'>
                                                <div className='w-2 h-2 bg-purple-500 rounded-full mr-3'></div>
                                                <span>Berpartisipasi dalam komunitas</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-5'>
                                        <h3 className='font-bold text-lg text-gray-900 mb-4'>
                                            Statistik Laporan
                                        </h3>
                                        <div className='space-y-3'>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-gray-600 text-sm'>Total Laporan</span>
                                                <span className='font-semibold text-gray-900'>{12}</span>
                                            </div>
                                            <div className='h-px bg-gray-200'></div>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-gray-600 text-sm'>Infrastruktur</span>
                                                <span className='font-semibold text-blue-600'>
                                                    {12}
                                                </span>
                                            </div>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-gray-600 text-sm'>Lingkungan</span>
                                                <span className='font-semibold text-green-600'>
                                                    {12}
                                                </span>
                                            </div>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-gray-600 text-sm'>Keamanan</span>
                                                <span className='font-semibold text-red-600'>
                                                    {12}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-lg text-gray-900">Teman</h3>
                                            <span className="text-xs text-gray-500">24 online</span>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                            { name: 'Ahmad Rizki', status: 'online', avatar: 'AR' },
                                            { name: 'Siti Nurhaliza', status: 'online', avatar: 'SN' },
                                            { name: 'Budi Santoso', status: 'offline', avatar: 'BS' },
                                            { name: 'Dewi Kartika', status: 'online', avatar: 'DK' },
                                            ].map((friend, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                                                    {friend.avatar}
                                                </div>
                                                <div
                                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                                    friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}
                                                ></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{friend.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {friend.status === 'online' ? 'Aktif sekarang' : 'Terakhir dilihat 2j'}
                                                </p>
                                                </div>
                                            </div>
                                            ))}
                                        </div>

                                        <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            Lihat Semua Teman
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                                        <h3 className="font-bold text-lg text-gray-900 mb-4">Komunitas Aktif</h3>
                                        <div className="space-y-3">
                                            {[
                                            { name: 'Warga Peduli Jakarta', members: 1245, color: 'bg-blue-500' },
                                            { name: 'Tim Hijau Indonesia', members: 892, color: 'bg-green-500' },
                                            { name: 'Keamanan Lingkungan', members: 567, color: 'bg-red-500' },
                                            ].map((community, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
                                                <div
                                                className={`w-12 h-12 ${community.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}
                                                >
                                                {community.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{community.name}</p>
                                                <p className="text-xs text-gray-500">{community.members.toLocaleString()} anggota</p>
                                                </div>
                                            </div>
                                            ))}
                                        </div>

                                        <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            Jelajahi Komunitas
                                        </button>
                                    </div>
                                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                                        <h3 className="font-bold text-lg text-gray-900 mb-4">Saran Komunitas</h3>
                                        <div className="space-y-3">
                                            {[
                                            { title: 'Relawan Bersih Pantai', category: 'Lingkungan', members: 234 },
                                            { title: 'Patroli Malam Aman', category: 'Keamanan', members: 156 },
                                            { title: 'Perbaikan Jalan Bersama', category: 'Infrastruktur', members: 389 },
                                            ].map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-sm font-semibold text-gray-900">{suggestion.title}</h4>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                                                    {suggestion.category}
                                                </span>
                                                <span className="text-xs text-gray-500">{suggestion.members} anggota</span>
                                                </div>
                                                <button className="w-full mt-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                                                Bergabung
                                                </button>
                                            </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
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
                    </div>
                </div>
            </div>
        );
    };

    export default ReportsPage;