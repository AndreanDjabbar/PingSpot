export type ISaveProfileFormType = {
    fullName: string;
    username: string;
    gender?: "male" | "female" | null;
    bio?: string;
    birthday?: string | null;
    profilePicture?: File;
};

export type ISaveSecurityFormType = {
    newPassword: string;
    newPasswordConfirmation: string;
    currentPassword: string;
    currentPasswordConfirmation: string;
}