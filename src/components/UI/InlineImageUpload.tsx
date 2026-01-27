"use client";

import React, { useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { IoMdImages } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
import { Button } from '@/components/UI';
import { useToast } from '@/hooks/toast';

interface InlineImageUploadProps {
    preview: string | null;
    onImageSelect: (file: File) => void;
    onImageRemove: () => void;
    maxSizeMB?: number;
    buttonSize?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    buttonClassName?: string;
    previewClassName?: string;
    previewPosition?: 'top' | 'bottom' | 'inline' | 'separate';
    showPreview?: boolean;
}

interface ImagePreviewProps {
    preview: string | null;
    onRemove: () => void;
    className?: string;
}

const InlineImageUpload: React.FC<InlineImageUploadProps> = ({
    preview,
    onImageSelect,
    onImageRemove,
    maxSizeMB = 3,
    buttonSize = 'md',
    disabled = false,
    buttonClassName = '',
    previewClassName = '',
    previewPosition = 'top',
    showPreview = true
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toastError } = useToast();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toastError('Pilih file gambar (JPG, PNG, GIF)');
            return;
        }

        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            toastError(`Ukuran gambar maksimal ${maxSizeMB}MB`);
            return;
        }

        onImageSelect(file);
    };

    const handleButtonClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onImageRemove();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const renderPreview = () => {
        if (!preview || !showPreview) return null;
        return (
            <div className={`relative inline-block ${previewClassName}`}>
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                    <Image
                        src={preview}
                        alt="Pratinjau gambar"
                        width={200}
                        height={150}
                        className="object-cover max-h-40"
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow-lg"
                        type="button"
                        aria-label="Hapus gambar"
                    >
                        <MdClose size={18} />
                    </button>
                </div>
            </div>
        );
    };

    const renderButton = () => (
        <>
            <Button
                onClick={handleButtonClick}
                variant="secondary"
                size={buttonSize}
                type="button"
                disabled={disabled}
                className={`flex-shrink-0 ${buttonClassName}`}
                aria-label="Unggah gambar"
            >
                <IoMdImages size={20} />
            </Button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />
        </>
    );

    if (previewPosition === 'inline') {
        return (
            <div className="flex items-center gap-2">
                {renderButton()}
                {renderPreview()}
            </div>
        );
    }

    if (previewPosition === 'bottom') {
        return (
            <>
                {renderButton()}
                {preview && showPreview && <div className="mt-3">{renderPreview()}</div>}
            </>
        );
    }

    if (previewPosition === 'separate') {
        return renderButton();
    }

    return (
        <>
            {preview && showPreview && <div className="mb-3">{renderPreview()}</div>}
            {renderButton()}
        </>
    );
};

export const ImagePreview: React.FC<ImagePreviewProps> = ({ preview, onRemove, className = '' }) => {
    if (!preview) return null;

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove();
    };

    return (
        <div className={`relative inline-block ${className}`}>
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                <Image
                    src={preview}
                    alt="Pratinjau gambar"
                    width={200}
                    height={150}
                    className="object-cover max-h-40"
                />
                <button
                    onClick={handleRemove}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow-lg"
                    type="button"
                    aria-label="Hapus gambar"
                >
                    <MdClose size={18} />
                </button>
            </div>
        </div>
    );
};

export default InlineImageUpload;
