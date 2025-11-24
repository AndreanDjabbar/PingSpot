/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { MdCircle } from "react-icons/md";
import { FaRegCircleXmark } from "react-icons/fa6";
import { IoMdArrowBack, IoMdRefresh, IoMdHome } from "react-icons/io";
import { Button } from '../UI';

interface ErrorSectionProps {
    message?: string;
    errors?: any;
    onRetry?: () => void;
    onGoBack?: () => void;
    onGoHome?: () => void;
    showRetryButton?: boolean;
    showBackButton?: boolean;
    showHomeButton?: boolean;
}

const ErrorSection: React.FC<ErrorSectionProps> = ({ 
    message, 
    errors, 
    onRetry,
    onGoBack,
    onGoHome,
    showRetryButton = false,
    showBackButton = false,
    showHomeButton = false
}) => {
    if (!message && (!errors || Object.keys(errors).length === 0)) {
        return null;
    }

    const renderErrorValue = (value: any): string => {
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const formatFieldName = (key: string): string => {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/_/g, ' ');
    };

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col">
                <div className="flex gap-2">
                    <FaRegCircleXmark size={20} color='red'/>
                    <h3 className="text-sm font-medium text-red-600 mb-2">
                        {message || 'Please fix the following errors:'}
                    </h3>
                </div>
                <div className="flex-1 px-4">
                    {errors && typeof errors === "string" && (
                        <div className="bg-white rounded-md px-3 py-2 border border-red-100">
                            <p className="text-sm text-red-700">{errors}</p>
                        </div>
                    )}
                    
                    {errors && typeof errors === "object" && Object.keys(errors).length > 0 && (
                        <div className="space-y-2">
                            {Object.entries(errors).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="bg-white rounded-md px-3 py-2 border border-red-100"
                                >
                                    <div className="flex flex-col">
                                        <div className='flex gap-2 items-center'>
                                            <div className="text-red-400">
                                                <MdCircle size={10}/>
                                            </div>
                                            <p className="text-xs font-medium text-red-900 uppercase tracking-wide">
                                                {formatFieldName(key)}
                                            </p>
                                        </div>
                                        <p className="text-sm text-red-700 break-words pl-[18px]">
                                            {renderErrorValue(value)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!errors && message && (
                        <div className="bg-white rounded-md px-3 py-2 border border-red-100">
                            <p className="text-sm text-red-700">
                                {message}
                            </p>
                        </div>
                    )}
                </div>

                {(showRetryButton || showBackButton || showHomeButton) && (
                    <div className="flex gap-3 mt-4 px-4">
                        {showRetryButton && onRetry && (
                            <Button 
                            variant='danger'
                            icon={<IoMdRefresh size={23}/>}
                            onClick={onRetry}
                            >Coba Lagi</Button>
                        )}
                        
                        {showBackButton && onGoBack && (
                            <Button 
                            variant='secondary'
                            icon={<IoMdArrowBack size={23}/>}
                            onClick={onGoBack}
                            >Kembali</Button>
                        )}
                        
                        {showHomeButton && onGoHome && (
                            <Button 
                            variant='primary'
                            icon={<IoMdHome size={23}/>}
                            onClick={onGoHome}
                            >Beranda</Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorSection;