import type { ApiResponse } from "../api";

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
    status: string;
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