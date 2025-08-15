import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Location = {
    lat: string;
    lng: string;
    lastUpdated?: string;
    expiresAt?: number;
    displayName?: string;
    address?: object | null;
    type?: string;
    name?: string;
    osmType?: string;
    osmId?: string;
};

type LocationState = {
    location: Location | null;
    setLocation: (loc: Location, ttl?: number) => void;
    clearLocation: () => void;
};

export const useLocationStore = create<LocationState>()(
    persist(
        (set) => ({
        location: null,
        setLocation: (loc, expiresAt?: number, ttl = 5 * 60 * 1000) => {
            const jwtExpired = expiresAt ?? (ttl + Date.now())
            set({
                location: { ...loc, expiresAt: jwtExpired }
            })
        },
        clearLocation: () => set({ location: null })
        }),
        { name: 'user_location' }
    )
);
