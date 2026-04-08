import type { ApiResponse, PaginatedResponse } from "../api";

export interface GenerateContentPostDraftUsingAIDetail {
    title: string;
    body: string;
    summary: string;
    slug: string;
    promptUsed: string;
    aiModel: string;
    aiTokensUsed: number;
    aiCost: number;
    trackingToken: string;
}

export interface CreatePostDraftRequest {
    eventId: string;
    title: string;
    body: string;
    summary?: string;
    imageUrl: string | null;
    promptUsed?: string;
    aiModel?: string;
    aiTokensUsed?: number;
}

export interface UpdatePostContentRequest {
    title: string;
    body: string;
    summary?: string;
    imageUrl?: string;
    slug?: string;
    promptUsed?: string;
    aiModel?: string;
    aiTokensUsed?: number;
    aiCost?: number;
    trackingToken?: string;
}

export interface PostDetail {
    postId: string;
    eventId: string;
    organizerId: string;
    title: string;
    body: string;
    imageUrl: null | string;
    status: PostStatus;
    promptUsed: string;
    aiModel: string;
    aiTokensUsed: number;
    rejectionReason: null | string;
    publishedAt: Date;
    trackingToken: string;
    externalPostUrl: null | string;
    version: number;
    createdAt: Date;
    modifiedAt: Date;
    canEdit: boolean;
    canSubmit: boolean;
    canPublish: boolean;
    canArchive: boolean;
    distributions: PostDistribution[];
}

export type GetPostDetailResponse = ApiResponse<PostDetail>
export type GenerateContentPostDraftUsingAIResponse = ApiResponse<GenerateContentPostDraftUsingAIDetail>

export const PostStatus = {
    Draft: "Draft",
    Pending: "Pending",
    Approved: "Approved",
    Rejected: "Rejected",
    Published: "Published",
    Archived: "Archived",
} as const;

export type PostStatus = typeof PostStatus[keyof typeof PostStatus];

export interface GetPostsParams {
    pageNumber: number;
    pageSize: number;
    sortColumn: string;
    sortOrder: string;
    eventId?: string;
    search?: string;
    status?: PostStatus;
    submittedFrom?: string;
    submittedTo?: string;
    publishedFrom?: string;
    publishedTo?: string;
    isPublished?: boolean;
    hasExternalPostUrl?: boolean;
}

export interface PostListItem {
    id: string;
    eventId: string;
    organizerId: string;
    title: string;
    body: string;
    imageUrl: string | null;
    status: PostStatus;
    rejectionReason: string | null;
    publishedAt: string | null;
    trackingToken: string;
    externalPostUrl: string | null;
    version: number;
    createdAt: string;
    modifiedAt: string | null;
    distributions: PostDistribution[];
}

export type GetOrganizerPostsResponse = ApiResponse<PaginatedResponse<PostListItem>>;

export interface GenerateImageRequestBody {
    prompt: string;
    aspectRatio: string;
    imageSize: string;
}

export interface DistributionMetricsFacebook {
    externalPostId: string;
    externalUrl: string;
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    reach: number;
    clicks: number;
    fetchedAt: Date;
}

export type GetDistributionMetricsResponse = ApiResponse<DistributionMetricsFacebook>
export type GenerateImageResponse = ApiResponse<{ imageUrl: string }>
export type SendToChatBoxReponse = ApiResponse<string>

export type BlockType =
    | 'heading'
    | 'paragraph'
    | 'image'
    | 'button'
    | 'list'
    | 'divider'
    | 'highlight';

export interface ContentBlock {
    type: BlockType;
    // heading
    level?: 1 | 2 | 3;
    text?: string;
    // image — src chỉ được set từ AI-generated imageUrl, không nhận URL ngoài
    src?: string;
    alt?: string;
    // button/CTA
    label?: string;
    href?: string;
    // list
    ordered?: boolean;
    items?: string[];
    // highlight/quote
    content?: string;
}

// ===============================
// ===== ADMIN POST TYPES =====
// ===============================

export interface PostDistribution {
    id: string;
    platform: string;
    status: string;
    externalUrl: string | null;
    externalPostId: string | null;
    platformMetadata: string | null;
    errorMessage: string | null;
    sentAt: string | null;
}

export interface AdminPostItem {
    id: string;
    eventId: string;
    organizerId: string;
    title: string;
    body: string;
    imageUrl: string | null;
    status: PostStatus;
    rejectionReason: string | null;
    publishedAt: string | null;
    trackingToken: string | null;
    version: number;
    createdAt: string;
    modifiedAt: string | null;
    distributions: PostDistribution[];
}

export interface AdminPaginatedResult<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    currentPageSize: number;
    currentStartIndex: number;
    currentEndIndex: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface GetAdminPostsQueryParams {
    PageNumber: number;
    PageSize: number;
    SortColumn: string;
    SortOrder: "asc" | "desc";
    EventId?: string;
    OrganizerId?: string;
    Search?: string;
    AiModel?: string;
    MinAiTokensUsed?: number;
    MaxAiTokensUsed?: number;
    MinAiCost?: number;
    MaxAiCost?: number;
    Status?: PostStatus;
    ReviewedBy?: string;
    IsRejected?: boolean;
    ReviewedFrom?: string;
    ReviewedTo?: string;
    SubmittedFrom?: string;
    SubmittedTo?: string;
    PublishedFrom?: string;
    PublishedTo?: string;
    HasExternalPostUrl?: boolean;
}

export interface UploadImageResponseItem {
    imageUrl: string;
    folder: string;
}

export type UploadImageResponse = ApiResponse<UploadImageResponseItem>;

export interface GetTotalMetricsItem {
    pageId: string;
    pageUrl: string;
    period: string;
    dailyUnfollowsUnique: number;
    dailyFollowsUnique: number;
    viewsTotal: number;
    impressionsUnique: number;
    likesTotal: number;
    postEngagements: number;
    fetchedAt: string;
}

export type GetTotalMetricsResponse = ApiResponse<GetTotalMetricsItem>;

export type PeriodOptionMetrics = "Day" | "Week" | "days_28"