"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FaCheck } from "react-icons/fa";

export interface StepItem {
    label: string;
    icon?: ReactNode;
    description?: string;
}

interface StepperProps {
    steps: StepItem[];
    currentStep: number;
    onStepChange?: (index: number) => void;
    validateStep?: (stepIndex: number) => boolean;
    className?: string;
    orientation?: 'horizontal' | 'vertical';
}

const Stepper: React.FC<StepperProps> = ({
    steps,
    currentStep,
    onStepChange,
    validateStep,
    className,
    orientation = 'horizontal',
}) => {
    const handleStepClick = (targetIndex: number) => {
        if (!onStepChange) return;

        if (targetIndex <= currentStep) {
        onStepChange(targetIndex);
        return;
        }

        if (targetIndex > currentStep) {
        for (let i = currentStep; i < targetIndex; i++) {
            if (validateStep && !validateStep(i)) {
            return;
            }
        }
        onStepChange(targetIndex);
        }
    };

    const getStepStatus = (index: number): 'completed' | 'current' | 'upcoming' | 'disabled' => {
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'current';

        if (validateStep) {
        for (let i = currentStep; i < index; i++) {
            if (!validateStep(i)) {
            return 'disabled';
            }
        }
        }
        
        return 'upcoming';
    };

    if (orientation === 'vertical') {
        return (
            <nav aria-label="Progress" className={cn("w-full", className)}>
                <ol role="list" className="space-y-4">
                    {steps.map((step, index) => {
                        const status = getStepStatus(index);
                        const isCompleted = status === 'completed';
                        const isCurrent = status === 'current';
                        const isDisabled = status === 'disabled';

                        return (
                            <li key={index} className="flex items-start gap-4">
                                <div className="flex flex-col items-center">
                                    <button
                                        type="button"
                                        onClick={() => handleStepClick(index)}
                                        disabled={isDisabled}
                                        className={cn(
                                        "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600",
                                        isCompleted && "bg-sky-600 border-sky-600 text-white hover:bg-sky-700",
                                        isCurrent && "bg-white border-sky-600 text-sky-600 shadow-md",
                                        !isCompleted && !isCurrent && !isDisabled && "bg-white border-gray-300 text-gray-500 hover:border-sky-400",
                                        isDisabled && "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                        )}
                                        aria-current={isCurrent ? "step" : undefined}
                                        aria-label={`Step ${index + 1}: ${step.label}`}
                                    >
                                        {isCompleted ? (
                                        <FaCheck className="h-5 w-5" />
                                        ) : (
                                        <span className="text-sm font-semibold">{index + 1}</span>
                                        )}
                                    </button>

                                    {index !== steps.length - 1 && (
                                        <div
                                        className={cn(
                                            "w-0.5 h-12 my-1 transition-colors duration-200",
                                            isCompleted ? "bg-sky-600" : "bg-gray-200"
                                        )}
                                        aria-hidden="true"
                                        />
                                    )}
                                </div>

                                <div className="flex-1 pt-1.5">
                                    <button
                                        type="button"
                                        onClick={() => handleStepClick(index)}
                                        disabled={isDisabled}
                                        className={cn(
                                        "text-left transition-colors",
                                        isDisabled && "cursor-not-allowed"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                        {step.icon && (
                                            <span className={cn(
                                            "transition-colors",
                                            isCurrent && "text-sky-600",
                                            isCompleted && "text-sky-600",
                                            !isCurrent && !isCompleted && !isDisabled && "text-gray-500",
                                            isDisabled && "text-gray-400"
                                            )}>
                                            {step.icon}
                                            </span>
                                        )}
                                        <span
                                            className={cn(
                                            "text-sm font-medium transition-colors",
                                            isCurrent && "text-sky-900",
                                            isCompleted && "text-sky-800",
                                            !isCurrent && !isCompleted && !isDisabled && "text-gray-700",
                                            isDisabled && "text-gray-400"
                                            )}
                                        >
                                            {step.label}
                                        </span>
                                        </div>
                                        {step.description && (
                                        <p className={cn(
                                            "mt-1 text-xs transition-colors",
                                            isDisabled ? "text-gray-400" : "text-gray-500"
                                        )}>
                                            {step.description}
                                        </p>
                                        )}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </nav>
        );
    }

    return (
        <nav aria-label="Progress" className={cn("w-full", className)}>
            <ol role="list" className="flex items-center justify-between">
                {steps.map((step, index) => {
                const status = getStepStatus(index);
                const isCompleted = status === 'completed';
                const isCurrent = status === 'current';
                const isDisabled = status === 'disabled';
                const isLast = index === steps.length - 1;

                return (
                    <li key={index} className="relative flex flex-1 items-center">
                        <div className="flex flex-col items-center flex-1">
                            <button
                            type="button"
                            onClick={() => handleStepClick(index)}
                            disabled={isDisabled}
                            className={cn(
                                "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 z-10",
                                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600",
                                isCompleted && "bg-sky-600 border-sky-600 text-white hover:bg-sky-700",
                                isCurrent && "bg-white border-sky-600 text-sky-600 shadow-lg scale-110",
                                !isCompleted && !isCurrent && !isDisabled && "bg-white border-gray-300 text-gray-500 hover:border-sky-400",
                                isDisabled && "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            )}
                            aria-current={isCurrent ? "step" : undefined}
                            aria-label={`Step ${index + 1}: ${step.label}`}
                            >
                                {isCompleted ? (
                                    <FaCheck className="h-5 w-5" />
                                ) : (
                                    <span className="text-sm font-semibold">{index + 1}</span>
                                )}
                            </button>

                            <div className="mt-2 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                    {step.icon && (
                                    <span className={cn(
                                        "text-sm transition-colors",
                                        isCurrent && "text-sky-600",
                                        isCompleted && "text-sky-600",
                                        !isCurrent && !isCompleted && !isDisabled && "text-gray-500",
                                        isDisabled && "text-gray-400"
                                    )}>
                                        {step.icon}
                                    </span>
                                    )}
                                    <span
                                    className={cn(
                                        "text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                                        isCurrent && "text-sky-900",
                                        isCompleted && "text-sky-800",
                                        !isCurrent && !isCompleted && !isDisabled && "text-gray-700",
                                        isDisabled && "text-gray-400"
                                    )}
                                    >
                                    {step.label}
                                    </span>
                                </div>
                                {step.description && (
                                    <p className={cn(
                                    "mt-0.5 text-xs transition-colors hidden sm:block",
                                    isDisabled ? "text-gray-400" : "text-gray-500"
                                    )}>
                                    {step.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {!isLast && (
                            <div
                            className={cn(
                                "absolute top-5 left-1/2 right-0 h-0.5 -z-0 transition-colors duration-200",
                                "transform translate-x-5",
                                isCompleted ? "bg-sky-600" : "bg-gray-200"
                            )}
                            style={{
                                width: 'calc(100% - 2.5rem)',
                            }}
                            aria-hidden="true"
                            />
                        )}
                    </li>
                );
                })}
            </ol>
        </nav>
    );
};

export default Stepper;
