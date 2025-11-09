"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOptionsModalStore, OptionItem } from '@/stores/optionsModalStore';

const OptionsModal: React.FC = () => {
    const { isOpen, optionsList, anchorRef, closeOptionsModal } = useOptionsModalStore();
    const [position, setPosition] = useState({ top: 0, right: 0 });
    const modalRef = useRef<HTMLDivElement>(null);
    const [triangleLeft, setTriangleLeft] = useState<number | null>(null);
    const [triangleRight, setTriangleRight] = useState<number | null>(24);

    useEffect(() => {
        if (isOpen && anchorRef?.current) {
            const buttonRect = anchorRef.current.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            setPosition({
                top: buttonRect.bottom + scrollY + 8,
                right: window.innerWidth - buttonRect.right - 8,
            });
            setTriangleLeft(null);
        }
    }, [isOpen, anchorRef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                anchorRef?.current &&
                !anchorRef.current.contains(event.target as Node)
            ) {
                closeOptionsModal();
            }
        };

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeOptionsModal();
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [isOpen, anchorRef, closeOptionsModal]);

    useEffect(() => {
        if (!isOpen) return;
        if (!modalRef.current || !anchorRef?.current) return;

        const measure = () => {
            const modalRect = modalRef.current!.getBoundingClientRect();
            const buttonRect = anchorRef.current!.getBoundingClientRect();
            const buttonCenterX = buttonRect.left + buttonRect.width / 2;
            let left = buttonCenterX - modalRect.left - 10; 
            const min = 12;
            const max = modalRect.width - 40;
            if (left < min) left = min;
            if (left > max) left = max;

            const distanceFromModalRight = modalRect.right - buttonCenterX;
            if (distanceFromModalRight < 80) {
                const rightOffset = Math.max(12, Math.round(modalRect.right - buttonCenterX) - 8);
                setTriangleRight(rightOffset);
                setTriangleLeft(null);
            } else {
                setTriangleLeft(left);
                setTriangleRight(null);
            }
        };
        requestAnimationFrame(measure);
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure, { passive: true });
        return () => {
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure as EventListener);
        };
    }, [isOpen, anchorRef]);

    const onOptionClick = (option: OptionItem) => {
        try {
            option.onClick();
        } catch (err) {
            console.error('OptionsModal option error', err);
        } finally {
            closeOptionsModal();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        aria-hidden
                    />

                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.12 }}
                        style={{
                            position: 'absolute',
                            top: `${position.top}px`,
                            right: `${position.right}px`,
                            minWidth: 240,
                        }}
                        className="z-50 w-full max-w-md sm:max-w-lg lg:max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-50 sm:max-h-55 md:max-h-70 lg:max-h-80"
                        role="dialog"
                        aria-modal="true"
                    >

                        <div
                            className="absolute -top-2 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-200"
                            style={
                                triangleLeft !== null
                                    ? { left: `${triangleLeft}px` }
                                    : { right: `${triangleRight ?? 24}px` }
                            }
                        />
                        
                        <div className="flex-1 overflow-y-auto max-h-[420px] py-2 ">
                            {optionsList && optionsList.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {optionsList.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => onOptionClick(opt)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3"
                                            type="button"
                                        >
                                            {opt.icon && <span className="mt-0.5 text-gray-600">{opt.icon}</span>}
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                                                {opt.description && (
                                                    <div className="text-xs text-gray-500">{opt.description}</div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500">No options</div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OptionsModal;
