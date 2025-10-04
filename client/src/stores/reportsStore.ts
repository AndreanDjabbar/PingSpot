import { create } from "zustand";
import { IReport } from "@/types/entity/mainTypes";

interface ReportsStore {
    reports: IReport[];
    filteredReports: IReport[];
    searchTerm: string;
    activeFilter: IReport | "all";
    selectedReport: IReport | null;
    setReports: (reports: IReport[]) => void;
    setSelectedReport: (report: IReport | null) => void;
    setFilteredReports: (filteredReports: IReport[]) => void;
    setSearchTerm: (searchTerm: string) => void;
    setActiveFilter: (activeFilter: IReport | "all") => void;
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