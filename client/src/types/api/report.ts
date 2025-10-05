import { IReport, IReportReactions } from "../model/report";

export interface IGetReportResponse {
    message: string;
    data?: IReport[];
}

export interface ICreateReportResponse {
    message: string;
    data?: IReport;
}

export interface IReactReportResponse {
    message: string;
    data?: IReportReactions;
}