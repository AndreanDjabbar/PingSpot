import { IUserProfile } from "./user";

export type ReportType = 
    | 'INFRASTRUCTURE' 
    | 'ENVIRONMENT' 
    | 'SAFETY' 
    | 'TRAFFIC' 
    | 'PUBLIC_FACILITY' 
    | 'WASTE' 
    | 'WATER' 
    | 'ELECTRICITY' 
    | 'HEALTH' 
    | 'SOCIAL' 
    | 'EDUCATION' 
    | 'ADMINISTRATIVE' 
    | 'DISASTER' 
    | 'OTHER';

export type ReportStatus = 'WAITING' | 'RESOLVED' | 'POTENTIALLY_RESOLVED' | 'NOT_RESOLVED' | 'ON_PROGRESS' | 'EXPIRED';

export interface IReportImage {
    id: number;
    reportID: number;
    image1URL?: string;
    image2URL?: string;
    image3URL?: string;
    image4URL?: string;
    image5URL?: string;
}

export interface IReportLocation {
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
    mapZoom?: number;
    road?: string;
    postCode?: string;
    county?: string;
    state?: string;
    village?: string;
    suburb?: string;
}
export interface IReportReactions {
    reportID: number;
    userID: number;
    reactionType: 'LIKE' | 'DISLIKE';
    createdAt: number;
    updatedAt: number;
}

export type ReportSortOption = 'latest' | 'oldest' | 'most_liked' | 'least_liked';
export type ReportStatusFilter = 'all' | 'WAITING' | 'ON_PROGRESS' | 'RESOLVED' | 'POTENTIALLY_RESOLVED' | 'NOT_RESOLVED' | 'EXPIRED';
export type ReportDistanceFilter = 'all' | '1000' | '5000' | '10000';
export type ReportProgressFilter = 'all' | 'true' | 'false';

export interface ReportFilterOptions {
    sortBy: ReportSortOption;
    reportType: ReportType | 'all';
    status: ReportStatusFilter;
    distance: {
        distance: ReportDistanceFilter;
        lat: string | null;
        lng: string | null;
    };
    hasProgress: ReportProgressFilter;
}

export interface IStatusVoteStats {
    resolved: number;
    notResolved: number;
    neutral: number;
}

export interface IUserInteraction {
    hasLiked: boolean;
    hasDisliked: boolean;
    hasSaved: boolean;
    currentVote?: string;
}

export interface ITotalReportCount {
    totalReports: number;
    totalInfrastructureReports: number;
    totalEnvironmentReports: number;
    totalSafetyReports: number;
    totalTrafficReports: number;
    totalPublicFacilityReports: number;
    totalWasteReports: number;
    totalWaterReports: number;
    totalElectricityReports: number;
    totalHealthReports: number;
    totalSocialReports: number;
    totalEducationReports: number;
    totalAdministrativeReports: number;
    totalDisasterReports: number;
    totalOtherReports: number;
}

export interface IReport {
    id: number;
    userID: number;
    fullName: string;
    userName: string;
    profilePicture?: string;
    reportTitle: string;
    reportType: ReportType;
    reportDescription: string;
    hasProgress: boolean;
    reportStatus: ReportStatus;
    reportCreatedAt: number;
    reportUpdatedAt: number;
    location: IReportLocation;
    images: IReportImage;
    commentCount: number;
    reportReactions: IReportReactions[];
    reportProgress: IReportProgress[];
    statusVoteStats: IStatusVoteStats;
    userInteraction: IUserInteraction;
    totalLikeReactions: number;
    isLikedByCurrentUser: boolean;
    isDislikedByCurrentUser: boolean;
    totalDislikeReactions: number;
    totalReactions: number;
    totalResolvedVotes?: number;
    totalOnProgressVotes?: number;
    totalNotResolvedVotes?: number;
    totalVotes?: number;
    isResolvedByCurrentUser?: boolean;
    isOnProgressByCurrentUser?: boolean;
    isNotResolvedByCurrentUser?: boolean;
    reportVotes?: IReportVote[];
    majorityVote?: ReportStatus;
    lastUpdatedBy?: string;
    lastUpdatedProgressAt?: number;
}

export interface IReportCommentMedia {
    url: string;
    type: string;
    width?: number;
    height?: number;
}

export interface IReportComment {
    commentID: string;
    reportID: number;
    userInformation: IUserProfile;
    commentType: 'TEMP' | 'PERM';
    content?: string;
    createdAt: number;
    parentCommentID?: string;
    threadRootID?: string;
    mentions?: number[];
    replyTo?: IUserProfile;
    media?: IReportCommentMedia;
    replies?: IReportComment[];
    totalReplies?: number;
}

export interface IReportVote {
    id: number;
    userID: number;
    reportID: number;
    voteType: ReportStatus;
    reportStatus: ReportStatus;
    createdAt: number;
    updatedAt: number;
}

export interface IReportProgress {
    id: number;
    reportID: number;
    status: ReportStatus;
    notes?: string;
    attachment1?: string;
    attachment2?: string;
    createdAt: number;
}