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

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div 
            className="bg-pingspot-gradient rounded-xl shadow-xl w-full max-w-md transform transition-all"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center justify-between p-5 border-b border-white">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <div className='mr-2 text-white'>
                        {icon}
                    </div>
                    <p className='text-white'>{title}</p>
                </h3>
                <button 
                    onClick={onClose} 
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    disabled={isPending}
                >
                    <BiX className="w-5 h-5 text-white" />
                </button>
            </div>

            <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                {type === 'warning' ? (
                    <MdOutlineWarning className="text-red-600 bg-white rounded-full w-11 h-11 p-2 text-center items-center"  />
                    
                ) : (
                    <FaInfoCircle className="text-green-800 bg-white rounded-full w-11 h-11 p-2 text-center items-center"  />
                ) }
                    <div>
                    <h4 className="text-lg font-semibold text-white">
                        {message}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-300 mt-1">
                        {explanation}
                    </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 p-5 pt-0">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-400 rounded-lg font-medium"
                disabled={isPending}
            >
                {cancelTitle}
            </button>
            {type === 'warning' ? (
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isPending}
                    className={`
                    px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2
                    text-white
                    ${isPending 
                        ? 'bg-red-800 opacity-75 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                    } transition-all
                    `}
                >
                    {isPending ? (
                    <>
                        <AiOutlineLoading3Quarters className='animate-spin'/>
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
                    px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2
                    text-white
                    ${isPending 
                        ? 'bg-green-900 opacity-75 cursor-not-allowed' 
                        : 'bg-green-700 hover:bg-green-800 active:bg-green-900'
                    } transition-all
                    `}
                >
                    {isPending ? (
                    <>
                        <AiOutlineLoading3Quarters className='animate-spin'/>
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
