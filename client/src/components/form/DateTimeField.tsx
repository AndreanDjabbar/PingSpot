import React, { useEffect, useRef, useState } from 'react';

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
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dateTime, setDateTime] = useState('');

    useEffect(() => {
        if (value) {
            setDateTime(value);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateTime(e.target.value);
        if (onChange) {
            onChange(e);
        } else {
            setDateTime(e.target.value);
        }
    }

    const formattedValue = dateTime
    ? type === "datetime-local"
        ? new Date(dateTime).toISOString().slice(0, 16)
        : new Date(dateTime).toISOString().split("T")[0]
    : "";

    return (
        <div className={`space-y-1 ${className}`}>
            {withLabel && (
                <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
                    {labelTitle}
                </label>
            )}
            <div className='relative'>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
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
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        value={formattedValue}
                        onChange={handleChange}
                        onBlur={onBlur}
                        />
                </div>
            </div>
        </div>
    );
};

export default DateTimeField;
