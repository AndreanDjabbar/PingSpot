export type ReportType = 'INFRASTRUCTURE' | 'ENVIRONMENT' | 'SAFETY' | 'OTHER';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'NOT_RESOLVED' | 'IN_PROGRESS';

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

export interface CommentType {
    id: number;
    content: string;
    createdAt: number;
    updatedAt: number;
    userId: number;
    userName: string;
    fullName: string;
    profilePicture?: string;
    parentId?: number;
    replies?: CommentType[];
}

export interface ReactionStats {
    likes: number;
    dislikes: number;
}

export interface StatusVoteStats {
    resolved: number;
    notResolved: number;
    neutral: number;
}

export interface UserInteraction {
    hasLiked: boolean;
    hasDisliked: boolean;
    hasSaved: boolean;
    currentVote?: string;
}

export interface Report {
    id: number;
    fullName: string;
    userName: string;
    profilePicture?: string;
    reportTitle: string;
    reportType: ReportType;
    reportDescription: string;
    status: ReportStatus;
    reportCreatedAt: number;
    reportUpdatedAt: number;
    location: ReportLocation;
    images: ReportImage;
    comments: CommentType[];
    commentCount: number;
    reactionStats: ReactionStats;
    statusVoteStats: StatusVoteStats;
    userInteraction: UserInteraction;
}