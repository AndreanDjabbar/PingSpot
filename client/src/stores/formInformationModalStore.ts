import { create } from 'zustand';

interface FormInformationModalState {
    isOpen: boolean;
    title?: string;
    description?: string;
    additionalInfo?: string;
    openFormInfo: (options: {
        title: string;
        description: string;
        additionalInfo?: string;
    }) => void;
    closeFormInfo: () => void;
}

export const useFormInformationModalStore = create<FormInformationModalState>((set) => ({
    isOpen: false,
    title: '',
    description: '',
    additionalInfo: undefined,
    openFormInfo: (options) => set({ ...options, isOpen: true }),
    closeFormInfo: () => set({ 
        isOpen: false, 
        title: '', 
        description: '', 
        additionalInfo: undefined 
    }),
}));
