export interface IReverseLocation {
    display_name: string;
    address: {
        country?: string;
        country_code?: string;
        state?: string;
        county?: string;
        postcode?: string;
        road?: string;
        suburb?: string;
        village?: string;
        region?: string;
        city?: string;
        town?: string;
        neighbourhood?: string;
        hamlet?: string;
    };
}

export interface ICurrentLocation {
    lat: string;
    lng: string;
    lastUpdated?: string;
    expiresAt?: number;
    displayName?: string;
    address?: object | null;
    type?: string;
    name?: string;
    osmType?: string;
    osmId?: string;
};

export type ILogoutType = {
    authToken: string;
}

export interface IUserProfile {
    id: string;
    username: string;
    fullName: string;
    email: string;
    profilePicture?: string;
    gender?: string;
    bio?: string;
    birthday? : string;
}