import { useEffect, useState, useCallback } from "react";

type Location = {
    lat: number;
    lng: number;
    lastUpdated?: string;
};

export const useCurrentLocation = () => {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [permissionDenied, setPermissionDenied] = useState<string | null>(null);

    const requestLocation = useCallback(() => {
        setLoading(true);
        setError(null);
        setPermissionDenied(null);

        if (!navigator.geolocation) {
            setError("Geolocation tidak didukung di browser ini.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
        (position) => {
            const coords: Location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                lastUpdated: new Date().toLocaleString()
            };
            setLocation(coords);
            localStorage.setItem("current_location", JSON.stringify(coords));
            setLoading(false);
        },
        (err) => {
            if (err.code === err.PERMISSION_DENIED) {
            setPermissionDenied(
                "Akses lokasi ditolak. Silahkan izinkan akses lokasi di pengaturan browser Anda."
            );
            } else {
            setError(err.message);
            }
            setLoading(false);
        }
        );
    }, []);

    useEffect(() => {
        const savedLocation = localStorage.getItem("current_location");
        if (savedLocation) {
            setLocation(JSON.parse(savedLocation));
        }
    }, []);

    return {
        location,
        error,
        loading,
        permissionDenied,
        isError: error !== null,
        isPermissionDenied: permissionDenied !== null,
        requestLocation,
    };
};
