// store/useUserStore.ts
import { create } from "zustand";
import getAuthToken from "@/utils/getAuthToken";
import { jwtDecode } from "jwt-decode";

interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
}

interface UserStore {
    user: User | null;
    loadUser: () => Promise<void>;
    clearUser: () => void;
}

interface DecodedToken {
    email: string;
    full_name: string;
    user_id: string;
    username: string;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,

    loadUser: async () => {
        try {
        const authToken = getAuthToken();
        if (!authToken) {
            set({ user: null });
            return;
        }

        const decoded: DecodedToken = jwtDecode(authToken);
        const user: User = {
            id: decoded.user_id,
            username: decoded.username,
            fullName: decoded.full_name,
            email: decoded.email,
        };
        set({ user });
        } catch {
        set({ user: null });
        }
    },

    clearUser: () => set({ user: null }),
}));
