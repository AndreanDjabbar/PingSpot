/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib';
import { AnimatePresence, motion } from 'framer-motion';
import { IoChevronDown } from 'react-icons/io5';
import { FaCheck } from 'react-icons/fa';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    className?: string;
    withLabel?: boolean;
    labelTitle?: string;
    id: string;
    name?: string;
    required?: boolean;
    icon?: React.ReactNode;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    options: SelectOption[];
    disabled?: boolean;
    error?: string;
    register?: unknown;
}

const SelectField: React.FC<SelectFieldProps> = ({
    id,
    name,
    required = false,
    className = '',
    placeholder = 'Pilih opsi',
    withLabel = true,
    labelTitle = '',
    icon,
    value,
    onChange,
    onBlur,
    options,
    disabled = false,
    error,
    register,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;
            const dropdownHeight = 300; 
            
            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                setDropdownPosition('top');
            } else {
                setDropdownPosition('bottom');
            }
        }
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onChange?.(optionValue);
        setIsOpen(false);
        setSearchTerm('');
        onBlur?.();
    };

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className={`space-y-1 ${className}`}>
            {withLabel && labelTitle && (
                <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
                    {labelTitle}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative">
                <input
                    ref={hiddenInputRef}
                    type="hidden"
                    id={id}
                    name={name}
                    value={value || ''}
                    {...(register || {})}
                />
                
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={handleToggle}
                    disabled={disabled}
                    className={cn(
                        "w-full flex items-center justify-between px-3 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-left transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-sky-800 focus:border-sky-800",
                        disabled && "bg-gray-200 cursor-not-allowed",
                        error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                        icon ? "pl-10" : "pl-3"
                    )}
                >
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            {icon}
                        </div>
                    )}
                    
                    <span className={cn(
                        "block truncate",
                        selectedOption ? "text-gray-900" : "text-gray-400"
                    )}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    
                    <IoChevronDown 
                        className={cn(
                            "w-5 h-5 text-gray-400 transition-transform duration-200",
                            isOpen && "transform rotate-180"
                        )}
                    />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ 
                                opacity: 0, 
                                y: dropdownPosition === 'top' ? 10 : -10,
                                scale: 0.95
                            }}
                            animate={{ 
                                opacity: 1, 
                                y: 0,
                                scale: 1
                            }}
                            exit={{ 
                                opacity: 0, 
                                y: dropdownPosition === 'top' ? 10 : -10,
                                scale: 0.95
                            }}
                            transition={{ 
                                duration: 0.2,
                                ease: "easeOut"
                            }}
                            className={cn(
                                "absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-2xl max-h-72 overflow-hidden",
                                dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                            )}
                        >
                            {options.length > 5 && (
                                <div className="p-2 border-b border-gray-200">
                                    <input
                                        type="text"
                                        placeholder="Cari..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            )}

                            <div className="overflow-y-auto max-h-60">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                                                option.value === value && "bg-sky-50 hover:bg-sky-100"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-sm font-medium",
                                                option.value === value ? "text-sky-700" : "text-gray-900"
                                            )}>
                                                {option.label}
                                            </span>
                                            {option.value === value && (
                                                <FaCheck className="w-4 h-4 text-sky-700" />
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                        Tidak ada hasil ditemukan
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {error && (
                <p className="text-red-500 text-sm font-semibold mt-1">{error}</p>
            )}
        </div>
    );
};

export default SelectField;
