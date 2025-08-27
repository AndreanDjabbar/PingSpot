import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ILocation } from '@/types/mainTypes';

type LocationState = {
    location: (ILocation & { expiresAt?: number }) | null;
    setLocation: (loc: ILocation, ttl?: number) => void;
    clearLocation: () => void;
    getLocation: () => ILocation | null;
};

export const useLocationStore = create<LocationState>()(
    persist(
        (set, get) => ({
        location: null,
        setLocation: (loc, ttl = 5 * 60 * 1000) => {
            const expiresAt = ttl;
            set({ location: { ...loc, expiresAt } });
        },
        clearLocation: () => set({ location: null }),
        getLocation: () => {
            const loc = get().location;
            if (!loc) return null;
            if (loc.expiresAt && loc.expiresAt < Date.now()) {
            set({ location: null });
            return null;
            }
            return loc;
        },
        }),
        { name: 'user_location' }
    )
);
