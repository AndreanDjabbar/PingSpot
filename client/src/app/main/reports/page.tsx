"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HeaderSection from '../components/HeaderSection';
import Image from 'next/image';
import { FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaFilter } from 'react-icons/fa';
import { MdOutlineCategory } from 'react-icons/md';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { BiPlus } from 'react-icons/bi';
import { useRouter } from 'next/navigation';
import { ErrorSection, ImagePreviewModal } from '@/components/feedback';
import { useGetReport } from '@/hooks/main/useGetReport';
import useErrorToast from '@/hooks/useErrorToast';
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils/gerErrorResponse';
import { getDataResponseDetails } from '@/utils/getDataResponse';
import { getImageURL } from '@/utils/getImageURL';
import { formattedDate } from '@/utils/getFormattedDate';
import { ReportType, Report, ReportImage } from './types';

const StaticMap = dynamic(() => import('../components/StaticMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded-lg"></div>
});

const getReportTypeLabel = (type: ReportType): string => {
    const types = {
        INFRASTRUCTURE: 'Infrastruktur',
        ENVIRONMENT: 'Lingkungan',
        SAFETY: 'Keamanan',
        OTHER: 'Lainnya'
    };
    return types[type] || 'Lainnya';
};

const getReportTypeColorClass = (type: ReportType): string => {
    const colors = {
        INFRASTRUCTURE: 'bg-blue-500',
        ENVIRONMENT: 'bg-green-500',
        SAFETY: 'bg-red-500',
        OTHER: 'bg-purple-500'
    };
    return colors[type] || 'bg-gray-500';
};

const ReportsPage = () => {
    const currentPath = usePathname();
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<ReportType | "all">("all");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

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
    };

    const getReportImages = (images: ReportImage): string[] => {
        console.log("IMAGES OBJECT:", images);
        return [
            images.image1URL, 
            images.image2URL, 
            images.image3URL,
            images.image4URL,
            images.image5URL
        ].filter((url): url is string => typeof url === 'string');
    };

    useErrorToast(isGetReportError, getErrorResponseMessage(getReportError) || 'Terjadi kesalahan saat mengambil data laporan');

    if (getReportPending) {
        return (
            <div className="space-y-8">
                <HeaderSection 
                    currentPath={currentPath}
                    message='Memuat data laporan...'>
                    <div className="bg-gray-300 animate-pulse px-8 py-4 rounded-xl">
                        <div className="w-32 h-6 bg-gray-400 rounded"></div>
                    </div>
                </HeaderSection>
                
                {/* Loading skeleton for reports */}
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-6">
                            <div className="animate-pulse">
                                <div className="flex items-center mb-4">
                                    <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                    <div className="ml-auto h-6 w-20 bg-gray-300 rounded-full"></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-[200px] bg-gray-200 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
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
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari laporan berdasarkan judul, deskripsi atau lokasi"
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex space-x-2 items-center overflow-x-auto pb-2 md:pb-0">
                            <div className="flex items-center text-gray-500 mr-2">
                                <FaFilter className="mr-1" /> Filter:
                            </div>
                            <button 
                                className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                                    activeFilter === "all" 
                                        ? "bg-sky-100 text-sky-800 font-medium" 
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                onClick={() => setActiveFilter("all")}
                            >
                                Semua
                            </button>
                            <button 
                                className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                                    activeFilter === "INFRASTRUCTURE" 
                                        ? "bg-sky-100 text-sky-800 font-medium" 
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                onClick={() => setActiveFilter("INFRASTRUCTURE")}
                            >
                                Infrastruktur
                            </button>
                            <button 
                                className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                                    activeFilter === "ENVIRONMENT" 
                                        ? "bg-sky-100 text-sky-800 font-medium" 
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                onClick={() => setActiveFilter("ENVIRONMENT")}
                            >
                                Lingkungan
                            </button>
                            <button 
                                className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                                    activeFilter === "SAFETY" 
                                        ? "bg-sky-100 text-sky-800 font-medium" 
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                onClick={() => setActiveFilter("SAFETY")}
                            >
                                Keamanan
                            </button>
                            <button 
                                className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                                    activeFilter === "OTHER" 
                                        ? "bg-sky-100 text-sky-800 font-medium" 
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                onClick={() => setActiveFilter("OTHER")}
                            >
                                Lainnya
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {!getReportPending && (
                <>
                    {filteredReports.length > 0 ? (
                        <div className="space-y-6">
                            {filteredReports.map(report => (
                                <div key={report.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl overflow-hidden transition-all duration-300">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                {report && (
                                                    <div className="h-10 w-10 rounded-full overflow-hidden mr-3 border-2 border-white shadow">
                                                        <Image 
                                                            src={getImageURL(report?.profilePicture || '', "user")} 
                                                            alt={report?.fullName}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover h-full w-full"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-sky-900">{report?.fullName}</div>
                                                    <div className="text-xs text-gray-500 flex items-center">
                                                        <FaCalendarAlt className="mr-1" size={12} />
                                                        {formattedDate(report?.reportCreatedAt, {
                                                            formatStr: 'dd MMMM yyyy - HH:mm',
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <span className={`inline-block px-3 py-1 text-xs font-medium text-white rounded-full ${getReportTypeColorClass(report.reportType)}`}>
                                                    {getReportTypeLabel(report.reportType)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <h2 className="text-xl font-bold text-sky-900 mb-2">{report.reportTitle}</h2>
                                        <p className="text-gray-700 mb-4">{report.reportDescription}</p>
                                        
                                        <div className="flex items-start mb-5 text-gray-600">
                                            <FaMapMarkerAlt className="mt-1 mr-2 flex-shrink-0 text-red-500" />
                                            <div>
                                                <div className="font-medium">{report.location.detailLocation}</div>
                                                {report.location.displayName && (
                                                    <div className="text-sm text-gray-500">{report.location.displayName}</div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4 h-[200px] w-full rounded-lg overflow-hidden">
                                            <StaticMap
                                            latitude={report.location.latitude}
                                            longitude={report.location.longitude}
                                            height={200}
                                            markerColor='red'
                                            popupText={report.reportTitle}
                                            />
                                        </div>
                                        
                                        {getReportImages(report.images).length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 mb-2">Foto Permasalahan:</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                                    {getReportImages(report.images).map((imageUrl, index) => (
                                                        <div 
                                                            key={`${report.id}-image-${index}`}
                                                            className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border-2 border-white shadow"
                                                            onClick={() => handleImageClick(getImageURL(`/report/${imageUrl}`, "main"))}
                                                        >
                                                            <Image 
                                                                src={getImageURL(`/report/${imageUrl}`, "main")}
                                                                alt={`Foto ${index + 1} untuk laporan ${report.reportTitle}`}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : reports.length === 0 && !isGetReportError ? (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-12 text-center">
                            <div className="text-5xl text-gray-300 mb-4 flex justify-center">
                                <MdOutlineCategory />
                            </div>
                            <h3 className="text-xl font-medium text-gray-600 mb-2">Belum ada laporan tersedia</h3>
                            <p className="text-gray-500 mb-4">Jadilah yang pertama membuat laporan untuk komunitas Anda</p>
                            <button 
                                className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 mx-auto"
                                onClick={() => router.push('/main/reports/create-report')}>
                                <BiPlus className="w-4 h-4" />
                                <span>Buat Laporan Pertama</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-12 text-center">
                            <div className="text-5xl text-gray-300 mb-4 flex justify-center">
                                <FaSearch />
                            </div>
                            <h3 className="text-xl font-medium text-gray-600 mb-2">Tidak ada laporan ditemukan</h3>
                            <p className="text-gray-500">Silahkan coba dengan kata kunci pencarian lain atau filter yang berbeda</p>
                        </div>
                    )}
                </>
            )}
            
            <ImagePreviewModal
                imageUrl={previewImage}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default ReportsPage;