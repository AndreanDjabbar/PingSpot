"use client";
import React, { useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { BiX } from 'react-icons/bi';
import { IoMdAddCircle } from 'react-icons/io';
import { FiMaximize2 } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { ImageItem } from '@/types/global/type';

interface MultipleImageFieldProps {
    id: string;
    name?: string;
    className?: string;
    withLabel?: boolean;
    labelTitle?: string;
    buttonTitle?: string;
    required?: boolean;
    maxImages?: number;
    images?: ImageItem[];
    // onChange2?: (files: File[]) => void;
    onChange?: (items: ImageItem[]) => void;
    onImageClick?: (imageUrl: string) => void;
    height?: number;
    width?: number;
    shape: 'circle' | 'square';
    disabled?: boolean;
}


const MultipleImageField: React.FC<MultipleImageFieldProps> = ({
    id,
    name,
    className = '',
    withLabel = true,
    labelTitle = 'Foto Permasalahan',
    buttonTitle = 'Pilih Foto',
    required = false,
    maxImages = 5,
    // onChange2,
    images = [],
    onChange,
    onImageClick,
    height = 180,
    width = 180,
    shape,
    disabled = false,
}) => {
    const availableSlots = Math.max(0, maxImages);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleImageClick = (imageUrl: string) => {
        if (onImageClick) {
            onImageClick(imageUrl);
        }
    };

    const handleAddClick = () => {
        if (!disabled && (images?.length || 0) < availableSlots) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (images?.length || 0) < availableSlots) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                const newImage: ImageItem = {
                    file,
                    preview: result
                };
                
                const updatedImages = [...(images || []), newImage];

                // if (onChange) {
                //     onChange(updatedImages.map(img => img.file).filter(Boolean) as File[]);
                // }
                if (onChange) {
                    onChange(updatedImages);
                }
            };
            reader.readAsDataURL(file);
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        if (disabled) return;
        const updatedImages = (images || []).filter((_, i) => i !== index);
        // if (onChange) {
        //     onChange(updatedImages.map(img => img.file).filter(Boolean) as File[]);
        // }
        if (onChange) {
            onChange(updatedImages);
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {withLabel && (
                <label htmlFor={id} className="block text-md font-semibold text-gray-900">
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
                            {!disabled && (
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
                            )}
                        </div>
                    ))}
                    
                    {images.length < availableSlots && (
                        <div
                            onClick={handleAddClick}
                            style={{height: `${height}px`, width: `${width}px`}}
                            className={cn("relative flex flex-col items-center justify-center border-2 border-dashed transition-colors", 
                                shape === 'circle' ? 'rounded-full' : 'rounded-md',
                                disabled ? 'bg-gray-200 border-gray-200 cursor-not-allowed' : 'bg-gray-100 border-gray-300 cursor-pointer hover:bg-gray-200'
                            )}
                        >
                            <IoMdAddCircle size={40} className={disabled ? "text-gray-300 mb-2" : "text-gray-400 mb-2"} />
                            <p className={cn("text-xs text-center px-2", disabled ? "text-gray-400" : "text-gray-500")}>
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
                            disabled={disabled}
                            className={cn("px-4 py-2 rounded-lg transition-colors text-md hover:cursor-pointer",
                                disabled ? "bg-gray-400 cursor-not-allowed" : "bg-sky-700 text-white hover:bg-sky-800"
                            )}
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
                    required={required && (images.length) === 0}
                    disabled={disabled}
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