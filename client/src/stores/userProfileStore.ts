// store/useUserStore.ts
import { create } from "zustand";
import getAuthToken from "@/utils/getAuthToken";
import { jwtDecode } from "jwt-decode";

interface UserProfile {
    id: string;
    username: string;
    fullName: string;
    email: string;
}

interface UserProfileStore {
    userProfile: UserProfile | null;
    loadUser: () => Promise<void>;
    clearUser: () => void;
}

interface DecodedToken {
    email: string;
    full_name: string;
    user_id: string;
    username: string;
}

export const useUserProfileStore = create<UserProfileStore>((set) => ({
    userProfile: null,
    loadUser: async () => {
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                set({ userProfile: null });
                return;
            }
            const decoded: DecodedToken = jwtDecode(authToken);
            const user: UserProfile = {
                id: decoded.user_id,
                username: decoded.username,
                fullName: decoded.full_name,
                email: decoded.email,
            };
            set({ userProfile: user });
        } catch {
            set({ userProfile: null });
        }
    },
    clearUser: () => set({ userProfile: null }),
}));
