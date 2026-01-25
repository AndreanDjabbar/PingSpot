import z from "zod";
import { 
    IUserProfile 
} from "../model/user";
import { SaveProfileSchema, SaveSecuritySchema } from "@/app/main/schema";

export interface IGetProfileByUsernameResponse {
    message: string;
    data?: IUserProfile;
}

export interface IGetProfileResponse {
    message: string;
    data?: IUserProfile;
}

export type ISaveProfileRequest = z.infer<typeof SaveProfileSchema>;

export interface ISaveProfileResponse {
    message: string;
    data?: IUserProfile;
}

export type ISaveSecurityRequest = z.infer<typeof SaveSecuritySchema>;

export interface ISaveSecurityResponse {
    message: string;
}

export interface IGetUserStatisticsResponse {
    message: string;
    data?: {
        totalUsers: number;
        usersByGender: Record<string, number>;
        monthlyUserCounts: Record<string, number>;
    }
}

