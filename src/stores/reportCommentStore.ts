import { create } from "zustand";
import { IReportComment } from "@/types/model/report";

interface ReportCommentStore {
    reportComments: IReportComment[];
    reportCommentsCount: number;
    setReportComments: (comments: IReportComment[]) => void;
    setReportCommentsCount: (count: number) => void;
    clearReportCommentsData: () => void;
}

export const useReportCommentStore = create<ReportCommentStore>((set) => ({
    reportComments: [],
    reportCommentsCount: 0,

    setReportComments: (comments) =>
        set({ reportComments: comments }),

    setReportCommentsCount: (count) =>
        set({ reportCommentsCount: count }),

    clearReportCommentsData: () =>
        set({ reportComments: [], reportCommentsCount: 0 }),
}));
