"use client";

import { useFormInformationModalStore } from "@/stores";
import { FormInformationModal } from "@/components/feedback";

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
