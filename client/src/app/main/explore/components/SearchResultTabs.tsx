import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaUsers } from 'react-icons/fa';
import { GoAlert } from 'react-icons/go';

export type TabType = 'users' | 'reports' | 'communities';

interface SearchResultTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    userCount: number;
    reportCount: number;
    communityCount: number;
}

const SearchResultTabs: React.FC<SearchResultTabsProps> = ({
    activeTab,
    onTabChange,
    userCount,
    reportCount,
    communityCount
}) => {
    const tabs = [
        { id: 'users' as TabType, label: 'Pengguna', icon: FaUser, count: userCount },
        { id: 'reports' as TabType, label: 'Laporan', icon: GoAlert, count: reportCount },
        { id: 'communities' as TabType, label: 'Komunitas', icon: FaUsers, count: communityCount }
    ];

    return (
        <div className="border-b border-gray-200 overflow-hidden">
            <div className="flex">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                                activeTab === tab.id
                                    ? 'text-sky-700 bg-sky-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-shrink-0">{tab.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                    activeTab === tab.id
                                        ? 'bg-sky-200 text-sky-800'
                                        : 'bg-gray-200 text-gray-700'
                                }`}>
                                    {tab.count}
                                </span>
                            </div>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                                    transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SearchResultTabs;
