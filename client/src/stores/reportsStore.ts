import { create } from "zustand";
import { IReport, ITotalReportCount, ReportStatus } from "@/types/model/report";

interface ReportsStore {
    reports: IReport[];
    filteredReports: IReport[];
    searchTerm: string;
    reportCount: ITotalReportCount;
    setReportCount: (reportCount: ITotalReportCount) => void;
    activeFilter: IReport | "all";
    selectedReport: IReport | null;
    setReports: (reports: IReport[]) => void;
    setSelectedReport: (report: IReport | null) => void;
    setFilteredReports: (filteredReports: IReport[]) => void;
    setSearchTerm: (searchTerm: string) => void;
    setActiveFilter: (activeFilter: IReport | "all") => void;
    updateReportStatus: (reportId: number, newStatus: string) => void;
    clearReportsData: () => void;
}

export const useReportsStore = create<ReportsStore>((set, get) => ({
    reports: [],
    selectedReport: null,
    filteredReports: [],
    reportCount: {
        totalReports: 0,
        totalInfrastructureReports: 0,
        totalEnvironmentReports: 0,
        totalSafetyReports: 0,
        totalTrafficReports: 0,
        totalPublicFacilityReports: 0,
        totalWasteReports: 0,   
        totalWaterReports: 0,
        totalElectricityReports: 0,
        totalHealthReports: 0,
        totalSocialReports: 0,
        totalEducationReports: 0,
        totalAdministrativeReports: 0,
        totalDisasterReports: 0,
        totalOtherReports: 0,
    },
    setReportCount: (reportCount) => {
        set({ reportCount });
    },
    searchTerm: "",
    activeFilter: "all",
    setReports: (reports) => set({ reports }),
    setFilteredReports: (filteredReports) => set({ filteredReports }),
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setActiveFilter: (activeFilter) => set({ activeFilter }),
    updateReportStatus: (reportId, newStatus) => {
        const state = get();
        const updatedReports = state.reports.map(report => 
            report.id === reportId 
                ? { ...report, status: newStatus as ReportStatus, reportUpdatedAt: Date.now() }
                : report
        );
        const updatedFilteredReports = state.filteredReports.map(report => 
            report.id === reportId 
                ? { ...report, status: newStatus as ReportStatus, reportUpdatedAt: Date.now() }
                : report
        );
        const updatedSelectedReport = state.selectedReport?.id === reportId 
            ? { ...state.selectedReport, status: newStatus as ReportStatus, reportUpdatedAt: Date.now() }
            : state.selectedReport;
        
        set({ 
            reports: updatedReports, 
            filteredReports: updatedFilteredReports,
            selectedReport: updatedSelectedReport
        });
    },
    clearReportsData: () => set({ 
        reports: [],
        filteredReports: [],
        searchTerm: "",
        activeFilter: "all"
    }),
    setSelectedReport: (report) => set({ selectedReport: report })
}));