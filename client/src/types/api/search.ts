import { IReport } from "../model/report";
import { IUserProfile } from "../model/user";

export interface ISearchDataResponse {
    message: string;
    data?: {
        usersData: {
            users: IUserProfile[];
            type: string;
        };
        reportsData: {
            reports: IReport[];
            type: string;
        }
    }
}