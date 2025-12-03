import { 
    CreateReportSchema, 
    ReactReportSchema,
    EditReportSchema,
    UploadProgressReportSchema, 
    VoteReportSchema
} from "@/app/main/schema";
import {  IReport, IReportComment, IReportProgress, IReportReactions, IReportVote, ITotalReportCount } from "../model/report";
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

export interface IGetReportCommentsResponse {
    message: string;
    data?: {
        comments: {
            comments: IReportComment[];
            totalCounts: number;
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

export type IEditReportRequest = z.infer<typeof EditReportSchema>;

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

export interface IEditReportResponse {
    message: string;
    data?: IReport;
}

export interface IDeleteReportRequest {
    reportID: number;
}

export interface IDeleteReportResponse {
    message: string;
    data?: {
        reportID: number;
    };
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