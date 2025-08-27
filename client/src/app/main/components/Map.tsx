/* eslint-disable react/no-unescaped-entities */
import ErrorSection from '@/components/UI/ErrorSection'
import { useCurrentLocation } from '@/hooks/main/useCurrentLocation'
import useErrorToast from '@/hooks/useErrorToast'
import { getErrorResponseDetails, getErrorResponseMessage } from '@/utils/gerErrorResponse'
import React, { useEffect, useMemo } from 'react'
import { useReverseCurrentLocation } from '@/hooks/main/useReverseCurrentLocation'
import { FaMap, FaMapPin, FaSpinner } from 'react-icons/fa'
import { getDataResponseDetails } from '@/utils/getDataResponse'
import { useLocationStore } from '@/stores/userLocationStore'
import camelize from 'camelize';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';

interface ReverseLocationResponse {
    display_name?: string;
    address?: {
        tourism?: string;
        road?: string;
        residential?: string;
        hamlet?: string;
        city?: string;
        [key: string]: string | undefined;
    };
}

const Map = () => {
    const { mutate: reverseLocation, data, isPending: reverseLoading } = useReverseCurrentLocation();
    const { location, isError, error, loading, permissionDenied, isPermissionDenied, requestLocation, isUpdateRequest } = useCurrentLocation();
    const setLocationStore = useLocationStore((state) => state.setLocation);
    const clearLocationStore = useLocationStore((state) => state.clearLocation);
    
    useErrorToast(isError, error);
    useErrorToast(isPermissionDenied, permissionDenied);

    const customIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }), []);

    const mapCenter = useMemo(() => {
        if (!location) return [0, 0];
        return [Number(location.lat), Number(location.lng)];
    }, [location?.lat, location?.lng]);

    const mapKey = location 
    ? `${location.lat}-${location.lng}`
    : 'no-location';
    
    useEffect(() => {
        if (location && location.expiresAt) {
            const now = Date.now()
            const isExpired = now > location.expiresAt;
            if (isExpired) {
                clearLocationStore();
            }
        }
    }, []);

    useEffect(() => {
        if (location) {
            if (!location.displayName || !location.address || isUpdateRequest) {
                reverseLocation({
                    latitude: location.lat,
                    longitude: location.lng
                });
            }
        }
    }, [location?.lat, location?.lng, location?.lastUpdated, reverseLocation, isUpdateRequest]);

    useEffect(() => {
        if (data) {
            const locationData = camelize(getDataResponseDetails(data));
            setLocationStore({
                ...location,
                lat: location?.lat ?? "",
                lng: location?.lng ?? "",
                lastUpdated: location?.lastUpdated || new Date().toLocaleString(),
                displayName: locationData.displayName || locationData.display_name,
                address: locationData.address || null,
                type: locationData.type || null,
                name: locationData.name || null,
                osmType: locationData.osmType || null,
                osmId: locationData.osmId || null,
            }, location?.expiresAt);
        }
    }, [data, setLocationStore]);

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg p-6 flex flex-col gap-6">
            <div>
                {isPermissionDenied && (
                    <ErrorSection 
                        message={getErrorResponseMessage(permissionDenied)} 
                        errors={getErrorResponseDetails(permissionDenied)}
                    />
                )}
            </div>
            <div className='flex w-full justify-between items-start'>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <FaMap className="w-6 h-6 text-sky-800 mr-2" />
                    Peta
                </h2>
                <div className="flex flex-col items-end">
                    {!location &&  <>
                        <button
                            className="bg-sky-600 text-white hover:bg-sky-700 px-6 py-2 rounded-lg transition-colors"
                            disabled={loading}
                            onClick={() => requestLocation(false)}
                        >
                            {loading ? (
                                <div className='flex items-center gap-2'>
                                    <FaSpinner className='animate-spin'/> 
                                    Meminta Lokasi...
                                </div>
                            )
                            : (
                                "Izin akses lokasi"
                            )}
                        </button>
                    </>}
                    {location && (
                        <div className='flex flex-col items-center gap-2'>
                            <button 
                                className="bg-sky-800 flex items-center px-6 py-2 gap-2 text-white rounded-lg hover:bg-sky-900 transition-colors"
                                onClick={() => requestLocation(true)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="w-4 h-4 animate-spin" />
                                        <span className="text-sm font-medium">Memperbarui...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaMapPin className="w-4 h-4" />
                                        <span className="text-sm font-medium">Perbarui Lokasi</span>
                                    </>
                                )}
                            </button>
                            <p className='text-xs text-gray-500'>Diperbarui: {location.lastUpdated}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-gradient-to-br from-sky-100 to-indigo-100 rounded-lg p-8 text-center border-2 border-dashed border-sky-200">
                <div className='h-96 w-full'>
                    {location ? (
                        <MapContainer 
                            center={mapCenter as [number, number]} 
                            zoom={13} 
                            scrollWheelZoom={false}
                            style={{ height: '100%', width: '100%' }}
                            key={mapKey}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker 
                            position={[Number(location.lat), Number(location.lng)]}
                            icon={customIcon}
                            >
                                <Popup>
                                    Lokasi Anda <br /> {location.displayName || 'Lokasi saat ini'}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <FaMapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p>Lokasi belum tersedia</p>
                                <p className="text-sm">Klik "Izin akses lokasi" untuk menampilkan peta</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {location && (
                <div className='bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3'>
                    {reverseLoading ? (
                        <div className="flex items-center justify-center space-x-2 text-gray-600">
                            <FaSpinner className="w-3 h-3 animate-spin" />
                            <span className="text-xs">Mencari alamat...</span>
                        </div>
                    ) : data || location.displayName || location.address ? (
                        <div className="text-xs text-green-600 flex flex-col gap-2">
                            <p className="flex items-center gap-1 p-1 text-green-700 font-semibold">
                            <FaMapPin className="text-red-500" />
                            Lokasi Anda:
                            </p>
                            <div className="">
                                {(data as ReverseLocationResponse)?.display_name || location.displayName || 'Alamat tidak ditemukan'}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-green-600">
                            <div>Lat: {location?.lat || ""}</div>
                            <div>Lng: {location?.lng || ""}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Map