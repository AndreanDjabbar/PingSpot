import { create } from 'zustand';
import type { ReactNode } from 'react';

export interface OptionItem {
    label: string;
    icon?: ReactNode;
    description?: string;
    onClick: () => void;
}

interface OptionsModalState {
    isOpen: boolean;
    optionsList?: OptionItem[];
    anchorRef?: React.RefObject<HTMLElement | null> | null;
    openOptionsModal: (options: { optionsList: OptionItem[]; anchorRef?: React.RefObject<HTMLElement | null> | null }) => void;
    closeOptionsModal: () => void;
}

export const useOptionsModalStore = create<OptionsModalState>((set) => ({
    isOpen: false,
    optionsList: undefined,
    anchorRef: null,
    openOptionsModal: ({ optionsList, anchorRef = null }) => set({ isOpen: true, optionsList, anchorRef }),
    closeOptionsModal: () => set({ isOpen: false, optionsList: undefined, anchorRef: null }),
}));
