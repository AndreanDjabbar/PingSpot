export type ReportType = 'INFRASTRUCTURE' | 'ENVIRONMENT' | 'SAFETY' | 'OTHER';

export interface ReportImage {
    id: number;
    reportId: number;
    image1URL?: string;
    image2URL?: string;
    image3URL?: string;
    image4URL?: string;
    image5URL?: string;
}

export interface ReportLocation {
    id: number;
    reportId: number;
    detailLocation: string;
    latitude: number;
    longitude: number;
    displayName?: string;
    addressType?: string;
    country?: string;
    countryCode?: string;
    region?: string;
    road?: string;
    postCode?: string;
    county?: string;
    state?: string;
    village?: string;
    suburb?: string;
}

export interface Report {
    id: number;
    fullName: string;
    profilePicture?: string;
    reportTitle: string;
    reportType: ReportType;
    reportDescription: string;
    reportCreatedAt: number;
    location: ReportLocation;
    images: ReportImage;
}