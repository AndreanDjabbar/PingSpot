"use client";
import React from 'react';
import { BiX } from 'react-icons/bi';
import { BsFillInfoCircleFill } from 'react-icons/bs';

interface FormInformationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    additionalInfo?: string;
}

const FormInformationModal: React.FC<FormInformationModalProps> = ({
    title, 
    description, 
    isOpen, 
    onClose,
    additionalInfo
}) => {
    if (!isOpen) return null;

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
                        <div className="p-2 rounded-full bg-sky-100">
                            <BsFillInfoCircleFill className="text-sky-800" size={24} />
                        </div>
                        <h3 className="text-xl font-semibold text-sky-800">
                            Informasi
                        </h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <BiX className="w-6 h-6 text-sky-800" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-2">
                            {title}
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {additionalInfo && (
                        <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                            <p className="text-sm text-sky-900">
                                {additionalInfo}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-5 pt-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-sky-800 hover:bg-sky-900 active:bg-sky-950 text-white rounded-lg font-medium transition-colors"
                    >
                        Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormInformationModal;