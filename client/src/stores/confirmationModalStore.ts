import { create } from 'zustand';
import { ReactNode } from "react";

type ConfirmationModalType = "warning" | "info";

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
    openConfirm: (options: Omit<ConfirmationModalState, "isOpen" | "openConfirm">) => void;
    closeConfirm?: () => void;
}

export const useConfirmationModalStore = create<ConfirmationModalState>((set) => ({
    isOpen: false,
    openConfirm: (options) => set({ ...options, isOpen: true }),
    closeConfirm: () => set({ isOpen: false }),
}));