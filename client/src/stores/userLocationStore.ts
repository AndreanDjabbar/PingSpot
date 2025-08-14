import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Location = {
    lat: number;
    lng: number;
    lastUpdated?: string;
    expiresAt?: number;
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
        setLocation: (loc, ttl = 5 * 60 * 1000) =>
            set({
            location: { ...loc, expiresAt: Date.now() + ttl }
            }),
        clearLocation: () => set({ location: null })
        }),
        { name: 'user_location' }
    )
);
