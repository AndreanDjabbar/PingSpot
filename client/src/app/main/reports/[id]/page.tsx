"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaArrowLeft, FaImage, FaMap } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import { BiSend } from 'react-icons/bi';
import 'leaflet/dist/leaflet.css';
import { getImageURL, getFormattedDate as formattedDate } from '@/utils';
import { ReportType, IReportImage, ICommentType } from '@/types/model/report';
import { ReportInteractionBar } from '../components/ReportInteractionBar';
import StatusVoting from '../components/StatusVoting';
import CommentItem from '../components/CommentItem';
import { useReportsStore } from '@/stores';
import { Breadcrumb } from '@/components/layouts';

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

// Dummy comments data
const dummyComments: ICommentType[] = [
    {
        id: 1,
        content: "Terima kasih laporannya! Saya juga merasakan hal yang sama di area tersebut. Semoga segera ditindaklanjuti oleh pihak terkait.",
        createdAt: Date.now() - 86400000, // 1 day ago
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
                createdAt: Date.now() - 43200000, // 12 hours ago
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
        createdAt: Date.now() - 172800000, // 2 days ago
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
    
    const { reports } = useReportsStore();
    const report = reports.find(r => r.id === reportId);
    
    // Use dummy comments if no real comments exist
    const displayComments = report?.comments && report.comments.length > 0 
        ? report.comments 
        : dummyComments;
    
    const [viewMode, setViewMode] = useState<'attachment' | 'map'>('attachment');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const customCurrentPath = `/main/reports/${report?.reportTitle}`;

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
        const url = getImageURL(imageURL, "main");
        // Open image preview modal
        console.log('Open image:', url);
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            // Add comment logic here
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

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Report Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Report Header Card */}
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
                                        <p className="text-sm font-medium text-gray-900">{report.location.detailLocation}</p>
                                        {report.location.displayName && (
                                            <p className="text-xs text-gray-600 mt-1">{report.location.displayName}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Toggle View Button */}
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

                            {/* Media Section */}
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

                            {/* Interaction Bar */}
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

                            {/* Status Voting */}
                            {report.hasProgress && (
                                <div className="border-t border-gray-200">
                                    <StatusVoting
                                        reportID={report.id}
                                        currentStatus={report.status || 'PENDING'}
                                        onVote={(voteType: string) => console.log('Vote:', voteType)}
                                        onImageClick={onImageClick}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Komentar ({displayComments.length})
                                </h2>
                            </div>

                            {/* Add Comment */}
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

                            {/* Comments List */}
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

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Report Info */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Informasi Laporan</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                        report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                        report.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {report.status === 'RESOLVED' ? 'Terselesaikan' :
                                         report.status === 'IN_PROGRESS' ? 'Dalam Proses' : 'Menunggu'}
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

                        {/* Hasil Voting */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Hasil Voting Pengguna</h3>
                            <div className="space-y-4">
                                {/* Total Votes */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Total Voting</p>
                                    <p className="text-3xl font-bold text-blue-700">247</p>
                                    <p className="text-xs text-blue-600 mt-1">Pengguna telah memberikan voting</p>
                                </div>

                                <div className="h-px bg-gray-200"></div>

                                {/* Vote Distribution */}
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Distribusi Vote</p>
                                    
                                    {/* Resolved Vote */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-green-700">Terselesaikan</span>
                                            <span className="text-gray-600 font-semibold">142 (57%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full shadow-sm" style={{ width: '57%' }}></div>
                                        </div>
                                    </div>

                                    {/* In Progress Vote */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-yellow-700">Dalam Proses</span>
                                            <span className="text-gray-600 font-semibold">78 (32%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2.5 rounded-full shadow-sm" style={{ width: '32%' }}></div>
                                        </div>
                                    </div>

                                    {/* Pending Vote */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-700">Menunggu</span>
                                            <span className="text-gray-600 font-semibold">27 (11%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-gray-400 to-gray-500 h-2.5 rounded-full shadow-sm" style={{ width: '11%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-200"></div>

                                {/* Majority Vote */}
                                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Vote Mayoritas</p>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                            Terselesaikan
                                        </span>
                                        <span className="text-sm text-green-700 font-medium">57% pengguna</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related Reports */}
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
