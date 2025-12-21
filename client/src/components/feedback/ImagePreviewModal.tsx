/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { BiX } from 'react-icons/bi';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface ImagePreviewModalProps {
    imageUrl: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, isOpen, onClose }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const scrollPositionRef = useRef(0);
    
    useEffect(() => {
        if (isOpen && imageUrl) {
            setShouldRender(true);
            scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
            
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${scrollPositionRef.current}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            
            requestAnimationFrame(() => {
                setIsAnimating(true);
            });
        } else {
            setIsAnimating(false);
            
            const timer = setTimeout(() => {
                setShouldRender(false);
                
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.right = '';
                
                window.scrollTo(0, scrollPositionRef.current);
            }, 300);
            return () => clearTimeout(timer);
        }
        
        return () => {
            if (document.body.style.position === 'fixed') {
                const scrollY = scrollPositionRef.current;
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.right = '';
                window.scrollTo(0, scrollY);
            }
        };
    }, [isOpen, imageUrl]);
    
    if (!shouldRender || !imageUrl) return null;

    return (
        <div 
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
                isAnimating ? 'backdrop-blur-md bg-black/40' : 'backdrop-blur-0 bg-transparent'
            }`}
            onClick={onClose}
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0
            }}
        >
            <div 
                className={`relative max-w-4xl max-h-[90vh] w-[90vw] md:w-[60vw] 
                            overflow-hidden bg-white rounded-lg transition-all duration-300
                            ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
                style={{ overscrollBehavior: 'contain' }}
            >
                <button 
                    className="absolute top-2 right-2 bg-sky-700 rounded-full p-1 text-white hover:bg-sky-900 shadow-lg transition-colors z-10"
                    onClick={onClose}
                >
                    <BiX size={26} />
                </button>

                <div className="p-6 flex items-center justify-center">
                    <TransformWrapper
                        initialScale={1}
                        minScale={1}
                        maxScale={4}
                        centerOnInit
                        wheel={{ step: 0.1 }}
                        doubleClick={{ mode: 'toggle', step: 0.7 }}
                        panning={{ disabled: false }}
                    >
                        <TransformComponent
                            wrapperClass="w-full h-[60vh] bg-gray-900 flex items-center justify-center"
                        >
                            <img
                                src={imageUrl}
                                alt="Preview"
                                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }}
                                draggable={false}
                            />
                        </TransformComponent>
                    </TransformWrapper>
                </div>
            </div>
        </div>
    );
};

export default ImagePreviewModal;