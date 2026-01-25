import { IReverseLocation } from "../model/user";

export interface IReverseLocationRequest {
    latitude: string;
    longitude: string;
}
export interface IReverseLocationResponse {
    message: string;
    data?: IReverseLocation;
}