import z from "zod";
import { 
    IReverseLocation, 
    IUserProfile 
} from "../model/user";
import { SaveProfileSchema, SaveSecuritySchema } from "@/app/main/schema";

export interface ILogoutRequest {
    authToken: string;
}

export interface ILogoutResponse {
    message: string;
}

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

export interface IReverseLocationResponse {
    message: string;
    data?: IReverseLocation;
}

export interface IGetUserStatisticsResponse {
    message: string;
    data?: {
        totalUsers: number;
        usersByGender: Record<string, number>;
        monthlyUserCounts: Record<string, number>;
    }
}

export interface IReverseLocationRequest {
    latitude: string;
    longitude: string;
}