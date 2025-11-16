import { create } from "zustand";
import { IReport, ITotalReportCount, ReportStatus, IReportProgress } from "@/types/model/report";

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
    addReportProgress: (reportId: number, newProgress: IReportProgress) => void;
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
    addReportProgress: (reportId, newProgress) => {
        const state = get();
        const updateReport = (report: IReport) => {
            if (report.id !== reportId) return report;
            
            const updatedProgress = report.reportProgress 
                ? [newProgress, ...report.reportProgress]
                : [newProgress];
            
            return { ...report, reportProgress: updatedProgress, reportStatus: newProgress.status };
        };
        
        set({ 
            reports: state.reports.map(updateReport),
            filteredReports: state.filteredReports.map(updateReport),
            selectedReport: state.selectedReport?.id === reportId 
                ? updateReport(state.selectedReport)
                : state.selectedReport
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