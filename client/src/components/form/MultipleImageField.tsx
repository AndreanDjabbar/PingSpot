"use client";
import React, { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { BiX } from 'react-icons/bi';
import { IoMdAddCircle } from 'react-icons/io';
import { FiMaximize2 } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface MultipleImageFieldProps {
    id: string;
    name?: string;
    className?: string;
    withLabel?: boolean;
    labelTitle?: string;
    buttonTitle?: string;
    required?: boolean;
    maxImages?: number;
    onChange?: (files: File[]) => void;
    onImageClick?: (imageUrl: string) => void;
    height?: number;
    width?: number;
    shape: 'circle' | 'square';
}

export type ImageItem = {
    file: File;
    preview: string;
};

const MultipleImageField: React.FC<MultipleImageFieldProps> = ({
    id,
    name,
    className = '',
    withLabel = true,
    labelTitle = 'Foto Permasalahan',
    buttonTitle = 'Pilih Foto',
    required = false,
    maxImages = 5,
    onChange,
    onImageClick,
    height = 180,
    width = 180,
    shape
}) => {
    const [images, setImages] = useState<ImageItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleImageClick = (imageUrl: string) => {
        if (onImageClick) {
            onImageClick(imageUrl);
        }
    };

    const handleAddClick = () => {
        if (images.length < maxImages) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && images.length < maxImages) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                const newImage: ImageItem = {
                    file,
                    preview: result
                };
                
                const updatedImages = [...images, newImage];
                setImages(updatedImages);
                
                if (onChange) {
                    onChange(updatedImages.map(img => img.file));
                }
            };
            reader.readAsDataURL(file);
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        
        if (onChange) {
            onChange(updatedImages.map(img => img.file));
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {withLabel && (
                <label htmlFor={id} className="block text-md font-medium text-sky-800">
                    {labelTitle} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <div className="flex flex-col space-y-4">
                <div className="flex flex-wrap gap-4 justify-center">
                    {images.map((image, index) => (
                        <div key={index} className="relative">
                            <div
                                style={{height: `${height}px`, width: `${width}px`}}
                                className={cn("relative overflow-hidden bg-gray-200 border-4 border-white shadow-lg cursor-pointer group", 
                                    shape === 'circle' ? 'rounded-full' : 'rounded-md')}
                                onClick={() => handleImageClick(image.preview)}
                            >
                                <Image
                                    src={image.preview}
                                    alt={`Image ${index + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <FiMaximize2 size={24} className="text-white" />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(index);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                            >
                                <BiX size={14} />
                            </button>
                        </div>
                    ))}
                    
                    {images.length < maxImages && (
                        <div
                            onClick={handleAddClick}
                            style={{height: `${height}px`, width: `${width}px`}}
                            className={cn("relative flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors", 
                                shape === 'circle' ? 'rounded-full' : 'rounded-md')}
                        >
                            <IoMdAddCircle size={40} className="text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 text-center px-2">
                                Tambah Foto <br /> ({images.length}/{maxImages})
                            </p>
                        </div>
                    )}
                </div>
                
                {images.length === 0 && (
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleAddClick}
                            className="px-4 py-2 bg-sky-800 text-white rounded-lg hover:bg-sky-900 transition-colors text-md"
                        >
                            {buttonTitle}
                        </button>
                    </div>
                )}
                
                <input
                    ref={fileInputRef}
                    id={id}
                    name={name}
                    type="file"
                    accept="image/*"
                    required={required && images.length === 0}
                    className="hidden"
                    onChange={handleFileChange}
                />
                <p className="text-xs text-center text-gray-500">
                    Format: JPG, PNG, GIF (Maks. 5 MB) - Maksimal {maxImages} foto
                </p>
            </div>
        </div>
    );
};

export default MultipleImageField;