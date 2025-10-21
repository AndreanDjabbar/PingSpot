import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ICurrentLocation } from '@/types/model/user';

type LocationStore = {
    location: (ICurrentLocation & { expiresAt?: number }) | null;
    setLocation: (loc: ICurrentLocation, ttl?: number) => void;
    clearLocation: () => void;
};

export const useLocationStore = create<LocationStore>()(
    persist(
        (set) => ({
            location: null,
            setLocation: (loc, ttl = 5 * 60 * 1000) => {
                const expiresAt = ttl;
                set({ location: { ...loc, expiresAt } });
            },
            clearLocation: () => set({ location: null }),
        }),
        { name: 'user_location' }
    )
);
