export type IReverseLocationType = {
    latitude: string;
    longitude: string;
}

export type ILocation = {
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