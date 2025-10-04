import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Location } from '@/types/entity/mainTypes';

type LocationStore = {
    location: (Location & { expiresAt?: number }) | null;
    setLocation: (loc: Location, ttl?: number) => void;
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
