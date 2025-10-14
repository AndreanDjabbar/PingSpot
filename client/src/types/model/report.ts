export type ReportType = 'INFRASTRUCTURE' | 'ENVIRONMENT' | 'SAFETY' | 'OTHER';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'NOT_RESOLVED' | 'IN_PROGRESS';

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

export interface ICommentType {
    id: number;
    content: string;
    createdAt: number;
    updatedAt: number;
    userId: number;
    userName: string;
    fullName: string;
    profilePicture?: string;
    replies: CommentType[];
    parentId?: number;
}

export interface IReportReactions {
    reportID: number;
    userID: number;
    reactionType: 'LIKE' | 'DISLIKE';
    createdAt: number;
    updatedAt: number;
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

export interface IReport {
    id: number;
    userID: number;
    fullName: string;
    userName: string;
    profilePicture?: string;
    reportTitle: string;
    reportType: ReportType;
    reportDescription: string;
    reportStatus: string;
    hasProgress: boolean;
    status: ReportStatus;
    reportCreatedAt: number;
    reportUpdatedAt: number;
    location: IReportLocation;
    images: IReportImage;
    comments: ICommentType[];
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
    totalNotResolvedVotes?: number;
    totalVotes?: number;
    isResolvedByCurrentUser?: boolean;
    isNotResolvedByCurrentUser?: boolean;
    reportVotes?: IReportVote[];
}

export interface IReportVote {
    id: number;
    userID: number;
    reportID: number;
    voteType: ReportStatus;
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