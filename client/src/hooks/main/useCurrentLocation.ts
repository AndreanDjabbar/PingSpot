import { useState, useCallback } from "react";
import { useLocationStore } from "@/stores/userLocationStore";
import getAuthToken from "@/utils/getAuthToken";
import getJWTExpired from "@/utils/getJWTExpired";
import { ICurrentLocation } from "@/types/model/user";

export const useCurrentLocation = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [permissionDenied, setPermissionDenied] = useState<string | null>(null);
    const [isUpdateRequest, setIsUpdateRequest] = useState<boolean>(false);
    const location = useLocationStore((state) => state.location);
    const setLocationStore = useLocationStore((state) => state.setLocation);

    const requestLocation = useCallback((isUpdate=false) => {
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
            const coords: ICurrentLocation = {
                lat: position.coords.latitude.toString(),
                lng: position.coords.longitude.toString(),
                lastUpdated: new Date().toLocaleString(),
            };
            
            const jwtToken = getAuthToken();
            let expiresAt: number | undefined;
            if (jwtToken) {
                expiresAt = getJWTExpired(jwtToken);
            } else {
                expiresAt = location?.expiresAt || (Date.now() + 5 * 60 * 1000);
            } 
            setLocationStore(coords, expiresAt);
            setIsUpdateRequest(isUpdate);
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
    }, [setLocationStore, location]);

    return {
        location,
        error,
        loading,
        permissionDenied,
        isError: error !== null,
        isPermissionDenied: permissionDenied !== null,
        requestLocation,
        isUpdateRequest,
    };
};
