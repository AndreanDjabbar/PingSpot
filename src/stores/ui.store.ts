import { create } from "zustand";
import { ReactNode } from "react";
import { OptionItem } from "@/types";

type ConfirmationModalType = "warning" | "info";
type FormInformationType = "info" | "warning";

interface ConfirmationModalState {
    isOpen: boolean;
    title?: string;
    message?: string;
    explanation?: string;
    type?: ConfirmationModalType;
    icon?: ReactNode;
    confirmTitle?: string;
    cancelTitle?: string;
    isPending?: boolean;
    onConfirm?: () => void;
    closeConfirm?: () => void;
    openConfirm: (
        options: Omit<ConfirmationModalState, "isOpen" | "openConfirm" | "closeConfirm">
    ) => void;
}

interface FormInformationModalState {
    isOpen: boolean;
    title?: string;
    type?: FormInformationType;
    description?: string;
    additionalInfo?: string;
    openFormInfo: (options: {
        title: string;
        type?: FormInformationType;
        description: string;
        additionalInfo?: string;
    }) => void;
    closeFormInfo: () => void;
}

interface ImagePreviewModalState {
    isOpen: boolean;
    imageUrl?: string;
    openImagePreview: (imageUrl: string) => void;
    closeImagePreview: () => void;
}

interface OptionsModalState {
    isOpen: boolean;
    optionsList?: OptionItem[];
    anchorRef?: React.RefObject<HTMLElement | null> | null;
    openOptionsModal: (options: {
        optionsList: OptionItem[];
        anchorRef?: React.RefObject<HTMLElement | null> | null;
    }) => void;
    closeOptionsModal: () => void;
}

export const useConfirmationModalStore = create<ConfirmationModalState>(
    (set) => ({
        isOpen: false,
        openConfirm: (options) => set({ ...options, isOpen: true }),
        closeConfirm: () => set({ isOpen: false }),
    })
);

export const useFormInformationModalStore = create<FormInformationModalState>(
    (set) => ({
        isOpen: false,
        title: "",
        type: "info",
        description: "",
        additionalInfo: undefined,

        openFormInfo: (options) =>
        set({ ...options, type: options.type || "info", isOpen: true }),

        closeFormInfo: () =>
        set({
            isOpen: false,
            title: "",
            type: "info",
            description: "",
            additionalInfo: undefined,
        }),
    })
);

export const useImagePreviewModalStore = create<ImagePreviewModalState>(
    (set) => ({
        isOpen: false,
        imageUrl: undefined,
        openImagePreview: (imageUrl) => set({ isOpen: true, imageUrl }),
        closeImagePreview: () => set({ isOpen: false, imageUrl: undefined }),
    })
);

export const useOptionsModalStore = create<OptionsModalState>((set) => ({
    isOpen: false,
    optionsList: undefined,
    anchorRef: null,

    openOptionsModal: ({ optionsList, anchorRef = null }) =>
        set({ isOpen: true, optionsList, anchorRef }),

    closeOptionsModal: () =>
        set({ isOpen: false, optionsList: undefined, anchorRef: null }),
}));