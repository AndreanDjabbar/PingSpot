// store/useUserStore.ts
import { create } from "zustand";
import getAuthToken from "@/utils/getAuthToken"
import { getMyProfileService } from "@/services/userService";
import { IUserProfile } from "@/types/model/user";

export interface UserProfileStore {
    userProfile: IUserProfile | null;
    loadUser: () => Promise<void>;
    clearUser: () => void;
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
            const profileData = await getMyProfileService();
            set({ userProfile:  profileData?.data});
        } catch {
            set({ userProfile: null });
        }
    },
    clearUser: () => set({ userProfile: null }),
}));
