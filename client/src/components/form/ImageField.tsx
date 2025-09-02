"use client";
import React, { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { FaCamera } from 'react-icons/fa';
import { cn } from '@/lib/utils';

interface ImageFieldProps {
    id: string;
    name?: string;
    className?: string;
    withLabel?: boolean;
    labelTitle?: string;
    buttonTitle?: string;
    required?: boolean;
    currentAvatar?: string;
    onChange?: (file: File | null) => void;
    height?: number;
    width?: number;
    shape: 'circle' | 'square';
}

const ImageField: React.FC<ImageFieldProps> = ({
    id,
    name,
    className = '',
    withLabel = true,
    labelTitle = 'Foto Profil',
    buttonTitle = 'Pilih Foto',
    required = false,
    currentAvatar,
    onChange,
    height=44,
    width=44,
    shape
}) => {
    const [avatar, setAvatar] = useState<string | null>(currentAvatar || null);
    const [isHovering, setIsHovering] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setAvatar(result);
        };
        reader.readAsDataURL(file);

        if (onChange) {
            onChange(file);
        }
        }
    };

    const handleRemoveAvatar = () => {
        setAvatar(null);
        if (fileInputRef.current) {
        fileInputRef.current.value = '';
        }
        if (onChange) {
        onChange(null);
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {withLabel && (
                <label htmlFor={id} className="block text-md font-medium text-center text-sky-800">
                {labelTitle} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <div className="flex flex-col items-center space-y-4">
                <div
                style={{height: `${height}px`, width: `${width}px`}}
                className={cn("relative overflow-hidden bg-gray-200 border-4 border-white shadow-lg cursor-pointer", shape === 'circle' ? 'rounded-full' : 'rounded-md')}
                onClick={handleAvatarClick}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                >
                {avatar ? (
                    <>
                    <Image
                        src={avatar}
                        alt="Profile picture"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className={`object-cover ${isHovering ? 'opacity-50' : ''}`}
                    />
                    {isHovering && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
                        <FaCamera className="text-white text-2xl" />
                        </div>
                    )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <FaCamera className="text-gray-400 text-2xl" />
                    </div>
                )}
                </div>
                
                <div className="flex space-x-2">
                <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="px-4 py-1 bg-sky-800 text-white rounded-lg hover:bg-sky-900 transition-colors text-md"
                >
                    {buttonTitle}
                </button>
                
                {avatar && (
                    <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-4 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                    Hapus
                    </button>
                )}
                </div>
                
                <input
                ref={fileInputRef}
                id={id}
                name={name}
                type="file"
                accept="image/*"
                required={required}
                className="hidden"
                onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500">
                Format: JPG, PNG, GIF (Maks. 5 MB)
                </p>
            </div>
        </div>
    );
};

export default ImageField;
