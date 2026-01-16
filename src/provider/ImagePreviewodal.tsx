"use client";

import { ImagePreviewModal } from "@/components/feedback";
import { useImagePreviewModalStore } from "@/stores";

export const ImagePreviewModalProvider = () => {
    const { isOpen, imageUrl, closeImagePreview } = useImagePreviewModalStore();

    if (!isOpen) return null;

    return (
        <ImagePreviewModal
        isOpen={isOpen}
        imageUrl={imageUrl || ""}
        onClose={closeImagePreview}
        />
    )
}