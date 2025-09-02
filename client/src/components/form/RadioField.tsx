import React from 'react';
import { cn } from '@/lib/utils';

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
    layout = 'vertical',
    icon
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
        onChange(event.target.value);
        }
    };

    return (
        <div className={`space-y-1 ${className}`}>
        {withLabel && (
            <div className="flex items-center space-x-2">
            {icon && <span className="text-sky-800">{icon}</span>}
            <label htmlFor={id} className="block text-sm font-medium text-sky-800">
                {labelTitle}
            </label>
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
                className="h-4 w-4 focus:outline-none cursor-pointer accent-sky-800"
                />
                <label
                htmlFor={`${id}-${option.value}`}
                className="ml-2 block text-sm font-medium text-black cursor-pointer"
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
