"use client";

import { 
    useConfirmationModalStore,
    useFormInformationModalStore,
    useImagePreviewModalStore 
} from "@/stores";
import { 
    ConfirmationModal,
    FormInformationModal,
    ImagePreviewModal 
} from "@/components";

export const ConfirmationModalProvider = () => {
    const {
        isOpen,
        title,
        message,
        explanation,
        type,
        icon,
        confirmTitle,
        cancelTitle,
        isPending,
        onConfirm,
        closeConfirm,
    } = useConfirmationModalStore();

    if (!isOpen) return null;

    return (
        <ConfirmationModal
        isOpen={isOpen}
        onClose={closeConfirm ?? (() => {})}
        onConfirm={() => {
            onConfirm?.();
            closeConfirm?.();
        }}
        isPending={isPending || false}
        type={type || "info"}
        title={title || ""}
        message={message || ""}
        explanation={explanation}
        icon={icon || null}
        confirmTitle={confirmTitle}
        cancelTitle={cancelTitle}
        />
    );
};

export const FormInformationModalProvider = () => {
    const {
        isOpen,
        title,
        type,
        description,
        additionalInfo,
        closeFormInfo,
    } = useFormInformationModalStore();

    if (!isOpen) return null;

    return (
        <FormInformationModal
            isOpen={isOpen}
            type={type || "info"}
            onClose={closeFormInfo}
            title={title || ""}
            description={description || ""}
            additionalInfo={additionalInfo}
        />
    );
};

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