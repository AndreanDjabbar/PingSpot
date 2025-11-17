import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { RiProgress3Fill } from 'react-icons/ri';
import { FieldErrors } from 'react-hook-form';

type ProgressStatus = 'RESOLVED' | 'ON_PROGRESS' | 'NOT_RESOLVED';

interface ProgressSectionProps {
    selectedStatus: ProgressStatus | null;
    onStatusChange: (status: ProgressStatus) => void;
    isDisabled?: boolean;
    errors?: FieldErrors;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({
    selectedStatus,
    onStatusChange,
    isDisabled = false,
    errors,
}) => {
    const statusOptions = [
        {
            value: 'RESOLVED' as const,
            label: 'Terselesaikan',
            description: 'Masalah selesai',
            icon: FaCheck,
            colorActive: 'bg-green-600 text-white border-green-700',
            colorInactive: 'bg-white text-green-700 border-gray-200 hover:border-green-300 hover:bg-green-50',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            descriptionColor: 'text-green-100',
        },
        {
            value: 'ON_PROGRESS' as const,
            label: 'Dalam Proses',
            description: 'Sedang ditangani',
            icon: RiProgress3Fill,
            colorActive: 'bg-yellow-600 text-white border-yellow-700',
            colorInactive: 'bg-white text-yellow-700 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50',
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            descriptionColor: 'text-yellow-100',
        },
        {
            value: 'NOT_RESOLVED' as const,
            label: 'Tidak Ada Proses',
            description: 'Belum ditangani',
            icon: FaTimes,
            colorActive: 'bg-red-600 text-white border-red-700',
            colorInactive: 'bg-white text-red-700 border-gray-200 hover:border-red-300 hover:bg-red-50',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            descriptionColor: 'text-red-100',
        },
    ];

    return (
        <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
                Pilih Status Progress *
            </label>
            <div className="grid grid-cols-3 gap-3">
                {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedStatus === option.value;

                    return (
                        <motion.button
                            key={option.value}
                            type="button"
                            className={`relative flex flex-col items-center justify-center p-5 rounded-xl font-semibold transition-all duration-300 border-2 ${
                                isSelected
                                    ? `${option.colorActive} shadow-lg scale-105`
                                    : `${option.colorInactive} shadow-sm`
                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={() => !isDisabled && onStatusChange(option.value)}
                            disabled={isDisabled}
                            whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                        >
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                                    isSelected ? 'bg-white/20' : option.iconBg
                                }`}
                            >
                                <Icon
                                    className={`w-6 h-6 ${
                                        isSelected ? 'text-white' : option.iconColor
                                    }`}
                                />
                            </div>
                            <span className="text-sm font-bold text-center leading-tight">
                                {option.label}
                            </span>
                            <span
                                className={`text-xs mt-1.5 text-center ${
                                    isSelected ? option.descriptionColor : 'text-gray-500'
                                }`}
                            >
                                {option.description}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
            {errors?.progressStatus && (
                <p className="text-red-500 text-sm font-semibold mt-2">
                    {errors.progressStatus.message as string}
                </p>
            )}
        </div>
    );
};

export default ProgressSection;
