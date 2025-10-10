"use client";

import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

interface AccordionItemProps {
    id: string;
    title: string;
    children: ReactNode;
    icon?: ReactNode;
    badge?: ReactNode;
    rightContent?: ReactNode;
    disabled?: boolean;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    onToggle?: (id: string, isOpen: boolean) => void;
}

interface AccordionProps {
    children: ReactNode;
    type?: 'single' | 'multiple';
    className?: string;
    defaultValue?: string | string[];
}

interface AccordionContextType {
    openItems: string[];
    toggleItem: (id: string) => void;
    type: 'single' | 'multiple';
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(undefined);

const useAccordionContext = () => {
    const context = React.useContext(AccordionContext);
    if (!context) {
        throw new Error('AccordionItem must be used within an Accordion');
    }
    return context;
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
    id,
    title,
    children,
    icon,
    badge,
    rightContent,
    disabled = false,
    className = '',
    headerClassName = '',
    contentClassName = '',
    onToggle,
}) => {
    const { openItems, toggleItem } = useAccordionContext();
    const isOpen = openItems.includes(id);

    const handleToggle = () => {
        if (disabled) return;
        toggleItem(id);
        onToggle?.(id, !isOpen);
    };

    return (
        <div className={`border border-gray-200 rounded-xl shadow-sm bg-white ${className}`}>
            <div 
                className={`flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 transition-colors duration-200 rounded-t-xl ${
                isOpen ? 'rounded-b-none' : 'rounded-b-xl'
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${headerClassName}`}
                onClick={handleToggle}
            >
                <div className="flex items-center space-x-3 flex-1 text-sky-900">
                    {icon && (
                        <div className="flex-shrink-0">
                            {icon}
                        </div>
                    )}
                    <div className="flex items-center space-x-2 flex-1">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        {badge && (
                        <div className="flex-shrink-0">
                            {badge}
                        </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                {rightContent && (
                    <div className="flex-shrink-0">
                        {rightContent}
                    </div>
                )}
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`hover:bg-gray-100 rounded-lg p-2 -m-2 transition-colors duration-200 ${
                    disabled ? 'hover:bg-transparent' : ''
                    }`}
                >
                    <FaChevronDown className="w-4 h-4 text-gray-500" />
                </motion.div>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isOpen && (
                <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                    }}
                    style={{ overflow: "hidden" }}
                >
                    <div className={`p-4 pt-0 ${contentClassName}`}>
                    {children}
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const Accordion: React.FC<AccordionProps> = ({
    children,
    type = 'multiple',
    className = '',
    defaultValue = [],
}) => {
    const [openItems, setOpenItems] = useState<string[]>(() => {
        if (typeof defaultValue === 'string') {
            return [defaultValue];
        }
        return Array.isArray(defaultValue) ? defaultValue : [];
    });

    const toggleItem = (id: string) => {
        setOpenItems(prev => {
            if (type === 'single') {
                return prev.includes(id) ? [] : [id];
            } else {
                return prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id];
            }
        });
    };

    const contextValue: AccordionContextType = {
        openItems,
        toggleItem,
        type,
    };

    return (
        <AccordionContext.Provider value={contextValue}>
            <div className={`space-y-4 ${className}`}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
};

export default Object.assign(Accordion, {
    Item: AccordionItem,
});
