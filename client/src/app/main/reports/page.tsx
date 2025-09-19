"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HeaderSection from '../components/HeaderSection';
import Image from 'next/image';
import { FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaFilter } from 'react-icons/fa';
import { MdOutlineCategory } from 'react-icons/md';
import { ImagePreviewModal } from '@/components/UI';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { BiPlus } from 'react-icons/bi';
import { useRouter } from 'next/navigation';

const DynamicMap = dynamic(() => import('../components/DynamicMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded-lg"></div>
});

// Define types based on the backend models
type ReportType = 'infrastructure' | 'environment' | 'safety' | 'other';

interface ReportImage {
    id: number;
    reportId: number;
    image1URL?: string;
    image2URL?: string;
    image3URL?: string;
    image4URL?: string;
    image5URL?: string;
}

interface ReportLocation {
    id: number;
    reportId: number;
    detailLocation: string;
    latitude: number;
    longitude: number;
    displayName?: string;
    addressType?: string;
    country?: string;
    countryCode?: string;
    region?: string;
    road?: string;
    postCode?: string;
    county?: string;
    state?: string;
    village?: string;
    suburb?: string;
}

interface User {
    id: number;
    fullName: string;
    profileImage?: string;
}

interface Report {
    id: number;
    userId: number;
    user: User;
    reportTitle: string;
    reportType: ReportType;
    reportDescription: string;
    createdAt: number;
    location: ReportLocation;
    images: ReportImage;
}

// Dummy data for reports
const dummyReports: Report[] = [
    {
        id: 1,
        userId: 1,
        user: {
            id: 1,
            fullName: "Ahmad Rasyid",
            profileImage: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        reportTitle: "Jalan Berlubang di Kawasan Pasar Minggu",
        reportType: "infrastructure",
        reportDescription: "Terdapat beberapa lubang besar di jalan utama yang dapat membahayakan pengendara, terutama pada malam hari karena penerangan yang kurang memadai.",
        createdAt: Date.now() - 86400000 * 2, // 2 days ago
        location: {
            id: 1,
            reportId: 1,
            detailLocation: "Jl. Raya Pasar Minggu No. 15, Jakarta Selatan",
            latitude: -6.2828,
            longitude: 106.8286,
            displayName: "Jalan Raya Pasar Minggu",
            region: "Jakarta Selatan",
            state: "DKI Jakarta"
        },
        images: {
            id: 1,
            reportId: 1,
            image1URL: "https://images.unsplash.com/photo-1601629665203-f9f2b8d07019?ixlib=rb-4.0.3",
            image2URL: "https://images.unsplash.com/photo-1623177623442-949ee8d79b8e?ixlib=rb-4.0.3"
        }
    },
    {
        id: 2,
        userId: 2,
        user: {
            id: 2,
            fullName: "Siti Nurhayati",
            profileImage: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        reportTitle: "Pembuangan Sampah Liar di Kali Ciliwung",
        reportType: "environment",
        reportDescription: "Banyak warga yang membuang sampah di bantaran kali Ciliwung yang menyebabkan pencemaran air dan potensi banjir saat musim hujan.",
        createdAt: Date.now() - 86400000 * 5, // 5 days ago
        location: {
            id: 2,
            reportId: 2,
            detailLocation: "Bantaran Kali Ciliwung, Kampung Melayu, Jakarta Timur",
            latitude: -6.2214,
            longitude: 106.8845,
            displayName: "Kali Ciliwung",
            region: "Jakarta Timur",
            state: "DKI Jakarta"
        },
        images: {
            id: 2,
            reportId: 2,
            image1URL: "https://images.unsplash.com/photo-1591593443255-db4646e739f4?ixlib=rb-4.0.3",
            image2URL: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?ixlib=rb-4.0.3",
            image3URL: "https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?ixlib=rb-4.0.3"
        }
    },
    {
        id: 3,
        userId: 3,
        user: {
            id: 3,
            fullName: "Budi Santoso",
            profileImage: "https://randomuser.me/api/portraits/men/67.jpg"
        },
        reportTitle: "Lampu Penerangan Jalan Mati di Kompleks Perumahan",
        reportType: "safety",
        reportDescription: "Sejak seminggu yang lalu, lampu penerangan jalan di kompleks perumahan Harapan Indah sudah mati dan belum diperbaiki. Hal ini membuat area menjadi gelap dan tidak aman pada malam hari.",
        createdAt: Date.now() - 86400000 * 1, // 1 day ago
        location: {
            id: 3,
            reportId: 3,
            detailLocation: "Jl. Harapan Indah Blok A5, Bekasi",
            latitude: -6.1751,
            longitude: 106.9896,
            displayName: "Perumahan Harapan Indah",
            region: "Bekasi",
            state: "Jawa Barat"
        },
        images: {
            id: 3,
            reportId: 3,
            image1URL: "https://images.unsplash.com/photo-1576669801775-ff43c5ab079d?ixlib=rb-4.0.3"
        }
    },
    {
        id: 4,
        userId: 4,
        user: {
            id: 4,
            fullName: "Dewi Anggraini",
            profileImage: "https://randomuser.me/api/portraits/women/22.jpg"
        },
        reportTitle: "Kerusakan Pipa PDAM di Jalan Sudirman",
        reportType: "infrastructure",
        reportDescription: "Ada kebocoran pipa PDAM yang cukup besar di Jalan Sudirman, air terus mengalir dan menyebabkan genangan yang mengganggu lalu lintas.",
        createdAt: Date.now() - 86400000 * 3, // 3 days ago
        location: {
            id: 4,
            reportId: 4,
            detailLocation: "Jl. Jendral Sudirman No. 45, Jakarta Pusat",
            latitude: -6.2088,
            longitude: 106.8222,
            displayName: "Jalan Jendral Sudirman",
            region: "Jakarta Pusat",
            state: "DKI Jakarta"
        },
        images: {
            id: 4,
            reportId: 4,
            image1URL: "https://images.unsplash.com/photo-1584263347416-85a696b87e93?ixlib=rb-4.0.3",
            image2URL: "https://images.unsplash.com/photo-1588783952956-ffc61ce5189b?ixlib=rb-4.0.3"
        }
    }
];

const getReportTypeLabel = (type: ReportType): string => {
    const types = {
        infrastructure: 'Infrastruktur',
        environment: 'Lingkungan',
        safety: 'Keamanan',
        other: 'Lainnya'
    };
    return types[type] || 'Lainnya';
};

const getReportTypeColorClass = (type: ReportType): string => {
    const colors = {
        infrastructure: 'bg-blue-500',
        environment: 'bg-green-500',
        safety: 'bg-red-500',
        other: 'bg-purple-500'
    };
    return colors[type] || 'bg-gray-500';
};

const ReportsPage = () => {
    const currentPath = usePathname();
    const [reports] = useState<Report[]>(dummyReports);
    const [filteredReports, setFilteredReports] = useState<Report[]>(dummyReports);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<ReportType | "all">("all");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

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
        return [
            images.image1URL, 
            images.image2URL, 
            images.image3URL,
            images.image4URL,
            images.image5URL
        ].filter((url): url is string => typeof url === 'string');
    };

    const formatDate = (timestamp: number): string => {
        return format(new Date(timestamp), 'dd MMMM yyyy - HH:mm', { locale: id });
    };

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
            
            {/* Search and filter section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search input */}
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
                    
                    {/* Filter buttons */}
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
                                activeFilter === "infrastructure" 
                                    ? "bg-sky-100 text-sky-800 font-medium" 
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            onClick={() => setActiveFilter("infrastructure")}
                        >
                            Infrastruktur
                        </button>
                        <button 
                            className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                                activeFilter === "environment" 
                                    ? "bg-sky-100 text-sky-800 font-medium" 
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            onClick={() => setActiveFilter("environment")}
                        >
                            Lingkungan
                        </button>
                        <button 
                            className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                                activeFilter === "safety" 
                                    ? "bg-sky-100 text-sky-800 font-medium" 
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            onClick={() => setActiveFilter("safety")}
                        >
                            Keamanan
                        </button>
                        <button 
                            className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                                activeFilter === "other" 
                                    ? "bg-sky-100 text-sky-800 font-medium" 
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            onClick={() => setActiveFilter("other")}
                        >
                            Lainnya
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Reports list */}
            {filteredReports.length > 0 ? (
                <div className="space-y-6">
                    {filteredReports.map(report => (
                        <div key={report.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        {report.user.profileImage && (
                                            <div className="h-10 w-10 rounded-full overflow-hidden mr-3 border-2 border-white shadow">
                                                <Image 
                                                    src={report.user.profileImage} 
                                                    alt={report.user.fullName}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover h-full w-full"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-sky-900">{report.user.fullName}</div>
                                            <div className="text-xs text-gray-500 flex items-center">
                                                <FaCalendarAlt className="mr-1" size={12} />
                                                {formatDate(report.createdAt)}
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
                                
                                {/* Map preview */}
                                <div className="mb-4 h-[200px] w-full rounded-lg overflow-hidden">
                                    <DynamicMap 
                                        onMarkerPositionChange={() => {}}
                                        initialMarker={{
                                            lat: report.location.latitude,
                                            lng: report.location.longitude
                                        }}
                                        showLocationButton={false}
                                        scrollWheelZoom={false}
                                        height={200}
                                    />
                                </div>
                                
                                {/* Images preview */}
                                {getReportImages(report.images).length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Foto Permasalahan:</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                            {getReportImages(report.images).map((imageUrl, index) => (
                                                <div 
                                                    key={`${report.id}-image-${index}`}
                                                    className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border-2 border-white shadow"
                                                    onClick={() => handleImageClick(imageUrl)}
                                                >
                                                    <Image 
                                                        src={imageUrl}
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
            ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-12 text-center">
                    <div className="text-5xl text-gray-300 mb-4 flex justify-center">
                        <MdOutlineCategory />
                    </div>
                    <h3 className="text-xl font-medium text-gray-600 mb-2">Tidak ada laporan ditemukan</h3>
                    <p className="text-gray-500">Silahkan coba dengan kata kunci pencarian lain atau filter yang berbeda</p>
                </div>
            )}
            
            {/* Image preview modal */}
            <ImagePreviewModal
                imageUrl={previewImage}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default ReportsPage;