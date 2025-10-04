import { 
    IReport, 
    IReportReactions,
    IUserProfile
} from "../entity/mainTypes";


export type IGetReportResponse = {
    message: string;
    data?: IReport[];
}

export type ICreateReportResponse = {
    message: string;
    data?: IReport;
}

export type IReactReportResponse = {
    message: string;
    data?: IReportReactions;
}

export type IGetProfileResponse = {
    message: string;
    data?: IUserProfile;
}