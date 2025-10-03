import { create } from "zustand";
import { Report } from "@/app/main/reports/types";

interface ReportsStore {
    reports: Report[];
    filteredReports: Report[];
    searchTerm: string;
    activeFilter: Report | "all";
    selectedReport: Report | null;
    setReports: (reports: Report[]) => void;
    setSelectedReport: (report: Report | null) => void;
    setFilteredReports: (filteredReports: Report[]) => void;
    setSearchTerm: (searchTerm: string) => void;
    setActiveFilter: (activeFilter: Report | "all") => void;
    clearReportsData: () => void;
}

export const useReportsStore = create<ReportsStore>((set) => ({
    reports: [],
    selectedReport: null,
    filteredReports: [],
    searchTerm: "",
    activeFilter: "all",
    setReports: (reports) => set({ reports }),
    setFilteredReports: (filteredReports) => set({ filteredReports }),
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setActiveFilter: (activeFilter) => set({ activeFilter }),
    clearReportsData: () => set({ 
        reports: [],
        filteredReports: [],
        searchTerm: "",
        activeFilter: "all"
    }),
    setSelectedReport: (report) => set({ selectedReport: report })
}));