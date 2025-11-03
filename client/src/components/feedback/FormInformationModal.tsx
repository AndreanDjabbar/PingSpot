"use client";
import React from 'react';
import { BiX } from 'react-icons/bi';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { MdWarning } from 'react-icons/md';

interface FormInformationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    type: 'info' | 'warning';
    description: string;
    additionalInfo?: string;
}

const FormInformationModal: React.FC<FormInformationModalProps> = ({
    title, 
    type,
    description, 
    isOpen, 
    onClose,
    additionalInfo
}) => {
    if (!isOpen) return null;

    const typeConfig = {
        info: {
            icon: <BsFillInfoCircleFill size={24} />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-700',
            headerText: 'Informasi',
            additionalBg: 'bg-sky-50 border-sky-200',
            additionalText: 'text-sky-700',
            buttonBg: 'bg-sky-700 hover:bg-sky-800 active:bg-sky-950'
        },
        warning: {
            icon: <MdWarning size={24} />,
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-700',
            headerText: 'Peringatan',
            additionalBg: 'bg-amber-50 border-amber-200',
            additionalText: 'text-amber-700',
            buttonBg: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
        }
    };

    const config = typeConfig[type];

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
                        <div className={`p-2 rounded-full ${config.iconBg}`}>
                            <span className={config.iconColor}>
                                {config.icon}
                            </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            {config.headerText}
                        </h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <BiX className="w-6 h-6 text-gray-900" />
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
                        <div className={`p-4 border rounded-lg ${config.additionalBg}`}>
                            <p className={`text-sm ${config.additionalText}`}>
                                {additionalInfo}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-5 pt-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-5 py-2 text-white rounded-lg font-medium transition-colors ${config.buttonBg}`}
                    >
                        Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormInformationModal;