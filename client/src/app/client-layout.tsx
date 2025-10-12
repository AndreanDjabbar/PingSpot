"use client";

import { useEffect } from "react";
import { useUserProfileStore, useGlobalStore, useLocationStore } from "@/stores";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
    const loadUser = useUserProfileStore((state) => state.loadUser);
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

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return <>{children}</>;
};

export default ClientLayout;