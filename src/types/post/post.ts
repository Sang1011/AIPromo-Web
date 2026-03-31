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
    imageUrl?: string;
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
    imageUrl: null;
    status: PostStatus;
    platform: string;
    promptUsed: string;
    aiModel: string;
    aiTokensUsed: number;
    rejectionReason: null;
    publishedAt: Date;
    trackingToken: string;
    externalPostUrl: null;
    version: number;
    createdAt: Date;
    modifiedAt: Date;
    canEdit: boolean;
    canSubmit: boolean;
    canPublish: boolean;
    canArchive: boolean;
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
}

export type GetOrganizerPostsResponse = ApiResponse<PaginatedResponse<PostListItem>>;

export interface GenerateImageRequestBody {
    prompt: string;
    aspectRatio: string;
    imageSize: string;
}

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