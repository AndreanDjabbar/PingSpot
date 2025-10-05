import { 
    IReverseLocation, 
    IUserProfile 
} from "../model/user";

export interface ILogoutRequest {
    authToken: string;
}

export interface ILogoutResponse {
    message: string;
}

export interface IGetProfileResponse {
    message: string;
    data?: IUserProfile;
}

export interface IReverseLocationResponse {
    message: string;
    data?: IReverseLocation;
}

export interface IReverseLocationRequest {
    latitude: string;
    longitude: string;
}