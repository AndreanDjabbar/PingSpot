/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useCurrentLocation, useErrorToast } from '@/hooks';
import { FaMapPin, FaSpinner, FaLocationArrow } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DynamicMapProps {
    onMarkerPositionChange?: (position: { lat: number, lng: number }) => void;
    onZoomChange?: (zoom: number) => void;
    height?: string | number;
    width?: string | number;
    defaultZoom?: number;
    defaultPosition?: [number, number];
    initialMarker?: { lat: number, lng: number } | null;
    popupContent?: React.ReactNode | ((position: { lat: number, lng: number }) => React.ReactNode);
    showLocationButton?: boolean;
    scrollWheelZoom?: boolean;
    className?: string;
    disabled?: boolean;
}

const MapUpdater = ({ 
    center, 
    shouldUpdate, 
    markerPosition, 
    onMapMoved,
    targetCenter
}: { 
    center: [number, number], 
    shouldUpdate: boolean, 
    markerPosition: { lat: number, lng: number } | null,
    onMapMoved: (isAwayFromMarker: boolean) => void,
    targetCenter: [number, number] | null
}) => {
    const map = useMap();
    
    useEffect(() => {
        if (shouldUpdate) {
            try {
                if (targetCenter) {
                    map.flyTo(targetCenter, map.getZoom(), { animate: true, duration: 0.6 });
                } else {
                    map.flyTo(center, map.getZoom(), { animate: true, duration: 0.6 });
                }
            } catch {
                map.setView(targetCenter || center, map.getZoom());
            }
        }
        map.invalidateSize();
    }, [center, map, shouldUpdate, targetCenter]);

    useEffect(() => {
        const checkMapPosition = () => {
            if (!markerPosition) return;
            
            const mapCenter = map.getCenter();
            const markerLatLng = L.latLng(markerPosition.lat, markerPosition.lng);
            const distance = mapCenter.distanceTo(markerLatLng);
            onMapMoved(distance > 50);
        };

        map.on('moveend', checkMapPosition);
        map.on('zoomend', checkMapPosition);

        checkMapPosition();

        return () => {
            map.off('moveend', checkMapPosition);
            map.off('zoomend', checkMapPosition);
        };
    }, [map, markerPosition, onMapMoved]);
    return null;
};

const MapEvents = ({ 
    onClick, 
    disabled,
    onZoomChange 
}: { 
    onClick: (position: { lat: number, lng: number }) => void, 
    disabled?: boolean,
    onZoomChange?: (zoom: number) => void
}) => {
    const map = useMapEvents({
        click: (e) => {
            if (disabled) return;
            onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
        zoomend: () => {
            if (onZoomChange) {
                onZoomChange(map.getZoom());
            }
        }
    });
    
    useEffect(() => {
        // Report initial zoom level
        if (onZoomChange) {
            onZoomChange(map.getZoom());
        }
    }, [map, onZoomChange]);
    
    return null;
};

const DynamicMap: React.FC<DynamicMapProps> = ({ 
    onMarkerPositionChange,
    onZoomChange,
    height = '400px',
    width = '100%',
    defaultZoom = 13,
    defaultPosition = [-6.2088, 106.8456],
    initialMarker = null,
    popupContent,
    showLocationButton = true,
    scrollWheelZoom = true,
    className = ''
    ,
    disabled = false
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const { location, requestLocation, loading, isPermissionDenied } = useCurrentLocation();
    const [markerPosition, setMarkerPosition] = useState<{ lat: number, lng: number } | null>(initialMarker);
    const [isMapMounted, setIsMapMounted] = useState(false);
    const [shouldUpdateView, setShouldUpdateView] = useState(false);
    const [isAwayFromMarker, setIsAwayFromMarker] = useState(false);
    const [targetCenter, setTargetCenter] = useState<[number, number] | null>(null);
    
    useEffect(() => {
        if (initialMarker) {
            setMarkerPosition(initialMarker);
            setTargetCenter([initialMarker.lat, initialMarker.lng]);
            setShouldUpdateView(true);
        }
    }, [initialMarker]);
    
    const initialCenter = initialMarker
        ? [initialMarker.lat, initialMarker.lng]
        : location
            ? [Number(location.lat), Number(location.lng)]
            : defaultPosition;

    const mapCenter = initialMarker
        ? [initialMarker.lat, initialMarker.lng]
        : location
            ? [Number(location.lat), Number(location.lng)]
            : defaultPosition;

    const customIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }), []);

    const mapKey = useMemo(() => {
        const locPart = location ? `loc-${location.lat}-${location.lng}` : 'no-loc';
        return `map-${locPart}`;
    }, [location]);

    const handleMapClick = useCallback((position: { lat: number, lng: number }) => {
        if (disabled) return;
        setMarkerPosition(position);
        if (onMarkerPositionChange) {
            onMarkerPositionChange(position);
        }
    }, [onMarkerPositionChange, disabled]);

    const handleDetectLocation = useCallback(() => {
        if (disabled) return;
        requestLocation(true);
    }, [disabled, requestLocation]);

    const setToCurrentLocation = useCallback(() => {
        if (disabled) return;
        if (location) {
            const position = { lat: Number(location.lat), lng: Number(location.lng) };
            setMarkerPosition(position);
            if (onMarkerPositionChange) {
                onMarkerPositionChange(position);
            }
            setShouldUpdateView(true);
        }
    }, [location, onMarkerPositionChange, disabled]);

    const goToMarker = useCallback(() => {
        if (markerPosition) {
            setTargetCenter([markerPosition.lat, markerPosition.lng]);
            setShouldUpdateView(true);
            setIsAwayFromMarker(false);
        }
    }, [markerPosition, disabled]);

    useEffect(() => {
        if (!shouldUpdateView && targetCenter) {
            const timer = setTimeout(() => {
                setTargetCenter(null);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [shouldUpdateView, targetCenter]);

    const handleMapMoved = useCallback((isAway: boolean) => {
        setIsAwayFromMarker(isAway);
    }, []);

    useEffect(() => {
        if (location && !markerPosition) {
            const position = { lat: Number(location.lat), lng: Number(location.lng) };
            setMarkerPosition(position);
            if (onMarkerPositionChange) {
                onMarkerPositionChange(position);
            }
            
            if (!isMapMounted) {
                setIsMapMounted(true);
            }
        }
    }, [location, markerPosition, onMarkerPositionChange, isMapMounted]);

    useEffect(() => {
        if (shouldUpdateView) {
            const timer = setTimeout(() => {
                setShouldUpdateView(false);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [shouldUpdateView]);

    useEffect(() => {
        if (mapRef.current) {
            setTimeout(() => {
                mapRef.current?.invalidateSize();
            }, 200);
        }
    }, [isMapMounted]);

    const isLocationDifferentFromMarker = useCallback(() => {
        if (!location || !markerPosition) return false;
        const epsilon = 0.0001;
        return Math.abs(Number(location.lat) - markerPosition.lat) > epsilon || Math.abs(Number(location.lng) - markerPosition.lng) > epsilon;
    }, [location, markerPosition]);

    const renderPopupContent = useCallback((pos: { lat: number, lng: number }) => {
        if (!popupContent) {
            return (
                <>
                    Lokasi laporan <br />
                    Lat: {pos.lat.toFixed(6)}, Lng: {pos.lng.toFixed(6)}
                </>
            );
        }
        
        if (typeof popupContent === 'function') {
            return popupContent(pos);
        }
        
        return popupContent;
    }, [popupContent]);

    const containerStyle = useMemo(() => ({
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        minHeight: '400px'
    }), [height, width]);
    
    useErrorToast(isPermissionDenied, 'Gagal mendeteksi lokasi Anda. Silahkan izinkan akses lokasi di pengaturan browser Anda.');

    return (
        <div className={`relative ${className}`} style={containerStyle}>
            <MapContainer 
                center={initialCenter as [number, number]}
                zoom={defaultZoom} 
                scrollWheelZoom={scrollWheelZoom}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
                key={mapKey}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapUpdater 
                    center={mapCenter as [number, number]} 
                    shouldUpdate={shouldUpdateView}
                    markerPosition={markerPosition}
                    onMapMoved={handleMapMoved}
                    targetCenter={targetCenter}
                />
                
                {markerPosition && (
                    <Marker 
                        position={[markerPosition.lat, markerPosition.lng]}
                        icon={customIcon}
                    >
                        <Popup>
                            {renderPopupContent(markerPosition)}
                        </Popup>
                    </Marker>
                )}
                
                <MapEvents 
                    onClick={handleMapClick} 
                    disabled={disabled}
                    onZoomChange={onZoomChange}
                />
            </MapContainer>
            
            <div className="absolute top-4 right-4 z-1000 flex flex-col gap-2">
                {showLocationButton && !disabled && (
                    <>
                        {location && isLocationDifferentFromMarker() && (
                            <button 
                                className="bg-sky-600 text-white hover:bg-sky-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-md"
                                onClick={setToCurrentLocation}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" /> 
                                        <span>Mencari lokasi...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaMapPin /> 
                                        <span>Gunakan Lokasi Saya</span>
                                    </>
                                )}
                            </button>
                        )}
                        {!location && (
                            <button 
                                className="bg-sky-700 text-white hover:bg-sky-800 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-md"
                                onClick={handleDetectLocation}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" /> 
                                        <span>Mencari lokasi...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaMapPin /> 
                                        <span>Deteksi Lokasi saya</span>
                                    </>
                                )}
                            </button>
                        )}
                    </>
                )}
                
                {markerPosition && isAwayFromMarker && (
                    <button 
                        className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-md"
                        onClick={goToMarker}
                    >
                        <FaLocationArrow /> 
                        <span>Kembali ke Marker</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default DynamicMap;