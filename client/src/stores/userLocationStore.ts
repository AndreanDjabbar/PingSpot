import { create } from 'zustand';
import { ICurrentLocation } from '@/types/model/user';

type LocationStore = {
    location: ICurrentLocation | null;
    setLocation: (loc: ICurrentLocation) => void;
    clearLocation: () => void;
};

export const useLocationStore = create<LocationStore>((set) => ({
    location: null,
    setLocation: (loc) => set({ location: loc }),
    clearLocation: () => set({ location: null }),
}));
