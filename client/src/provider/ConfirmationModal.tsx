"use client";

import { useConfirmationModalStore } from "@/stores";
import { ConfirmationModal } from "@/components/feedback";

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