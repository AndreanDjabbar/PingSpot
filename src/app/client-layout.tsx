"use client";

import { useEffect } from "react";
import { useGlobalStore, useLocationStore } from "@/stores";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
    const globalStore = useGlobalStore();
    const locationStore = useLocationStore();

    useEffect(() => {
        const now = Date.now();
        if (globalStore.expiredAt && now > globalStore.expiredAt) {
        globalStore.clearGlobalData();
        }

        if (locationStore.location?.expiresAt && now > locationStore.location.expiresAt) {
        locationStore.clearLocation();
        }
    }, []);

    return <>{children}</>;
};

export default ClientLayout;