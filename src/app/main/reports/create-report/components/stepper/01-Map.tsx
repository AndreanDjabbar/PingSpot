import React from 'react';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

const DynamicMap = dynamic(() => import('../../../../components/DynamicMap'), {
    ssr: false,
});

interface MapStepProps {
    onMarkerPositionChange: (position: { lat: number; lng: number } | null) => void;
    onZoomLevelChange: (zoom: number) => void;
    defaultZoom?: number;
    markerPosition?: { lat: number; lng: number } | null;
    latitudeError?: string;
    longitudeError?: string;
}

const MapStep: React.FC<MapStepProps> = ({ 
    onMarkerPositionChange, 
    markerPosition,
    latitudeError, 
    defaultZoom,
    onZoomLevelChange,
    longitudeError 
}) => {
    const handleZoomChange = (newZoom: number) => {
        onZoomLevelChange(newZoom);
    }

    return (
        <div>
            <div className="w-full bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-700" />
                    Pilih Lokasi
                </h2>
                <p className="text-gray-600 mb-4 text-sm">
                    Klik pada peta untuk menentukan lokasi masalah atau aktifkan lokasi otomatis
                </p>
                <div className="h-[400px] w-full mb-4">
                    <DynamicMap 
                    onMarkerPositionChange={onMarkerPositionChange}
                    defaultZoom={defaultZoom}
                    onZoomChange={handleZoomChange}
                    initialMarker={markerPosition}
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
