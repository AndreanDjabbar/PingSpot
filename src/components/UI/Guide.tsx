import React from 'react';

interface GuideStep {
    number: number;
    title: string;
    description: string;
}

interface GuideAlert {
    type: 'warning' | 'info' | 'success' | 'error';
    title: string;
    message: string;
    emoji: string;
}

interface GuideProps {
    title: string;
    subtitle: string;
    icon?: React.ReactNode;
    steps: GuideStep[];
    alerts?: GuideAlert[];
    headerColor?: string;
    stepColor?: string;
    className?: string;
    sticky?: boolean;
}

const Guide: React.FC<GuideProps> = ({
    title,
    subtitle,
    icon,
    steps,
    alerts = [],
    headerColor = 'bg-blue-700',
    stepColor = 'bg-blue-700',
    className = '',
    sticky = true,
}) => {
    const getAlertStyles = (type: GuideAlert['type']) => {
        switch (type) {
            case 'warning':
                return 'bg-amber-50 border-amber-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getAlertTextStyles = (type: GuideAlert['type']) => {
        switch (type) {
            case 'warning':
                return { title: 'text-amber-900', message: 'text-amber-800', emoji: 'text-amber-600' };
            case 'info':
                return { title: 'text-blue-900', message: 'text-blue-800', emoji: 'text-blue-600' };
            case 'success':
                return { title: 'text-green-900', message: 'text-green-800', emoji: 'text-green-600' };
            case 'error':
                return { title: 'text-red-900', message: 'text-red-800', emoji: 'text-red-600' };
            default:
                return { title: 'text-gray-900', message: 'text-gray-800', emoji: 'text-gray-600' };
        }
    };

    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${sticky ? 'sticky top-6' : ''} ${className}`}>
            <div className={`${headerColor} p-5`}>
                <div className="flex items-center gap-2 text-white mb-2">
                    {icon && <span className="w-5 h-5">{icon}</span>}
                    <h3 className="font-bold text-lg">{title}</h3>
                </div>
                <p className="text-white/80 text-xs">
                    {subtitle}
                </p>
            </div>

            <div className="p-5 space-y-4">
                <div className="space-y-3">
                    {steps.map((step) => (
                        <div key={step.number} className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full ${stepColor} text-white flex items-center justify-center text-xs font-bold`}>
                                {step.number}
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-sm font-semibold text-gray-900">
                                {step.title}
                                </p>
                                <p className="text-xs text-gray-600">
                                {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {alerts.length > 0 && (
                    <div className="pt-3 border-t border-gray-200 space-y-3">
                        {alerts.map((alert, index) => {
                            const styles = getAlertTextStyles(alert.type);
                            return (
                                <div key={index} className={`rounded-lg p-3 border ${getAlertStyles(alert.type)}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`${styles.emoji} text-lg`}>{alert.emoji}</span>
                                        <div>
                                            <p className={`text-xs font-semibold ${styles.title} mb-1`}>
                                                {alert.title}
                                            </p>
                                            <p className={`text-xs ${styles.message}`}>
                                                {alert.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Guide;
