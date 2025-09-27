import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { ReportType } from '@/app/main/reports/types';

interface ReportSearchAndFilterProps {
    searchTerm: string;
    activeFilter: ReportType | "all";
    onSearchChange: (value: string) => void;
    onFilterChange: (filter: ReportType | "all") => void;
}

const ReportSearchAndFilter: React.FC<ReportSearchAndFilterProps> = ({
    searchTerm,
    activeFilter,
    onSearchChange,
    onFilterChange
}) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari laporan berdasarkan judul, deskripsi atau lokasi"
                        className="w-full pl-10 pr-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-800 focus:border-sky-800 transition-all duration-200"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                
                <div className="flex space-x-2 items-center overflow-x-auto pb-2 md:pb-0">
                    <div className="flex items-center text-gray-500 mr-2">
                        <FaFilter className="mr-1" /> Filter:
                    </div>
                    <button 
                        className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                        activeFilter === "all" 
                            ? "bg-sky-100 text-sky-800 font-medium" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => onFilterChange("all")}
                    >
                        Semua
                    </button>
                    <button 
                        className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                        activeFilter === "INFRASTRUCTURE" 
                            ? "bg-sky-100 text-sky-800 font-medium" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => onFilterChange("INFRASTRUCTURE")}
                    >
                        Infrastruktur
                    </button>
                    <button 
                        className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                        activeFilter === "ENVIRONMENT" 
                            ? "bg-sky-100 text-sky-800 font-medium" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => onFilterChange("ENVIRONMENT")}
                    >
                        Lingkungan
                    </button>
                    <button 
                        className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                        activeFilter === "SAFETY" 
                            ? "bg-sky-100 text-sky-800 font-medium" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => onFilterChange("SAFETY")}
                    >
                        Keamanan
                    </button>
                    <button 
                        className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                        activeFilter === "OTHER" 
                            ? "bg-sky-100 text-sky-800 font-medium" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => onFilterChange("OTHER")}
                    >
                        Lainnya
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportSearchAndFilter;