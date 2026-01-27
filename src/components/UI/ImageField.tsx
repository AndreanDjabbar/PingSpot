/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useRef, ChangeEvent, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaCamera } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

interface ImageFieldProps {
    id: string;
    name?: string;
    className?: string;
    withLabel?: boolean;
    labelTitle?: string;
    usingCrop?: boolean;
    buttonTitle?: string;
    required?: boolean;
    currentImage?: string;
    onChange?: (file: File | null) => void;
    onRemove?: () => void;
    height?: number;
    width?: number;
    shape: 'circle' | 'square';
    cropAspect?: number; 
}

const ImageField: React.FC<ImageFieldProps> = ({
    id,
    name,
    className = '',
    withLabel = true,
    usingCrop = false,
    labelTitle = 'Foto Profil',
    buttonTitle = 'Pilih Foto',
    required = false,
    currentImage,
    onChange,
    onRemove,
    height=44,
    width=44,
    shape,
    cropAspect = 1
}) => {
    const defaultURL = `${process.env.NEXT_PUBLIC_user_static_URL}/default.png`;
    const [image, setImage] = useState<string | null>(currentImage || null);
    const [isHovering, setIsHovering] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [showCropModal, setShowCropModal] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    useEffect(() => {
        setImage(currentImage || null);
    }, [currentImage]);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new window.Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob | null> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    };

    const handleCropSave = async () => {
        if (!tempImage || !croppedAreaPixels) return;

        try {
            const croppedImageBlob = await getCroppedImg(tempImage, croppedAreaPixels);
            if (croppedImageBlob) {
                const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
                setImage(croppedImageUrl);

                const file = new File([croppedImageBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
                if (onChange) {
                    onChange(file);
                }
            }
            setShowCropModal(false);
            setTempImage(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        } catch (e) {
            console.error('Error cropping image:', e);
        }
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        setTempImage(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                
                if (usingCrop) {
                    setTempImage(result);
                    setShowCropModal(true);
                } else {
                    setImage(result);
                    if (onChange) {
                        onChange(file);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(defaultURL);
            if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onChange) {
            onChange(null);
        }

        if (onRemove) {
            onRemove();
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {withLabel && (
                <label htmlFor={id} className="block text-md font-semibold text-center text-gray-900">
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
                {image ? (
                    <>
                    <Image
                        src={image}
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
                    className="px-4 py-1 bg-sky-700 text-white rounded-lg hover:bg-sky-800 transition-colors text-md hover:cursor-pointer"
                >
                    {buttonTitle}
                </button>
                
                {image && image != defaultURL && (
                    <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm hover:cursor-pointer"
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

            {showCropModal && tempImage && (
                <div className="bg-black inset-0 absolute w-full left-0 top-0 z-100 flex items-center justify-center bg-opacity-75">
                    <div className="bg-white rounded-lg p-4 w-full max-w-2xl mx-4">
                        <h3 className="text-lg  font-semibold mb-4">Crop Gambar</h3>
                        
                        <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                            <Cropper
                                image={tempImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={cropAspect}
                                cropShape={shape === 'circle' ? 'round' : 'rect'}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        <div className="mt-4 space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Zoom
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCropCancel}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleCropSave}
                                className="px-4 py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-800 transition-colors"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageField;
