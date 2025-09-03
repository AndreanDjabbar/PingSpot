export type ISaveProfileFormType = {
    fullName: string;
    username: string;
    gender?: "male" | "female" | null;
    bio?: string;
    dob?: string | null;
    profilePicture?: File;
};