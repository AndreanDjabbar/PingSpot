import { IReverseLocation } from "../model";

export interface IReverseLocationRequest {
    latitude: string;
    longitude: string;
}
export interface IReverseLocationResponse {
    message: string;
    data?: IReverseLocation;
}