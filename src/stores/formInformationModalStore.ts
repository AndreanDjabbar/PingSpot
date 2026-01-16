import { create } from 'zustand';

interface FormInformationModalState {
    isOpen: boolean;
    title?: string;
    type?: 'info' | 'warning';
    description?: string;
    additionalInfo?: string;
    openFormInfo: (options: {
        title: string;
        type?: 'info' | 'warning';
        description: string;
        additionalInfo?: string;
    }) => void;
    closeFormInfo: () => void;
}

export const useFormInformationModalStore = create<FormInformationModalState>((set) => ({
    isOpen: false,
    title: '',
    type: 'info',
    description: '',
    additionalInfo: undefined,
    openFormInfo: (options) => set({ ...options, type: options.type || 'info', isOpen: true }),
    closeFormInfo: () => set({ 
        isOpen: false, 
        title: '',
        type: 'info', 
        description: '', 
        additionalInfo: undefined 
    }),
}));
