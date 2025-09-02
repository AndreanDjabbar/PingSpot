import React, { useRef } from 'react';

interface DateTimeFieldProps {
    className?: string;
    withLabel: boolean;
    labelTitle?: string;
    id: string;
    name?: string;
    type?: 'date' | 'datetime-local' | 'time';
    required?: boolean;
    icon: React.ReactNode;
    min?: string;
    max?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    register?: unknown;
}

const DateTimeField: React.FC<DateTimeFieldProps> = ({
    id,
    name,
    type = 'date',
    required = false,
    className = '',
    withLabel = true,
    labelTitle = '',
    icon,
    min,
    max,
    value,
    onChange,
    onBlur,
    register
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className={`space-y-1 ${className}`}>
            {withLabel && (
                <label htmlFor={id} className="block text-sm font-medium text-sky-800">
                    {labelTitle}
                </label>
            )}
            <div className='relative'>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-800">
                    {icon}
                </div>
                <div className="relative" onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.focus()}>
                    <input
                        id={id}
                        name={name}
                        ref={inputRef}
                        type={type}
                        required={required}
                        min={min}
                        max={max}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-800 focus:border-sky-800 transition-all duration-200"
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        {...(register || {})}
                        />
                </div>
            </div>
        </div>
    );
};

export default DateTimeField;
