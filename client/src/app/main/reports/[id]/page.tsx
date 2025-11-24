"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    getErrorResponseDetails, 
    getErrorResponseMessage, 
    isNotFoundError, 
    isInternalServerError, 
    getImageURL,
} from '@/utils';
import { ReportType, IReportImage, ICommentType } from '@/types/model/report';
import { ReportInteractionBar } from '../components/ReportInteractionBar';
import { useUserProfileStore, useReportsStore } from '@/stores';
import { useDeleteReport, useGetReportByID, useReactReport, useVoteReport } from '@/hooks/main';
import { useImagePreviewModalStore } from '@/stores';
import { useErrorToast, useSuccessToast } from '@/hooks/toast';
import { 
    ReportHeader, 
    ReportMediaViewer, 
    ReportCommentsSection, 
    ReportInfoSidebar, 
    ReportProgressTimeline, 
    ReportVotingSection,
    ReportDetailSkeleton 
} from './components';
import { ErrorSection } from '@/components/feedback';
import { HeaderSection } from '../../components';
import { Loading } from '@/components/UI';

const getReportTypeLabel = (type: ReportType): string => {
    const types: Record<ReportType, string> = {
        INFRASTRUCTURE: 'Infrastruktur',
        ENVIRONMENT: 'Lingkungan',
        SAFETY: 'Keamanan',
        OTHER: 'Lainnya',
        TRAFFIC: 'Lalu Lintas',
        PUBLIC_FACILITY: 'Fasilitas Umum',
        WASTE: 'Sampah',
        WATER: 'Air',
        ELECTRICITY: 'Listrik',
        HEALTH: 'Kesehatan',
        SOCIAL: 'Sosial',
        EDUCATION: 'Pendidikan',
        ADMINISTRATIVE: 'Administratif',
        DISASTER: 'Bencana Alam',
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

const dummyComments: ICommentType[] = [
    {
        id: 1,
        content: "Terima kasih laporannya! Saya juga merasakan hal yang sama di area tersebut. Semoga segera ditindaklanjuti oleh pihak terkait.",
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
        userId: 101,
        userName: "budisantoso",
        fullName: "Budi Santoso",
        profilePicture: "",
        parentId: undefined,
        replies: [
            {
                id: 4,
                content: "Setuju! Saya sudah melapor juga beberapa kali tapi belum ada tindakan.",
                createdAt: Date.now() - 43200000,
                updatedAt: Date.now() - 43200000,
                userId: 104,
                userName: "dewilestari",
                fullName: "Dewi Lestari",
                profilePicture: "",
                parentId: 1,
            }
        ]
    },
    {
        id: 2,
        content: "Lokasi ini memang sudah lama bermasalah. Sudah beberapa kali saya lewat dan kondisinya semakin parah. Tolong segera diperbaiki 🙏",
        createdAt: Date.now() - 172800000,
        updatedAt: Date.now() - 172800000,
        userId: 102,
        userName: "sitinurhayati",
        fullName: "Siti Nurhayati",
        profilePicture: "",
        parentId: undefined,
        replies: []
    },
    {
        id: 3,
        content: "Saya mendukung laporan ini. Situasinya benar-benar mengganggu dan perlu perhatian serius dari pemerintah daerah.",
        createdAt: Date.now() - 259200000, // 3 days ago
        updatedAt: Date.now() - 259200000,
        userId: 103,
        userName: "ahmadwijaya",
        fullName: "Ahmad Wijaya",
        profilePicture: "",
        parentId: undefined,
        replies: [
            {
                id: 5,
                content: "Betul sekali! Saya juga sudah menghubungi RT setempat.",
                createdAt: Date.now() - 129600000, // 1.5 days ago
                updatedAt: Date.now() - 129600000,
                userId: 105,
                userName: "rina.pratiwi",
                fullName: "Rina Pratiwi",
                profilePicture: "",
                parentId: 3,
            },
            {
                id: 6,
                content: "Semoga dengan banyaknya laporan, masalah ini segera teratasi.",
                createdAt: Date.now() - 86400000, // 1 day ago
                updatedAt: Date.now() - 86400000,
                userId: 106,
                userName: "jokoprasetyo",
                fullName: "Joko Prasetyo",
                profilePicture: "",
                parentId: 3,
            }
        ]
    },
];

const ReportDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const reportId = Number(params.id);

    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [animateButton, setAnimateButton] = useState<string | null>(null);

    const openImagePreview = useImagePreviewModalStore((s) => s.openImagePreview);
    const selectedReport = useReportsStore((s) => s.selectedReport);
    const setSelectedReport = useReportsStore((s) => s.setSelectedReport);
    const userProfile = useUserProfileStore((s) => s.userProfile);

    const { 
        data: freshReportData,
        isLoading: isFreshReportLoading,
        isError: isFreshReportError,
        error: freshReportError,
        refetch: freshReportRefetch,
    } = useGetReportByID(reportId);
    
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
        mutate: deleteReport,
        data: deleteReportData,
        isError: isDeleteReportError,
        isSuccess: isDeleteReportSuccess,
        error: deleteReportError,
        isPending: deleteReportPending,
    } = useDeleteReport();

    const [report, setReport] = useState(freshReportData?.data?.report?.report || null);
    
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = report && currentUserId === report.userID;
    const isReportResolved = report?.reportStatus === 'RESOLVED';
    const customCurrentPath = `/main/reports/${reportId}`;
    
    const images = useMemo(() => 
        getReportImages(report?.images ?? { id: 0, reportID: 0 }),
        [report?.images]
    );
    
    const displayComments = useMemo(() => 
        report?.comments && report.comments.length > 0 ? report.comments : dummyComments,
        [report?.comments]
    );
    
    const percentages = useMemo(() => {
        const totalVotes = report?.totalVotes || 0;
        return {
            resolved: totalVotes > 0 ? ((report?.totalResolvedVotes || 0) / totalVotes) * 100 : 0,
            onProgress: totalVotes > 0 ? ((report?.totalOnProgressVotes || 0) / totalVotes) * 100 : 0,
            notResolved: totalVotes > 0 ? ((report?.totalNotResolvedVotes || 0) / totalVotes) * 100 : 0,
        };
    }, [report?.totalVotes, report?.totalResolvedVotes, report?.totalOnProgressVotes, report?.totalNotResolvedVotes]);
    
    const majorityVote = useMemo(() => {
        const resolvedVotes = report?.totalResolvedVotes || 0;
        const onProgressVotes = report?.totalOnProgressVotes || 0;
        const notResolvedVotes = report?.totalNotResolvedVotes || 0;
        
        const maxVotes = Math.max(resolvedVotes, onProgressVotes, notResolvedVotes);
        if (maxVotes === 0) return null;
        
        if (resolvedVotes === maxVotes) return 'RESOLVED';
        if (onProgressVotes === maxVotes) return 'ON_PROGRESS';
        return 'NOT_RESOLVED';
    }, [report?.totalResolvedVotes, report?.totalOnProgressVotes, report?.totalNotResolvedVotes]);
    
    const majorityPercentage = useMemo(() => 
        majorityVote === 'RESOLVED'
            ? percentages.resolved
            : majorityVote === 'ON_PROGRESS'
                ? percentages.onProgress
                : percentages.notResolved,
        [majorityVote, percentages]
    );

    const userCurrentVote = useMemo(() => 
        report?.isResolvedByCurrentUser 
            ? 'RESOLVED'
            : report?.isNotResolvedByCurrentUser
                ? 'NOT_RESOLVED'
                : report?.isOnProgressByCurrentUser
                    ? 'ON_PROGRESS'
                    : null,
        [report?.isResolvedByCurrentUser, report?.isNotResolvedByCurrentUser, report?.isOnProgressByCurrentUser]
    );

    const onAttachmentImageClick = (imageURL: string) => {
        const url = getImageURL(`/report/${imageURL}`, "main");
        openImagePreview(url);
    };

    const onProgressImageClick = (imageURL: string) => {
        const url = getImageURL(`/report/progress/${imageURL}`, "main");
        openImagePreview(url);
    };

    const handleLike = () => {
        if (!report) return;

        const currentlyLiked = report.isLikedByCurrentUser || false;
        const updatedReport = {
            ...report,
            isLikedByCurrentUser: !currentlyLiked,
            totalLikeReactions: currentlyLiked 
                ? Math.max(0, (report.totalLikeReactions || 1) - 1)
                : (report.totalLikeReactions || 0) + 1,
        };
        
        setReport(updatedReport);
        
        if (selectedReport?.id === reportId) {
            setSelectedReport(updatedReport);
        }

        reactReport({
            reportID: reportId,
            data: {
                reactionType: 'LIKE'
            }
        });
    }

    const handleRemoveReport = (reportId: number) => {
        deleteReport({ reportID: reportId });
    }

    const handleVote = async (voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'ON_PROGRESS') => {
        if (isFreshReportLoading || isReportResolved) return;
        setAnimateButton(voteType);
        handleStatusVote(reportId, voteType);
        setTimeout(() => setAnimateButton(null), 300);
    };

    const handleStatusVote = (reportId: number, voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'ON_PROGRESS' | 'NEUTRAL') => {
        if (!report) return;

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
                report.totalResolvedVotes = totalResolvedVotes;
                report.totalVotes = totalVotes;
                report.isResolvedByCurrentUser = false;
                report.isOnProgressByCurrentUser = false;
                report.isNotResolvedByCurrentUser = false;
            } else if (isOnProgress) {
                totalOnProgressVotes = Math.max(0, totalOnProgressVotes - 1);
                totalResolvedVotes = totalResolvedVotes + 1;
                report.totalOnProgressVotes = totalOnProgressVotes;
                report.totalResolvedVotes = totalResolvedVotes;
                report.isResolvedByCurrentUser = true;
                report.isOnProgressByCurrentUser = false;
                report.isNotResolvedByCurrentUser = false;
            } else if (isNotResolved) {
                totalNotResolvedVotes = Math.max(0, totalNotResolvedVotes - 1);
                totalResolvedVotes = totalResolvedVotes + 1;
                report.totalNotResolvedVotes = totalNotResolvedVotes;
                report.totalResolvedVotes = totalResolvedVotes;
                report.isResolvedByCurrentUser = true;
                report.isOnProgressByCurrentUser = false;
                report.isNotResolvedByCurrentUser = false;
            } else {
                totalResolvedVotes = totalResolvedVotes + 1;
                totalVotes = totalVotes + 1;
                report.totalResolvedVotes = totalResolvedVotes;
                report.totalVotes = totalVotes;
                report.isResolvedByCurrentUser = true;
                report.isOnProgressByCurrentUser = false;
                report.isNotResolvedByCurrentUser = false;
            }
        }

        if (voteType === 'ON_PROGRESS') {
            if (isOnProgress) {
                totalOnProgressVotes = Math.max(0, totalOnProgressVotes - 1);
                totalVotes = Math.max(0, totalVotes - 1);
                report.totalOnProgressVotes = totalOnProgressVotes;
                report.totalVotes = totalVotes;
                report.isResolvedByCurrentUser = false;
                report.isOnProgressByCurrentUser = false;
                report.isNotResolvedByCurrentUser = false;
            } else if (isResolved) {
                totalResolvedVotes = Math.max(0, totalResolvedVotes - 1);
                totalOnProgressVotes = totalOnProgressVotes + 1;
                report.totalResolvedVotes = totalResolvedVotes;
                report.totalOnProgressVotes = totalOnProgressVotes;
                report.isResolvedByCurrentUser = false;
                report.isOnProgressByCurrentUser = true;
                report.isNotResolvedByCurrentUser = false;
            } else if (isNotResolved) {
                totalNotResolvedVotes = Math.max(0, totalNotResolvedVotes - 1);
                totalOnProgressVotes = totalOnProgressVotes + 1;
                report.totalNotResolvedVotes = totalNotResolvedVotes;
                report.totalOnProgressVotes = totalOnProgressVotes;
                report.isResolvedByCurrentUser = false;
                report.isOnProgressByCurrentUser = true;
                report.isNotResolvedByCurrentUser = false;
            } else {
                totalOnProgressVotes = totalOnProgressVotes + 1;
                totalVotes = totalVotes + 1;
                report.totalOnProgressVotes = totalOnProgressVotes;
                report.totalVotes = totalVotes;
                report.isResolvedByCurrentUser = false;
                report.isOnProgressByCurrentUser = true;
                report.isNotResolvedByCurrentUser = false;
            }
        }

        if (voteType === 'NOT_RESOLVED') {
            if (isNotResolved) {
                totalNotResolvedVotes = Math.max(0, totalNotResolvedVotes - 1);
                totalVotes = Math.max(0, totalVotes - 1);
                report.totalNotResolvedVotes = totalNotResolvedVotes;
                report.totalVotes = totalVotes;
                report.isResolvedByCurrentUser = false;
                report.isOnProgressByCurrentUser = false;
                report.isNotResolvedByCurrentUser = false;
            } else if (isResolved) {
                totalResolvedVotes = Math.max(0, totalResolvedVotes - 1);
                totalNotResolvedVotes = totalNotResolvedVotes + 1;
                report.totalResolvedVotes = totalResolvedVotes;
                report.totalNotResolvedVotes = totalNotResolvedVotes;
                report.isResolvedByCurrentUser = false;
                report.isOnProgressByCurrentUser = false;
                report.isNotResolvedByCurrentUser = true;
            } else if (isOnProgress) {
                totalOnProgressVotes = Math.max(0, totalOnProgressVotes - 1);
                totalNotResolvedVotes = totalNotResolvedVotes + 1;
                report.totalOnProgressVotes = totalOnProgressVotes;
                report.totalNotResolvedVotes = totalNotResolvedVotes;
                report.isResolvedByCurrentUser = false;
                report.isOnProgressByCurrentUser = false;
                report.isNotResolvedByCurrentUser = true;
            } else {
                totalNotResolvedVotes = totalNotResolvedVotes + 1;
                totalVotes = totalVotes + 1;
                report.totalNotResolvedVotes = totalNotResolvedVotes;
                report.totalVotes = totalVotes;
                report.isResolvedByCurrentUser = false;
                report.isOnProgressByCurrentUser = false;
                report.isNotResolvedByCurrentUser = true;
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
            report.totalResolvedVotes = totalResolvedVotes;
            report.totalOnProgressVotes = totalOnProgressVotes;
            report.totalNotResolvedVotes = totalNotResolvedVotes;
            report.totalVotes = totalVotes;
            report.isResolvedByCurrentUser = false;
            report.isOnProgressByCurrentUser = false;
            report.isNotResolvedByCurrentUser = false;
        }

        if (voteType !== 'NEUTRAL') {
            voteReport({
                reportID: reportId,
                data: { voteType: voteType as 'RESOLVED' | 'NOT_RESOLVED' | 'ON_PROGRESS' },
            });
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            console.log('Adding comment:', newComment);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = (content: string, parentId: number) => {
        console.log('Reply to:', parentId, content);
    };

    useSuccessToast(
        isDeleteReportSuccess,
        deleteReportData || 'Laporan berhasil dihapus'
    );

    useErrorToast(isFreshReportError, freshReportError);
    useErrorToast(isVoteReportError, voteReportError);
    useErrorToast(isReactReportError, getErrorResponseMessage(reactReportError) || 'Terjadi kesalahan saat bereaksi pada laporan');
    useErrorToast(
        isDeleteReportError, 
        getErrorResponseMessage(deleteReportError) || 'Terjadi kesalahan saat mengambil data laporan'
    );

    useEffect(() => {
        if (freshReportData?.data?.report) {
            setReport(freshReportData.data.report.report);
        }
    }, [freshReportData]);

    useEffect(() => {
        if (isDeleteReportSuccess) {
            setTimeout(() => {
                router.push('/main/reports');
            }, 1500);
        }
    }, [deleteReportData, isDeleteReportSuccess])

    if (deleteReportPending) {
        return <Loading text='Menghapus Laporan...' size='lg' className='absolute inset-0 left-0 xl:left-60'/>
    }

    if (isFreshReportLoading) {
        return <ReportDetailSkeleton />;
    }

    if (isFreshReportError) {
        const isNotFound = isNotFoundError(freshReportError);
        const isServerError = isInternalServerError(freshReportError);
        
        return (
            <div className="min-h-screen">
                <HeaderSection
                currentPath={customCurrentPath}
                message='Temukan dan lihat laporan masalah di sekitar Anda untuk meningkatkan kesadaran dan partisipasi masyarakat.' 
                />
                <div className='mt-4'>
                    <ErrorSection
                        message={getErrorResponseMessage(freshReportError) || 'Terjadi kesalahan saat memuat laporan'}
                        errors={getErrorResponseDetails(freshReportError)}
                        onRetry={() => freshReportRefetch()}
                        onGoBack={() => router.back()}
                        onGoHome={() => router.push('/main/home')}
                        showRetryButton={isServerError}
                        showBackButton={isNotFound}
                        showHomeButton={isNotFound}
                    />
                </div>
            </div>
        );
    }

    if (isDeleteReportError) {
        return (
            <div className="min-h-screen">
                <HeaderSection
                currentPath={customCurrentPath}
                message='Temukan dan lihat laporan masalah di sekitar Anda untuk meningkatkan kesadaran dan partisipasi masyarakat.' 
                />
                <div className='mt-4'>
                    <ErrorSection
                    message={getErrorResponseMessage(deleteReportError)}
                    errors={getErrorResponseDetails(deleteReportError)}
                    />
                </div>
            </div>
        ) 
    }

    if (!report || !freshReportData?.data?.report.report) {
        return (
            <div className="min-h-screen">
                <ErrorSection message="Laporan tidak ditemukan" />
            </div>
        );
    }

    return (
        <div className="min-h-screen ">
            <HeaderSection
            currentPath={customCurrentPath}
            message='Temukan dan lihat laporan masalah di sekitar Anda untuk meningkatkan kesadaran dan partisipasi masyarakat.' 
            />

            {report && freshReportData?.data?.report.report && (

                <div className="max-w-7xl mx-auto py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <ReportHeader 
                                report={report}
                                onRemoveReport={handleRemoveReport} 
                                />

                                <ReportMediaViewer 
                                    report={report}
                                    images={images}
                                    onImageClick={onAttachmentImageClick}
                                />

                                <div className="border-t border-gray-200">
                                    <ReportInteractionBar
                                        report={report}
                                        onLike={handleLike}
                                        onDislike={() => console.log('Dislike')}
                                        onSave={() => console.log('Save')}
                                        onComment={() => document.getElementById('comment-input')?.focus()}
                                        onShare={() => console.log('Share')}
                                    />
                                </div>
                            </div>

                            <ReportCommentsSection
                                comments={displayComments}
                                onSubmitComment={handleSubmitComment}
                                onReply={handleReply}
                            />
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            <ReportInfoSidebar 
                                report={report}
                                onRemoveReport={handleRemoveReport}
                                getReportTypeLabel={getReportTypeLabel}
                            />

                            <ReportProgressTimeline
                            report={report}
                            isReportOwner={isReportOwner || false}
                            onImageClick={onProgressImageClick}
                            />

                            <ReportVotingSection
                                report={report}
                                isReportOwner={isReportOwner || false}
                                isReportResolved={isReportResolved}
                                userCurrentVote={userCurrentVote}
                                isLoading={isFreshReportLoading}
                                animateButton={animateButton}
                                resolvedPercentage={percentages.resolved}
                                onProgressPercentage={percentages.onProgress}
                                notResolvedPercentage={percentages.notResolved}
                                majorityVote={majorityVote}
                                majorityPercentage={majorityPercentage}
                                handleVote={handleVote}
                            />
                            
                            {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h3 className="font-bold text-lg text-gray-900 mb-4">Laporan Terkait</h3>
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-500">Belum ada laporan terkait</p>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportDetailPage;
