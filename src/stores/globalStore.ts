import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type GlobalState = {
    currentPage: string;
    setCurrentPage: (currentPage: string) => void;
    clearGlobalData: () => void;
    expiredAt?: number;
};

export const useGlobalStore = create<GlobalState>()(
    persist(
        (set, get) => ({
        currentPage: "home",
        expiredAt: Date.now() + 5 * 60 * 1000,
        setCurrentPage: (currentPage) => {
            set({ currentPage: currentPage });
        },
        clearGlobalData: () => set({ 
            currentPage: "home"
        }),
        getCurrentPage: () => {
            const currentPage = get().currentPage;
            if (!currentPage) return null;
            if ((get().expiredAt ?? 0) < Date.now()) {
                set({ 
                    currentPage: "home"
                });
                return null;
            }
            return currentPage;
        },
        }),
        { name: 'global_data' }
    )
);
