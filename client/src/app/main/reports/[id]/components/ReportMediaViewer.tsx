"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaImage, FaMap } from 'react-icons/fa';
import { getImageURL } from '@/utils';
import { IReport } from '@/types/model/report';

const StaticMap = dynamic(() => import('../../../components/StaticMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[380px] bg-gray-200 animate-pulse rounded-xl"></div>
});

interface ReportMediaViewerProps {
    report: IReport;
    images: string[];
    onImageClick: (imageURL: string) => void;
}

export const ReportMediaViewer: React.FC<ReportMediaViewerProps> = ({ 
    report, 
    images, 
    onImageClick 
}) => {
    const [viewMode, setViewMode] = useState<'attachment' | 'map'>('map');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    return (
        <>
            {images.length > 0 && (
                <div className="px-6 pb-3">
                    <div className="flex items-center justify-center">
                        <div className="inline-flex items-center w-full max-w-md rounded-lg overflow-hidden shadow-sm">
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
                                onClick={() => onImageClick(images[currentImageIndex])}
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
                    <div className="relative z-0">
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
        </>
    );
};
