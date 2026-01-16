import { create } from 'zustand';

interface ImagePreviewModalState {
    isOpen: boolean;
    imageUrl?: string;
    openImagePreview: (imageUrl: string) => void;
    closeImagePreview: () => void;
}

export const useImagePreviewModalStore = create<ImagePreviewModalState>((set) => ({
    isOpen: false,
    openImagePreview: (imageUrl) => set({ isOpen: true, imageUrl }),
    closeImagePreview: () => set({ isOpen: false, imageUrl: undefined }),
}));