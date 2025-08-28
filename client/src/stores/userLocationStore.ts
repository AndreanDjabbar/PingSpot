import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ILocation } from '@/types/mainTypes';

type LocationState = {
    location: (ILocation & { expiresAt?: number }) | null;
    setLocation: (loc: ILocation, ttl?: number) => void;
    clearLocation: () => void;
};

export const useLocationStore = create<LocationState>()(
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
