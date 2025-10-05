import { CreateReportSchema, ReactReportSchema } from "@/app/main/schema";
import { IReport, IReportReactions } from "../model/report";
import z from "zod";

export interface IGetReportResponse {
    message: string;
    data?: IReport[];
}

export type ICreateReportRequest = z.infer<typeof CreateReportSchema>;

export type IReactReportRequest = z.infer<typeof ReactReportSchema>;

export interface ICreateReportResponse {
    message: string;
    data?: IReport;
}

export interface IReactReportResponse {
    message: string;
    data?: IReportReactions;
}