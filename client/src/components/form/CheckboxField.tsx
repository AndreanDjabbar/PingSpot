import React from 'react';
import { cn } from '@/lib/utils';
import { BsFillInfoCircleFill } from "react-icons/bs";
import { useFormInformationModalStore } from '@/stores';

interface CheckboxOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface CheckboxFieldProps {
    className?: string;
    withLabel: boolean;
    labelTitle?: string;
    id: string;
    name?: string;
    required?: boolean;
    options?: CheckboxOption[];
    values?: string[];
    onChange?: (values: string[]) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    register?: unknown;
    informationTitle?: string;
    informationDescription?: string;
    informationAdditionalInfo?: string;
    layout?: 'vertical' | 'horizontal';
    icon?: React.ReactNode;
    disabled?: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
    id,
    name,
    required = false,
    className = '',
    withLabel = true,
    labelTitle = '',
    options = [],
    values = [],
    onChange,
    onBlur,
    register,
    informationTitle = '',
    informationDescription = '',
    informationAdditionalInfo = '',
    layout = 'vertical',
    icon,
    disabled = false
}) => {
    const { openFormInfo } = useFormInformationModalStore();

    const handleChange = (optionValue: string, isChecked: boolean) => {
        if (onChange) {
            const newValues = isChecked
                ? [...values, optionValue]
                : values.filter(v => v !== optionValue);
            onChange(newValues);
        }
    };

    const handleShowInfo = () => {
        if (informationTitle && informationDescription) {
            openFormInfo({
                title: informationTitle,
                description: informationDescription,
                additionalInfo: informationAdditionalInfo
            });
        }
    };

    return (
        <div className={`space-y-1 ${className}`}>
            {withLabel && (
                <div className="flex items-center space-x-2">
                    {icon && <span className="text-gray-700">{icon}</span>}
                    <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
                        {labelTitle}
                    </label>
                    {informationTitle && informationDescription && (
                        <div 
                            className="flex items-center text-sky-700 hover:text-sky-800 hover:scale-110 transition-all duration-300 cursor-pointer" 
                            title={informationTitle}
                            onClick={handleShowInfo}
                        >
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
                            type="checkbox"
                            name={name}
                            value={option.value}
                            required={required}
                            checked={values.includes(option.value)}
                            onChange={(e) => handleChange(option.value, e.target.checked)}
                            onBlur={onBlur}
                            disabled={disabled || option.disabled}
                            {...(register || {})}
                            className="h-4 w-4 rounded focus:outline-none cursor-pointer accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <label
                            htmlFor={`${id}-${option.value}`}
                            className={cn(
                                "ml-2 block text-sm font-medium cursor-pointer",
                                (disabled || option.disabled) ? "text-gray-400 cursor-not-allowed" : "text-gray-800"
                            )}
                        >
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CheckboxField;
