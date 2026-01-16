import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ICurrentLocation } from '@/types/model/user';

type LocationStore = {
    location: ICurrentLocation | null;
    setLocation: (loc: ICurrentLocation) => void;
    clearLocation: () => void;
};

export const useLocationStore = create<LocationStore>()(
    persist(
        (set) => ({
            location: null,
            setLocation: (loc) => set({ location: loc }),
            clearLocation: () => set({ location: null }),
        }),
        {
            name: 'location-store',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
