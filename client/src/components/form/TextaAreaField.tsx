import React from 'react';
import { cn } from '@/lib/utils';

interface TextAreaFieldProps {
    className?: string;
    withLabel: boolean;
    labelTitle?: string;
    id: string;
    name?: string;
    required?: boolean;
    labelIcon?: React.ReactNode;
    icon?: React.ReactNode;
    placeHolder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    register?: unknown;
    rows?: number;
    disabled?: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
    id,
    name,
    required = false,
    className = '',
    placeHolder = '',
    withLabel = true,
    labelTitle = '',
    labelIcon,
    icon,
    value,
    onChange,
    onBlur,
    register,
    rows = 4,
    disabled = false,
}) => {
    return (
        <div className={`space-y-1 ${className}`}>
        {withLabel && (
            <div className='flex gap-2'>
                {labelIcon && (
                    <span className="text-gray-700">{labelIcon}</span>
                )}
                <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
                {labelTitle}
                {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            </div>
        )}
        <div className="relative flex">
                {icon && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 pl-3 flex items-center pointer-events-none text-gray-500">
                        {icon}
                    </div>
                )}
                <textarea
                id={id}
                name={name}
                required={required}
                rows={rows}
                disabled={disabled}
                style={{ minHeight: '50px' }}
                className={cn("block w-full", 
                    icon ? 'pl-10' : 'pl-3',
                    "pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-800 focus:border-sky-800 transition-all duration-200",
                    disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'
                )}
                placeholder={placeHolder || `Masukkan ${labelTitle.toLowerCase()}`}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                {...(register || {})}
                />
            </div>
        </div>
    );
};

export default TextAreaField;
