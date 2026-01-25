import { IReport, IUserProfile } from "../model";

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
        },
        nextCursorUsersData?: number | null;
        nextCursorReportsData?: number | null;
    }
}