"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaImage, FaMap, FaTimes, FaCheck } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import { IoDocumentText } from "react-icons/io5";
import { BiEdit, BiSend, BiX } from 'react-icons/bi';
import { MdDone } from "react-icons/md";
import 'leaflet/dist/leaflet.css';
import { getImageURL, getFormattedDate as formattedDate } from '@/utils';
import { ReportType, IReportImage, ICommentType } from '@/types/model/report';
import { ReportInteractionBar } from '../components/ReportInteractionBar';
import CommentItem from '../components/CommentItem';
import { useUserProfileStore } from '@/stores';
import { Breadcrumb } from '@/components/layouts';
import { useGetReportByID, useVoteReport } from '@/hooks/main';
import { Accordion } from '@/components/UI';
import { motion } from 'framer-motion';
import { RiProgress3Fill } from "react-icons/ri";
import { useImagePreviewModalStore } from '@/stores';
import { useErrorToast } from '@/hooks/toast';

const StaticMap = dynamic(() => import('../../components/StaticMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[380px] bg-gray-200 animate-pulse rounded-xl"></div>
});

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
    const [animateButton, setAnimateButton] = useState<string | null>(null);
    const { openImagePreview } = useImagePreviewModalStore();
    
    const { 
        data: freshReportData,
        isLoading,
        isError,
        refetch,
    } = useGetReportByID(reportId);
    
    const {
        mutate: voteReport,
        isError: isVoteReportError,
        error: voteReportError,
    } = useVoteReport();
    
    useErrorToast(isVoteReportError, voteReportError);
    
    const report = freshReportData?.data?.report;
    const { userProfile } = useUserProfileStore();
    const currentUserId = userProfile ? Number(userProfile.userID) : null;
    const isReportOwner = report && currentUserId === report.userID;
    const totalVotes = report?.totalVotes || 0;
    const resolvedPercentage = totalVotes > 0 ? ((report?.totalResolvedVotes || 0) / totalVotes) * 100 : 0;
    const onProgressPercentage = totalVotes > 0 ? ((report?.totalOnProgressVotes || 0) / totalVotes) * 100 : 0;
    const notResolvedPercentage = totalVotes > 0 ? ((report?.totalNotResolvedVotes || 0) / totalVotes) * 100 : 0;
    
    const isReportResolved = report?.reportStatus === 'RESOLVED';
    
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
                : null
    
    const displayComments = report?.comments && report.comments.length > 0 
        ? report.comments 
        : dummyComments;
    
    const [viewMode, setViewMode] = useState<'attachment' | 'map'>('attachment');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const customCurrentPath = `/main/reports/${report?.id}`;

    const images = getReportImages(
        report?.images ?? { id: 0, reportID: 0 }
    );

    const nextImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    const onImageClick = (imageURL: string) => {
        const url = getImageURL(`/report/progress/${imageURL}`, "main");
        openImagePreview(url);
    };

    const handleVote = async (voteType: 'RESOLVED' | 'NOT_RESOLVED' | 'ON_PROGRESS') => {
        console.log("CURRENT STATUS: ", report?.reportStatus);
        console.log("IS REPORT RESOLVED: ", isReportResolved);
        console.log("USER CURRENT VOTE: ", userCurrentVote);
        console.log("VOTE TYPE CLICKED: ", voteType);  
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

    useErrorToast(isVoteReportError, voteReportError);

    React.useEffect(() => {
        if (isVoteReportError) {
            refetch();
        }
    }, [isVoteReportError, refetch]);

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
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200">
                                            <Image
                                                src={getImageURL(report.profilePicture || '', "user")}
                                                alt={report.fullName}
                                                width={48}
                                                height={48}
                                                className="object-cover h-full w-full"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-base text-gray-900">{report.userName}</div>
                                            <div className="text-sm text-gray-500">
                                                {formattedDate(report.reportCreatedAt, {
                                                    formatStr: 'dd MMMM yyyy - HH:mm',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-sm font-semibold text-blue-700 rounded-full">
                                            {getReportTypeLabel(report.reportType)}
                                        </span>
                                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <BsThreeDots size={20} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 mb-3">{report.reportTitle}</h1>
                                <p className="text-base text-gray-700 leading-relaxed mb-4">{report.reportDescription}</p>

                                <div className="flex items-start gap-2 text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <FaMapMarkerAlt className="mt-1 text-red-500 flex-shrink-0" size={16} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{report?.location?.detailLocation}</p>
                                        {report?.location?.displayName && (
                                            <p className="text-xs text-gray-600 mt-1">{report?.location?.displayName}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {images.length > 0 && (
                                <div className="px-6 pb-3">
                                    <div className="flex items-center justify-center">
                                        <div className="inline-flex items-center w-full max-w-md rounded-lg overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => setViewMode('attachment')}
                                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200 ${
                                                    viewMode === 'attachment'
                                                        ? 'bg-gray-400 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                <FaImage className="w-4 h-4" />
                                                <span>Lampiran</span>
                                            </button>
                                            <button
                                                onClick={() => setViewMode('map')}
                                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200 ${
                                                    viewMode === 'map'
                                                        ? 'bg-gray-400 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                <FaMap className="w-4 h-4" />
                                                <span>Peta</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="w-full px-6 pb-6">
                                {viewMode === 'attachment' && images.length > 0 && (
                                    <div className="relative">
                                        <div className="relative h-[480px] rounded-xl overflow-hidden bg-gray-100 shadow-md">
                                            <Image
                                                src={getImageURL(`/report/${images[currentImageIndex]}`, "main")}
                                                alt={`Foto ${currentImageIndex + 1} untuk laporan ${report.reportTitle}`}
                                                fill
                                                className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                                onClick={() => onImageClick(`/report/${images[currentImageIndex]}`)}
                                            />

                                            {images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={prevImage}
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-2.5 rounded-full hover:bg-opacity-100 hover:scale-110 transition-all shadow-lg"
                                                        aria-label="Previous image"
                                                    >
                                                        <FaChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={nextImage}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 p-2.5 rounded-full hover:bg-opacity-100 hover:scale-110 transition-all shadow-lg"
                                                        aria-label="Next image"
                                                    >
                                                        <FaChevronRight className="w-4 h-4" />
                                                    </button>

                                                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                                                        {currentImageIndex + 1} / {images.length}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {images.length > 1 && (
                                            <div className="flex justify-center gap-1.5 mt-3">
                                                {images.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentImageIndex(index)}
                                                        className={`h-2 rounded-full transition-all duration-200 ${
                                                            index === currentImageIndex
                                                                ? 'w-6 bg-blue-600'
                                                                : 'w-2 bg-gray-300 hover:bg-gray-400'
                                                        }`}
                                                        aria-label={`Go to image ${index + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {viewMode === 'map' && (
                                    <div className="relative">
                                        <div className="relative w-full overflow-hidden bg-gray-100 rounded-xl shadow-md">
                                            <StaticMap
                                                latitude={report.location.latitude}
                                                longitude={report.location.longitude}
                                                height={480}
                                                markerColor='red'
                                                popupText={report.reportTitle}
                                            />
                                        </div>
                                        <div className="mt-4 bg-gray-100 rounded-lg p-4">
                                            <div className="flex items-start gap-2">
                                                <FaMapMarkerAlt className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{report.location.detailLocation}</p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {report.location.displayName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200">
                                <ReportInteractionBar
                                    reportID={report.id}
                                    userInteraction={report.userInteraction || { hasLiked: false, hasDisliked: false, hasSaved: false }}
                                    commentCount={report.commentCount || 0}
                                    onLike={() => console.log('Like')}
                                    onDislike={() => console.log('Dislike')}
                                    onSave={() => console.log('Save')}
                                    onComment={() => document.getElementById('comment-input')?.focus()}
                                    onShare={() => console.log('Share')}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Komentar ({displayComments.length})
                                </h2>
                            </div>

                            <div className="p-6 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                        <Image
                                            src={getImageURL('', "user")}
                                            alt="Your profile"
                                            width={40}
                                            height={40}
                                            className="object-cover h-full w-full"
                                        />
                                    </div>
                                    <div className="flex-1 flex gap-2">
                                        <textarea
                                            id="comment-input"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Tulis komentar Anda..."
                                            className="flex-1 p-3 text-sm border border-gray-200 rounded-xl resize-none shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            rows={3}
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            onClick={handleSubmitComment}
                                            disabled={!newComment.trim() || isSubmitting}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all h-fit shadow-sm hover:shadow-md"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <BiSend size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {displayComments.map((comment) => (
                                    <div key={comment.id} className="p-6">
                                        <CommentItem
                                            comment={comment}
                                            variant="full"
                                            showLikes={true}
                                            onReply={handleReply}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Informasi Laporan</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                        report.reportStatus === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                        report.reportStatus === 'NOT_RESOLVED' ? 'bg-red-100 text-red-800' :
                                        report.reportStatus === 'ON_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {report.reportStatus === 'RESOLVED' ? 'Terselesaikan' :
                                        report.reportStatus === 'NOT_RESOLVED' ? 'Belum Terselesaikan' :
                                        report.reportStatus === 'ON_PROGRESS' ? 'Dalam Proses' : 'Menunggu'}
                                    </span>
                                </div>
                                <div className="h-px bg-gray-200"></div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dilaporkan</p>
                                    <p className="text-sm text-gray-900">
                                        {formattedDate(report.reportCreatedAt, {
                                            formatStr: 'dd MMMM yyyy',
                                        })}
                                    </p>
                                </div>
                                <div className="h-px bg-gray-200"></div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kategori</p>
                                    <p className="text-sm text-gray-900">{getReportTypeLabel(report.reportType)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-gray-900">Perkembangan Laporan</h3>
                                {isReportOwner && (
                                    <button
                                        onClick={() => router.push(`/main/reports/${report.id}/update-progress`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-pingspot-hoverable text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                                    >
                                        <BiEdit size={16} />
                                        <span>Perbarui</span>
                                    </button>
                                )}
                            </div>
                            
                            {report.reportProgress && report.reportProgress.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                        {(() => {
                                            const latestProgress = report.reportProgress[0];
                                            const latestImages = [
                                                latestProgress.attachment1,
                                                latestProgress.attachment2
                                            ].filter((url): url is string => typeof url === 'string' && url.length > 0);
                                            
                                            return (
                                                <>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-xs font-bold text-sky-700 uppercase tracking-wide">Perkembangan Terakhir</p>
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                            latestProgress.status === 'RESOLVED' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : latestProgress.status === 'ON_PROGRESS'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {latestProgress.status === 'RESOLVED' 
                                                                ? 'Terselesaikan' 
                                                                : latestProgress.status === 'ON_PROGRESS'
                                                                ? 'Dalam Proses'
                                                                : 'Tidak Ada Proses'}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        {formattedDate(latestProgress.createdAt, {
                                                            formatStr: 'dd MMMM yyyy - HH:mm',
                                                        })}
                                                    </p>
                                                    
                                                    {latestProgress.notes && (
                                                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                                            {latestProgress.notes}
                                                        </p>
                                                    )}
                                                    
                                                    {latestImages.length > 0 && (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {latestImages.map((imageUrl, imgIndex) => (
                                                                <div 
                                                                    key={imgIndex}
                                                                    className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                                    onClick={() => onImageClick(imageUrl)}
                                                                >
                                                                    <Image
                                                                        src={getImageURL(`/report/progress/${imageUrl}`, "main")}
                                                                        alt={`Latest progress - Image ${imgIndex + 1}`}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {report.reportProgress.length > 1 && (
                                        <Accordion type="single" defaultValue={[]}>
                                            <Accordion.Item id="timeline" title={`Semua Perkembangan (${report.reportProgress.length})`}>
                                                <div className="max-h-[500px] overflow-y-auto  mt-2">
                                                    <div className="space-y-4">
                                                        <div className="relative">
                                                            {report.reportProgress.map((progress, index) => {
                                                                const isLast = index === report.reportProgress.length - 1;
                                                                const progressImages = [
                                                                    progress.attachment1,
                                                                    progress.attachment2
                                                                ].filter((url): url is string => typeof url === 'string' && url.length > 0);
                                                                
                                                                return (
                                                                    <div key={`${progress.id}-${index}`} className="relative pb-6">
                                                                        {!isLast && (
                                                                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-gray-200"></div>
                                                                        )}
                                                                        
                                                                        <div className="flex items-start gap-3">
                                                                            <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                                                                                progress.status === 'RESOLVED' 
                                                                                    ? 'bg-gradient-to-br from-green-400 to-green-600' 
                                                                                    : progress.status === 'ON_PROGRESS'
                                                                                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                                                                                    : 'bg-gradient-to-br from-red-400 to-red-600'
                                                                            }`}>
                                                                                {progress.status === 'RESOLVED' ? (
                                                                                    <MdDone className='text-white' size={20}/>
                                                                                ) : progress.status === 'ON_PROGRESS' ? (
                                                                                    <RiProgress3Fill className='text-white' size={20}/>
                                                                                ) : (
                                                                                    <BiX className='text-white' size={20}/>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className={`rounded-lg p-3 border ${
                                                                                    progress.status === 'RESOLVED' 
                                                                                        ? 'bg-green-50 border-green-200' 
                                                                                        : progress.status === 'ON_PROGRESS'
                                                                                        ? 'bg-yellow-50 border-yellow-200'
                                                                                        : 'bg-red-50 border-red-200'
                                                                                }`}>
                                                                                    <div className="flex items-center justify-between mb-2 lg:flex-col lg:items-start 2xl:flex-row">
                                                                                        <span className={`text-xs font-bold uppercase tracking-wide ${
                                                                                            progress.status === 'RESOLVED' 
                                                                                                ? 'text-green-700' 
                                                                                                : progress.status === 'ON_PROGRESS'
                                                                                                ? 'text-yellow-700'
                                                                                                : 'text-red-700'
                                                                                        }`}>
                                                                                            {progress.status === 'RESOLVED' 
                                                                                                ? 'Terselesaikan' 
                                                                                                : progress.status === 'ON_PROGRESS'
                                                                                                ? 'Dalam Proses'
                                                                                                : 'Tidak Ada Proses'}
                                                                                        </span>
                                                                                        <span className="text-xs text-gray-500">
                                                                                            {formattedDate(progress.createdAt, {
                                                                                                formatStr: 'dd MMM yyyy - HH:mm',
                                                                                            })}
                                                                                        </span>
                                                                                    </div>
                                                                                    
                                                                                    {progress.notes && (
                                                                                        <p className="text-sm text-gray-700 leading-relaxed">
                                                                                            {progress.notes}
                                                                                        </p>
                                                                                    )}
                                                                                    
                                                                                    {progressImages.length > 0 && (
                                                                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                                                                            {progressImages.map((imageUrl, imgIndex) => (
                                                                                                <div 
                                                                                                    key={`${imgIndex}-${index}`}
                                                                                                    className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                                                                    onClick={() => onImageClick(imageUrl)}
                                                                                                >
                                                                                                    <Image
                                                                                                        src={getImageURL(`/report/progress/${imageUrl}`, "main")}
                                                                                                        alt={`Progress ${index + 1} - Image ${imgIndex + 1}`}
                                                                                                        fill
                                                                                                        className="object-cover"
                                                                                                    />
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Accordion.Item>
                                        </Accordion>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                                        <IoDocumentText size={32}/>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">Belum Ada Perkembangan</p>
                                    <p className="text-xs text-gray-500">
                                        Perkembangan laporan akan ditampilkan di sini
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Hasil Voting Pengguna</h3>
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                    <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-1">Total Voting</p>
                                    <p className="text-3xl font-bold text-sky-800">{report.totalVotes}</p>
                                    <p className="text-xs text-sky-700 mt-1">Pengguna telah memberikan voting</p>
                                </div>

                                <div className="h-px bg-gray-200"></div>
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Distribusi Vote</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-green-700">Terselesaikan</span>
                                            <span className="text-gray-600 font-semibold">{report.totalResolvedVotes} ({resolvedPercentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                                style={{ width: `${resolvedPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-yellow-700">Dalam Proses</span>
                                            <span className="text-gray-600 font-semibold">{report.totalOnProgressVotes} ({onProgressPercentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                                style={{ width: `${onProgressPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-red-700">Tidak Ada Proses</span>
                                            <span className="text-gray-600 font-semibold">{report.totalNotResolvedVotes} ({notResolvedPercentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-red-400 to-red-500 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out" 
                                                style={{ width: `${notResolvedPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-200"></div>

                                <div className={`rounded-lg p-3 border transition-all duration-500 ${
                                    majorityVote === 'RESOLVED' 
                                        ? 'bg-green-50 border-green-100' 
                                        : majorityVote === 'ON_PROGRESS'
                                        ? 'bg-yellow-50 border-yellow-100'
                                        : 'bg-red-50 border-red-100'
                                }`}>
                                    <p className={`text-xs font-semibold uppercase tracking-wide mb-1 transition-colors duration-500 ${
                                        majorityVote === 'RESOLVED'
                                            ? 'text-green-700'
                                            : majorityVote === 'ON_PROGRESS'
                                            ? 'text-yellow-700'
                                            : 'text-red-700'
                                    }`}>Vote Mayoritas</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-colors duration-500 ${
                                            majorityVote === 'RESOLVED'
                                                ? 'bg-green-100 text-green-700'
                                                : majorityVote === 'ON_PROGRESS'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {majorityVote === 'RESOLVED' 
                                                ? 'Terselesaikan' 
                                                : majorityVote === 'ON_PROGRESS'
                                                ? 'Dalam Proses'
                                                : 'Tidak Ada Proses'}   
                                        </span>
                                        <span className={`text-sm font-medium transition-colors duration-500 ${
                                            majorityVote === 'RESOLVED'
                                                ? 'text-green-700'
                                                : majorityVote === 'ON_PROGRESS'
                                                ? 'text-yellow-700'
                                                : 'text-red-700'
                                        }`}>{majorityPercentage.toFixed(0)}% pengguna</span>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-4'>
                                {isReportResolved ? (
                                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-300 shadow-sm">
                                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-md">
                                                <FaCheck className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-green-800 font-semibold">
                                                    Laporan Terselesaikan
                                                </p>
                                                <p className="text-xs text-green-700 mt-0.5">
                                                    Voting ditutup
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {!isReportOwner && (
                                                <>
                                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                                        <p className="text-sm text-blue-800 font-medium text-center">
                                                            Bagaimana pendapat Anda tentang perkembangan laporan ini?
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="inline-flex items-center w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
                                                        <motion.button
                                                            className={`flex-1 flex items-center justify-center space-x-2 px-2 py-4 font-semibold transition-all duration-200 ${
                                                                userCurrentVote === 'RESOLVED'
                                                                    ? 'bg-green-600 text-white shadow-inner'
                                                                    : 'bg-gray-100 text-green-700 hover:bg-green-50'
                                                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={() => handleVote('RESOLVED')}
                                                            disabled={isLoading}
                                                            animate={animateButton === 'RESOLVED' ? { scale: [1, 1.02, 1] } : {}}
                                                            transition={{ duration: 0.3 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <FaCheck className="w-4 h-4" />
                                                            <span className="text-sm">Terselesaikan</span>
                                                        </motion.button>

                                                        <motion.button
                                                            className={`flex-1 flex items-center justify-center space-x-2 px-2 py-4 font-semibold transition-all duration-200 ${
                                                                userCurrentVote === 'ON_PROGRESS'
                                                                    ? 'bg-yellow-600 text-white shadow-inner'
                                                                    : 'bg-gray-100 text-yellow-700 hover:bg-yellow-50'
                                                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={() => handleVote('ON_PROGRESS')}
                                                            disabled={isLoading}
                                                            animate={animateButton === 'ON_PROGRESS' ? { scale: [1, 1.02, 1] } : {}}
                                                            transition={{ duration: 0.3 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <RiProgress3Fill className="w-4 h-4" />
                                                            <span className="text-sm">Dalam Proses</span>
                                                        </motion.button>

                                                        <motion.button
                                                            className={`flex-1 flex items-center justify-center space-x-2 px-2 py-4 font-semibold transition-all duration-200 ${
                                                                userCurrentVote === 'NOT_RESOLVED'
                                                                    ? 'bg-red-600 text-white shadow-inner'
                                                                    : 'bg-gray-100 text-red-700 hover:bg-red-50'
                                                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={() => handleVote('NOT_RESOLVED')}
                                                            disabled={isLoading}
                                                            animate={animateButton === 'NOT_RESOLVED' ? { scale: [1, 1.02, 1] } : {}}
                                                            transition={{ duration: 0.3 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <FaTimes className="w-4 h-4" />
                                                            <span className="text-sm">Tidak Ada</span>
                                                        </motion.button>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {userCurrentVote && !isReportResolved && (
                                        <div className="mt-3 text-center bg-gray-100 rounded-lg p-3 border border-gray-200">
                                            <p className="text-sm text-gray-700">
                                                Anda memilih: <span className="font-bold text-gray-900">
                                                    {userCurrentVote === 'RESOLVED' && '✓ Terselesaikan'}
                                                    {userCurrentVote === 'ON_PROGRESS' && '-> Dalam Proses'}
                                                    {userCurrentVote === 'NOT_RESOLVED' && '✗ Tidak Ada Perkembangan'}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                            </div>
                            
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Laporan Terkait</h3>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-500">Belum ada laporan terkait</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailPage;
