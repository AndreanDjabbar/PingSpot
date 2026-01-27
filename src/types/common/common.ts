import { ReactNode } from "react";

export interface ImageItem {
    file: File;
    preview: string;
    isExisting?: boolean;
    existingUrl?: string;
};

export interface OptionItem {
    label: string;
    icon?: ReactNode;
    description?: string;
    onClick: () => void;
}