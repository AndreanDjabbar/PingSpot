import { ICurrentLocation } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LocationStore {
    location: ICurrentLocation | null;
    setLocation: (loc: ICurrentLocation) => void;
    clearLocation: () => void;
}

export const useLocationStore = create<LocationStore>()(
    persist(
        (set) => ({
        location: null,
        setLocation: (loc) => set({ location: loc }),
        clearLocation: () => set({ location: null }),
        }),
        {
        name: "location-store",
        storage: createJSONStorage(() => sessionStorage),
        }
    )
);