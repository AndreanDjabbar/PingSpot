import React from "react";
import { BiPlus } from "react-icons/bi";

interface EmptyStateProps {
    emptyTitle: string;
    emptyMessage: string;
    emptyIcon: React.ReactNode;
    showCommandButton?: boolean;
    commandLabel?: string;
    onCommandButton?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    emptyTitle,
    emptyMessage,
    emptyIcon,
    showCommandButton = false,
    commandLabel = "Aksi",
    onCommandButton,
}) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-12 text-center">
        <div className="text-5xl text-gray-300 mb-4 flex justify-center">
            {emptyIcon}
        </div>

        <h3 className="text-xl font-medium text-gray-600 mb-2">{emptyTitle}</h3>
        <p className="text-gray-500 mb-4">{emptyMessage}</p>

        {showCommandButton && onCommandButton && (
            <button
            className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 mx-auto"
            onClick={onCommandButton}
            >
            <BiPlus className="w-4 h-4" />
            <span>{commandLabel}</span>
            </button>
        )}
        </div>
    );
};

export default EmptyState;
