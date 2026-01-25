import { create } from "zustand";
import {
    IReport,
    ITotalReportCount,
    IReportProgress,
    ReportFilterOptions,
    IReportComment,
} from "@/types";

interface ReportsStore {
  // State
    reports: IReport[];
    filteredReports: IReport[];
    selectedReport: IReport | null;
    searchTerm: string;
    activeFilter: IReport | "all";
    reportCount: ITotalReportCount;
    reportFilters: ReportFilterOptions;
    reportComments: IReportComment[];
    reportCommentsCount: number;

  // Reports Actions
    setReports: (reports: IReport[]) => void;
    setFilteredReports: (filteredReports: IReport[]) => void;
    setSelectedReport: (report: IReport | null) => void;
    addReportProgress: (reportId: number, newProgress: IReportProgress) => void;
    clearReportsData: () => void;

    // Filter Actions
    setSearchTerm: (searchTerm: string) => void;
    setActiveFilter: (activeFilter: IReport | "all") => void;
    updateReportFilters: (updates: Partial<ReportFilterOptions>) => void;
    resetReportFilters: () => void;

  // Count Actions
    setReportCount: (reportCount: ITotalReportCount) => void;

  // Comments Actions
    setReportComments: (comments: IReportComment[]) => void;
    setReportCommentsCount: (count: number) => void;
    clearReportCommentsData: () => void;
}

const DEFAULT_FILTERS: ReportFilterOptions = {
    sortBy: "latest",
    reportType: "all",
    status: "all",
    distance: {
        distance: "all",
        lat: null,
        lng: null,
    },
    hasProgress: "all",
};

const DEFAULT_REPORT_COUNT: ITotalReportCount = {
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
};

export const useReportsStore = create<ReportsStore>((set, get) => ({
  // Initial State
    reports: [],
    filteredReports: [],
    selectedReport: null,
    searchTerm: "",
    activeFilter: "all",
    reportCount: DEFAULT_REPORT_COUNT,
    reportFilters: DEFAULT_FILTERS,
    reportComments: [],
    reportCommentsCount: 0,

  // Reports Actions
    setReports: (reports) => set({ reports }),
    setFilteredReports: (filteredReports) => set({ filteredReports }),
    setSelectedReport: (report) => set({ selectedReport: report }),

    addReportProgress: (reportId, newProgress) => {
        const state = get();

        const updateReport = (report: IReport): IReport => {
        if (report.id !== reportId) return report;

        const updatedProgress = report.reportProgress
            ? [newProgress, ...report.reportProgress]
            : [newProgress];

        return {
            ...report,
            reportProgress: updatedProgress,
            reportStatus: newProgress.status,
        };
        };

        set({
        reports: state.reports.map(updateReport),
        filteredReports: state.filteredReports.map(updateReport),
        selectedReport:
            state.selectedReport?.id === reportId
            ? updateReport(state.selectedReport)
            : state.selectedReport,
        });
    },

    clearReportsData: () =>
        set({
        reports: [],
        filteredReports: [],
        searchTerm: "",
        activeFilter: "all",
        }),

  // Filter Actions
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setActiveFilter: (activeFilter) => set({ activeFilter }),

    updateReportFilters: (updates) =>
        set((state) => ({
        reportFilters: { ...state.reportFilters, ...updates },
        })),

    resetReportFilters: () => set({ reportFilters: DEFAULT_FILTERS }),

  // Count Actions
    setReportCount: (reportCount) => set({ reportCount }),

  // Comments Actions
    setReportComments: (comments) => set({ reportComments: comments }),
    setReportCommentsCount: (count) => set({ reportCommentsCount: count }),
    clearReportCommentsData: () =>
        set({ reportComments: [], reportCommentsCount: 0 }),
}));