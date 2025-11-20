import React from 'react';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { BiInfoCircle } from 'react-icons/bi';
import 'leaflet/dist/leaflet.css';

const DynamicMap = dynamic(() => import('../../../../../components/DynamicMap'), {
    ssr: false,
});

interface MapStepProps {
    onMarkerPositionChange: (position: { lat: number; lng: number } | null) => void;
    markerPosition: { lat: number; lng: number } | null;
    latitudeError?: string;
    longitudeError?: string;
    isDisabledStatus?: boolean;
    isResolvedStatus: boolean;
    onOpenInfo?: () => void;
}

const MapStep: React.FC<MapStepProps> = ({ 
    onMarkerPositionChange,
    markerPosition,
    latitudeError, 
    longitudeError,
    isDisabledStatus = false,
    isResolvedStatus,
    onOpenInfo
}) => {
    return (
        <div>
            <div className="w-full bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    {isDisabledStatus || isResolvedStatus ? (
                        <div className='flex items-center gap-2'>
                            Lokasi Laporan
                            <button
                                type="button"
                                onClick={onOpenInfo}
                                aria-label="Informasi sunting laporan"
                                title="Informasi sunting laporan"
                                className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded"
                            >
                                <BiInfoCircle className="w-5 h-5" aria-hidden="true" />
                                <span className="sr-only">Informasi status laporan</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <FaMapMarkerAlt className="mr-2 text-gray-700" />
                            Pilih Lokasi
                        </>
                    )}
                </h2>
                
                {isDisabledStatus || isResolvedStatus ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Peta di bawah adalah lokasi masalah (status laporan sudah tidak mendukung perubahan lokasi)
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-600 mb-4 text-sm">
                        Klik pada peta untuk menentukan lokasi masalah atau aktifkan lokasi otomatis
                    </p>
                )}
                
                <div className="h-[400px] w-full mb-4">
                    <DynamicMap 
                        onMarkerPositionChange={onMarkerPositionChange}
                        initialMarker={markerPosition}
                        disabled={isDisabledStatus || isResolvedStatus}
                    />
                </div>
            </div>
            <div className="text-red-500 text-sm font-semibold">
                {latitudeError || longitudeError}
            </div>
        </div>
    );
};

export default MapStep;
