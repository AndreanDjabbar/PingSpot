// store/useUserStore.ts
import { create } from "zustand";
import getAuthToken from "@/utils/getAuthToken"
import { getMyProfileService } from "@/services/userService";
import { formattedDate } from "@/utils/getFormattedDate";

interface UserProfile {
    id: string;
    username: string;
    fullName: string;
    email: string;
    profilePicture?: string;
    gender?: string;
    bio?: string;
    age?: number;
    birthday? : string;
}

interface UserProfileStore {
    userProfile: UserProfile | null;
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
            const profile: UserProfile = {
                id: profileData.data.userID,
                username: profileData.data.username,
                fullName: profileData.data.fullname,
                email: profileData.data.email,
                gender: profileData.data.gender,
                bio: profileData.data.bio,
                birthday: formattedDate(profileData.data.birthday),
                age: profileData.data.age,
                profilePicture: profileData.data.profilePicture,
            }
            set({ userProfile:  profile});
        } catch {
            set({ userProfile: null });
        }
    },
    clearUser: () => set({ userProfile: null }),
}));
