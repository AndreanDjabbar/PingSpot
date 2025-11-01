import { 
    CreateReportSchema, 
    ReactReportSchema,
    UploadProgressReportSchema, 
    VoteReportSchema
} from "@/app/main/schema";
import { IReport, IReportProgress, IReportReactions, IReportVote, ITotalReportCount } from "../model/report";
import z from "zod";

export interface IGetReportResponse {
    message: string;
    data?: {
        reports: {
            reports: IReport[];
            totalCounts: ITotalReportCount
        };
        nextCursor?: number | null;
    }
}

export interface IGetReportByIDResponse {
    message: string;
    data?: {
        report: {
            report: IReport;
        };
    }
}

export type ICreateReportRequest = z.infer<typeof CreateReportSchema>;

export type IUploadProgressReportRequest = z.infer<typeof UploadProgressReportSchema>; 

export interface IUploadProgressReportResponse {
    message: string;
    data?: IReportProgress;
}

export type IReactReportRequest = z.infer<typeof ReactReportSchema>;

export type IVoteReportRequest = z.infer<typeof VoteReportSchema>;

export interface ICreateReportResponse {
    message: string;
    data?: IReport;
}

export interface IReactReportResponse {
    message: string;
    data?: IReportReactions;
}

export interface IVoteReportResponse {
    message: string;
    data?: IReportVote;
}

export interface IGetProgressReportResponse {
    message: string;
    data?: IReportProgress[];
}

export interface IUpdateReportStatusResponse {
    message: string;
    data?: {
        id: number;
        status: string;
        updatedAt: number;
    };
}