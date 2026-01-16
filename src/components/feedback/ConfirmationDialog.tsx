"use client";
import React from 'react';
import { BiX } from 'react-icons/bi';
import { MdOutlineWarning } from 'react-icons/md';
import { FaInfoCircle } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isPending: boolean;
    type: 'warning' | 'info';
    title: string;
    message: string;
    explanation?: string;
    icon: React.ReactNode;
    confirmTitle?: string;
    cancelTitle?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    isPending,
    type = 'warning',
    title = 'Konfirmasi Keluar',
    message='Apakah anda yakin?',
    explanation='Anda akan keluar dari sesi PingSpot saat ini.',
    icon,
    confirmTitle = 'Keluar',
    cancelTitle = 'Batal'
}) => {
    if (!isOpen) return null;

    const isWarning = type === 'warning';
    const iconColorClass = isWarning ? 'text-red-600' : 'text-gray-800';
    const iconBgClass = isWarning ? 'bg-red-100' : 'bg-gray-200';

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 ${iconBgClass} rounded-full`}>
                            {isWarning ? (
                                <MdOutlineWarning className={`${iconColorClass}`} size={24} />
                            ) : (
                                <FaInfoCircle className={`${iconColorClass}`} size={24} />
                            )}
                        </div>
                        <h3 className={`text-xl font-semibold ${iconColorClass}`}>
                            {title}
                        </h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        disabled={isPending}
                        aria-label="Close modal"
                    >
                        <BiX className={`w-6 h-6 ${iconColorClass}`} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-2">
                            {message}
                        </h4>
                        {explanation && (
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {explanation}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 p-5 pt-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isPending}
                    >
                        {cancelTitle}
                    </button>
                    
                    {isWarning ? (
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isPending}
                            className={`
                                px-5 py-2 rounded-lg font-medium flex items-center justify-center gap-2
                                text-white transition-colors
                                ${isPending 
                                    ? 'bg-red-800 opacity-75 cursor-not-allowed' 
                                    : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                                }
                            `}
                        >
                            {isPending ? (
                                <>
                                    <AiOutlineLoading3Quarters className='animate-spin' size={16} />
                                    {confirmTitle}
                                </>
                            ) : (
                                <>
                                    <div className='w-4 h-4'>
                                        {icon}
                                    </div>
                                    {confirmTitle}
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isPending}
                            className={`
                                px-5 py-2 rounded-lg font-medium flex items-center justify-center gap-2
                                text-white transition-colors
                                ${isPending 
                                    ? 'bg-sky-800 opacity-75 cursor-not-allowed' 
                                    : 'bg-sky-700 hover:bg-sky-800 active:bg-sky-900'
                                }
                            `}
                        >
                            {isPending ? (
                                <>
                                    <AiOutlineLoading3Quarters className='animate-spin' size={16} />
                                    {confirmTitle}
                                </>
                            ) : (
                                <>
                                    <div className='w-4 h-4'>
                                        {icon}
                                    </div>
                                    {confirmTitle}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
