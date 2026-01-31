"use client";

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StaticMapProps {
    latitude: number;
    longitude: number;
    height?: string | number;
    width?: string | number;
    zoom?: number;
    markerColor?: string;
    popupText?: string;
    className?: string;
}

const StaticMap: React.FC<StaticMapProps> = ({
    latitude,
    longitude,
    height = '200px',
    width = '100%',
    markerColor = 'blue',
    zoom = 15,
    popupText = 'Lokasi',
    className = ''
}) => {
    const customIcon = useMemo(() => {
    if (markerColor === "red") {
        return new L.Icon({
        iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        });
    }

    return new L.Icon({
        iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
    }, [markerColor]);


    const mapKey = `map-${latitude}-${longitude}`;

    const containerStyle = {
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
    };

    return (
        <div className={`relative overflow-hidden rounded-lg ${className}`} style={containerStyle}>
            <MapContainer 
                center={[latitude, longitude]} 
                zoom={zoom} 
                scrollWheelZoom={false}
                zoomControl={true}
                attributionControl={false}
                dragging={true}
                doubleClickZoom={false}
                style={{ height: '100%', width: '100%' }}
                key={mapKey}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker 
                    position={[latitude, longitude]}
                    icon={customIcon}
                >
                    <Popup>
                        {popupText}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default StaticMap;