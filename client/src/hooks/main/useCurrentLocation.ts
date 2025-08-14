import { useState, useCallback } from "react";
import { useLocationStore } from "@/stores/userLocationStore";
import getAuthToken from "@/utils/getAuthToken";
import { jwtDecode } from "jwt-decode";

type Location = {
    lat: number;
    lng: number;
    lastUpdated?: string;
};

export const useCurrentLocation = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [permissionDenied, setPermissionDenied] = useState<string | null>(null);

    const location = useLocationStore((state) => state.location);
    const setLocationStore = useLocationStore((state) => state.setLocation);

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
                lastUpdated: new Date().toLocaleString(),
            };

            const jwtToken = getAuthToken();
            let expiresAt: number | undefined;
            if (jwtToken) {
                const decodedJWT = jwtDecode<{ exp: number }>(jwtToken);
                expiresAt = decodedJWT.exp * 1000;
            }
            setLocationStore(coords, expiresAt);
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
    }, [setLocationStore]);

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
