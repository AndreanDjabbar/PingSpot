import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import getJWTExpired from '@/utils/getJWTExpired';

type GlobalState = {
    currentPage: string;
    setCurrentPage: (currentPage: string) => void;
    getCurrentPage: () => string | null;
    clearGlobalData: () => void;
    expiredAt?: number;
};

export const useGlobalStore = create<GlobalState>()(
    persist(
        (set, get) => ({
        currentPage: "home",
        expiredAt: getJWTExpired() || (Date.now() + 5 * 60 * 1000),
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
