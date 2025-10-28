"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getErrorResponseMessage, getImageURL } from '@/utils';
import { ReportType, IReportImage, ICommentType } from '@/types/model/report';
import { ReportInteractionBar } from '../components/ReportInteractionBar';
import { useUserProfileStore, useReportsStore } from '@/stores';
import { Breadcrumb } from '@/components/layouts';
import { useGetReportByID, useReactReport, useVoteReport } from '@/hooks/main';
import { useImagePreviewModalStore } from '@/stores';
import { useErrorToast } from '@/hooks/toast';
import { 
    ReportHeader, 
    ReportMediaViewer, 
    ReportCommentsSection, 
    ReportInfoSidebar, 
    ReportProgressTimeline, 
    ReportVotingSection 
} from './components';

const getReportTypeLabel = (type: ReportType): string => {
    const types: Record<ReportType, string> = {
        INFRASTRUCTURE: 'Infrastruktur',
        ENVIRONMENT: 'Lingkungan',
        SAFETY: 'Keamanan',
        OTHER: 'Lainnya'
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

    const { openImagePreview } = useImagePreviewModalStore();
    const { selectedReport, setSelectedReport } = useReportsStore();
    const { userProfile } = useUserProfileStore();

    const { 
        data: freshReportData,
        isLoading,
        isError,
        refetch,
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

    const [report, setReport] = useState(freshReportData?.data?.report);
    
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = report && currentUserId === report.userID;
    const totalVotes = report?.totalVotes || 0;
    const resolvedPercentage = totalVotes > 0 ? ((report?.totalResolvedVotes || 0) / totalVotes) * 100 : 0;
    const onProgressPercentage = totalVotes > 0 ? ((report?.totalOnProgressVotes || 0) / totalVotes) * 100 : 0;
    const notResolvedPercentage = totalVotes > 0 ? ((report?.totalNotResolvedVotes || 0) / totalVotes) * 100 : 0;
    const isReportResolved = report?.reportStatus === 'RESOLVED';
    const customCurrentPath = `/main/reports/${report?.id}`;
    const images = getReportImages(report?.images ?? { id: 0, reportID: 0 });
    const displayComments = report?.comments && report.comments.length > 0 ? report.comments : dummyComments;
    
    const calculateMajorityVote = () => {
        const resolvedVotes = report?.totalResolvedVotes || 0;
        const onProgressVotes = report?.totalOnProgressVotes || 0;
        const notResolvedVotes = report?.totalNotResolvedVotes || 0;
        
        const maxVotes = Math.max(resolvedVotes, onProgressVotes, notResolvedVotes);
        
        if (maxVotes === 0) return null;
        
        if (resolvedVotes === maxVotes) return 'RESOLVED';
        if (onProgressVotes === maxVotes) return 'ON_PROGRESS';
        return 'NOT_RESOLVED';
    };
    
    const majorityVote = calculateMajorityVote();
    const majorityPercentage = 
        majorityVote === 'RESOLVED'
            ? resolvedPercentage
            : majorityVote === 'ON_PROGRESS'
                ? onProgressPercentage
                : notResolvedPercentage;

    const userCurrentVote = report?.isResolvedByCurrentUser 
        ? 'RESOLVED'
        : report?.isNotResolvedByCurrentUser
            ? 'NOT_RESOLVED'
            : report?.isOnProgressByCurrentUser
                ? 'ON_PROGRESS'
                : null;

    const onImageClick = (imageURL: string) => {
        const url = getImageURL(`/report/progress/${imageURL}`, "main");
        openImagePreview(url);
    };

    const handleLike = async() => {
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

        try {
            reactReport({
                reportID: reportId,
                data: {
                    reactionType: 'LIKE'
                }
            });
        } catch (error) {
            console.error('Error liking report:', error);
            setReport(report);
            if (selectedReport?.id === reportId) {
                setSelectedReport(report);
            }
        }
    }

    const handleVote = async (voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'ON_PROGRESS') => {
        if (isLoading || isReportResolved) return;
        setAnimateButton(voteType);
        handleStatusVote(reportId, voteType);
        setTimeout(() => setAnimateButton(null), 300);
    };

    const handleStatusVote = async (reportId: number, voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'ON_PROGRESS' | 'NEUTRAL') => {
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

        try {
            if (voteType !== 'NEUTRAL') {
                voteReport({
                    reportID: reportId,
                    data: { voteType: voteType as 'RESOLVED' | 'NOT_RESOLVED' | 'ON_PROGRESS' },
                });
            }
        } catch (error) {
            console.error('Error voting on status:', error);
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

    useErrorToast(isVoteReportError, voteReportError);
    useErrorToast(isReactReportError, getErrorResponseMessage(reactReportError) || 'Terjadi kesalahan saat bereaksi pada laporan');

    useEffect(() => {
        if (freshReportData?.data?.report) {
            setReport(freshReportData.data.report);
        }
    }, [freshReportData]);

    useEffect(() => {
        if (isVoteReportError) {
            refetch();
        }
    }, [isVoteReportError, refetch]);
    
    useEffect(() => {
        if (isReactReportError) {
            refetch();
        }
    }, [isReactReportError, refetch]);

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Gagal memuat laporan</p>
                    <button
                        onClick={() => router.push('/main/reports')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Kembali ke Daftar Laporan
                    </button>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Laporan tidak ditemukan</p>
                    <button
                        onClick={() => router.push('/main/reports')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Kembali ke Daftar Laporan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen ">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className='flex flex-col gap-3'>
                        <Breadcrumb path={customCurrentPath}/>
                        <p className="text-gray-600 text-sm">
                            Temukan dan lihat laporan masalah di sekitar Anda untuk meningkatkan kesadaran dan partisipasi masyarakat.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <ReportHeader report={report} />

                            <ReportMediaViewer 
                                report={report}
                                images={images}
                                onImageClick={onImageClick}
                            />

                            <div className="border-t border-gray-200">
                                <ReportInteractionBar
                                    reportID={report.id}
                                    userInteraction={report.userInteraction || { hasLiked: false, hasDisliked: false, hasSaved: false }}
                                    commentCount={report.commentCount || 0}
                                    isLikedByCurrentUser={report.isLikedByCurrentUser}
                                    totalLikeReactions={report.totalLikeReactions}
                                    totalDislikeReactions={report.totalDislikeReactions}
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
                            getReportTypeLabel={getReportTypeLabel}
                        />

                        <ReportProgressTimeline
                        report={report}
                        isReportOwner={isReportOwner || false}
                        onImageClick={onImageClick}
                        />

                        <ReportVotingSection
                            report={report}
                            isReportOwner={isReportOwner || false}
                            isReportResolved={isReportResolved}
                            userCurrentVote={userCurrentVote}
                            isLoading={isLoading}
                            animateButton={animateButton}
                            resolvedPercentage={resolvedPercentage}
                            onProgressPercentage={onProgressPercentage}
                            notResolvedPercentage={notResolvedPercentage}
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
        </div>
    );
};

export default ReportDetailPage;
