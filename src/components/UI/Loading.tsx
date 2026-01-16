import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type LoadingType = 'spinner' | 'dots' | 'pulse' | 'bars';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
type LoadingVariant = 'primary' | 'secondary' | 'white';

interface LoadingProps {
    type?: LoadingType;
    size?: LoadingSize;
    variant?: LoadingVariant;
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

const Loading: React.FC<LoadingProps> = ({
    type = 'spinner',
    size = 'md',
    variant = 'primary',
    text,
    fullScreen = false,
    className = ''
}) => {
    const iconSizeClasses = {
        sm: 'text-base',
        md: 'text-3xl',
        lg: 'text-5xl',
        xl: 'text-6xl'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
    };

    const dotSizeClasses = {
        sm: 'h-1.5 w-1.5',
        md: 'h-2.5 w-2.5',
        lg: 'h-3.5 w-3.5',
        xl: 'h-4 w-4'
    };

    const barSizeClasses = {
        sm: 'h-4 w-1',
        md: 'h-6 w-1.5',
        lg: 'h-8 w-2',
        xl: 'h-10 w-2.5'
    };

    const colorClasses = {
        primary: 'text-sky-700',
        secondary: 'text-gray-600',
        white: 'text-white'
    };

    const dotColorClasses = {
        primary: 'bg-sky-700',
        secondary: 'bg-gray-600',
        white: 'bg-white'
    };

    const SpinnerLoader = () => (
        <AiOutlineLoading3Quarters
            className={`${iconSizeClasses[size]} ${colorClasses[variant]} animate-spin`}
            role="status"
            aria-label="Loading"
        />
    );

    const DotsLoader = () => (
        <div className="flex items-center space-x-2" role="status" aria-label="Loading">
            {[0, 1, 2].map((index) => (
                <div
                    key={index}
                    className={`${dotSizeClasses[size]} ${dotColorClasses[variant]} rounded-full animate-bounce`}
                    style={{
                        animationDelay: `${index * 0.15}s`,
                        animationDuration: '0.6s'
                    }}
                />
            ))}
        </div>
    );

    const PulseLoader = () => (
        <div
            className={`${dotSizeClasses[size]} ${dotColorClasses[variant]} rounded-full animate-pulse`}
            role="status"
            aria-label="Loading"
        />
    );

    const BarsLoader = () => (
        <div className="flex items-end space-x-1.5" role="status" aria-label="Loading">
            {[0, 1, 2, 3].map((index) => (
                <div
                    key={index}
                    className={`${barSizeClasses[size]} ${dotColorClasses[variant]} rounded-sm animate-pulse`}
                    style={{
                        animationDelay: `${index * 0.15}s`,
                        animationDuration: '0.8s'
                    }}
                />
            ))}
        </div>
    );

    const renderLoader = () => {
        switch (type) {
            case 'dots':
                return <DotsLoader />;
            case 'pulse':
                return <PulseLoader />;
            case 'bars':
                return <BarsLoader />;
            case 'spinner':
            default:
                return <SpinnerLoader />;
        }
    };

    const content = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            {renderLoader()}
            {text && (
                <p className={`${textSizeClasses[size]} ${colorClasses[variant]} font-medium`}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
};

export default Loading;