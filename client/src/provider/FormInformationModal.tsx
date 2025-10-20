"use client";

import { useFormInformationModalStore } from "@/stores";
import { FormInformationModal } from "@/components/feedback";

export const FormInformationModalProvider = () => {
    const {
        isOpen,
        title,
        description,
        additionalInfo,
        closeFormInfo,
    } = useFormInformationModalStore();

    if (!isOpen) return null;

    return (
        <FormInformationModal
            isOpen={isOpen}
            onClose={closeFormInfo}
            title={title || ""}
            description={description || ""}
            additionalInfo={additionalInfo}
        />
    );
};
