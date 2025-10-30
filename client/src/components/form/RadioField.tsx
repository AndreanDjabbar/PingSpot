import React from 'react';
import { cn } from '@/lib/utils';
import { BsFillInfoCircleFill } from "react-icons/bs";
import { useFormInformationModalStore } from '@/stores';

interface RadioOption {
    value: string;
    label: string;
}

interface RadioFieldProps {
    className?: string;
    withLabel: boolean;
    labelTitle?: string;
    id: string;
    name?: string;
    required?: boolean;
    options: RadioOption[];
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    register?: unknown;
    informationTitle?: string;
    informationDescription?: string;
    informationAdditionalInfo?: string;
    layout?: 'vertical' | 'horizontal';
    icon?: React.ReactNode;
}

const RadioField: React.FC<RadioFieldProps> = ({
    id,
    name,
    required = false,
    className = '',
    withLabel = true,
    labelTitle = '',
    options = [],
    value,
    onChange,
    onBlur,
    register,
    informationTitle,
    informationDescription,
    informationAdditionalInfo,
    layout = 'vertical',
    icon
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
        onChange(event.target.value);
        }
    };
    const { openFormInfo } = useFormInformationModalStore();

    const handleShowInfo = () => {
        openFormInfo({
            title: informationTitle || '',
            description: informationDescription || '',
            additionalInfo: informationAdditionalInfo
        });
    };

    return (
        <div className={`space-y-1 ${className}`}>
        {withLabel && (
            <div className="flex items-center space-x-2">
            {icon && <span className="text-gray-700">{icon}</span>}
                <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
                    {labelTitle}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {informationTitle && (
                <div className="flex items-center text-sky-700 hover:text-sky-800 hover:scale-110 transition-all duration-300 cursor-pointer" title={informationTitle} onClick={handleShowInfo}>
                    <BsFillInfoCircleFill size={16} />
                </div>
                )}
            </div>
        )}
        <div className={cn(
            "flex gap-4 mt-3",
            layout === 'vertical' ? "flex-col" : "flex-row flex-wrap"
        )}>
            {options.map((option) => (
            <div key={option.value} className="flex items-center">
                <input
                id={`${id}-${option.value}`}
                type="radio"
                name={name}
                value={option.value}
                required={required}
                checked={value === option.value}
                onChange={handleChange}
                onBlur={onBlur}
                {...(register || {})}
                className="h-4 w-4 focus:outline-none cursor-pointer accent-blue-600"
                />
                <label
                htmlFor={`${id}-${option.value}`}
                className="ml-2 block text-sm font-medium text-gray-800 cursor-pointer"
                >
                {option.label}
                </label>
            </div>
            ))}
        </div>
        </div>
    );
};

export default RadioField;
