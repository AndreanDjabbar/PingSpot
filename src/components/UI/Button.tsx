import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'submit' | 'button';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    type?: ButtonType;
    loadingText?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    type = 'button',
    isLoading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles: Record<ButtonVariant, string> = {
        primary: 'bg-sky-700 text-white hover:bg-sky-800 focus:ring-sky-900',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-800',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-800',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-800',
        outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizeStyles: Record<ButtonSize, string> = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-5 py-2 text-base',
        lg: 'px-8 py-3 text-lg',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim();

    const renderIcon = () => {
        if (isLoading) {
            return <AiOutlineLoading3Quarters className="animate-spin" />;
        }
        return icon;
    };

    const renderContent = () => {
        const text = isLoading && loadingText ? loadingText : children;
        const iconElement = renderIcon();

        if (!iconElement) {
            return <span>{text}</span>;
        }

        if (iconPosition === 'right') {
            return (
                <div className="flex items-center gap-1.5">
                    <span>{text}</span>
                    <span className="ml-2">{iconElement}</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1.5">
                <span className="">{iconElement}</span>
                <span>{text}</span>
            </div>
        );
    };

    return (
        <button
            type={type}
            className={`${combinedClassName} cursor-pointer`}
            disabled={disabled || isLoading}
            {...props}
        >
            {renderContent()}
        </button>
    );
};

export default Button;
