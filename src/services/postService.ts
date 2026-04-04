import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { CreatePostDraftRequest, GenerateContentPostDraftUsingAIResponse, GenerateImageRequestBody, GenerateImageResponse, GetOrganizerPostsResponse, GetPostDetailResponse, GetPostsParams, SendToChatBoxReponse, UpdatePostContentRequest } from "../types/post/post";
import type { ApiResponse, ApiResponseNoData } from "../types/api";

const postService = {
    getPostDetail: (postId: string): Promise<AxiosResponse<GetPostDetailResponse>> => {
        return interceptorAPI().get(`/posts/${postId}`)
    },
    updatePostContent: (postId: string, data: UpdatePostContentRequest): Promise<AxiosResponse<ApiResponseNoData>> => {
        return interceptorAPI().put(`/posts/${postId}`, data)
    },
    archivePost: (postId: string): Promise<AxiosResponse<ApiResponseNoData>> => {
        return interceptorAPI().delete(`/posts/${postId}`)
    },
    requestToSubmitPost: (postId: string): Promise<AxiosResponse<ApiResponseNoData>> => {
        return interceptorAPI().post(`/posts/${postId}/submit`)
    },
    publishApprovedPost: (postId: string): Promise<AxiosResponse<ApiResponseNoData>> => {
        return interceptorAPI().post(`/posts/${postId}/publish`)
    },
    generateContentPostUsingAI: (eventId: string, userPromptRequirement?: string): Promise<AxiosResponse<GenerateContentPostDraftUsingAIResponse>> => {
        return interceptorAPI().post(`/posts/generate/${eventId}`, { userPromptRequirement });
    },
    createPostDraft: (data: CreatePostDraftRequest): Promise<AxiosResponse<ApiResponse<string>>> => {
        return interceptorAPI().post(`/posts`, data)
    },
    getOrganizerPosts: (p: GetPostsParams): Promise<AxiosResponse<GetOrganizerPostsResponse>> => {
        const params: Record<string, any> = {
            PageNumber: p.pageNumber,
            PageSize: p.pageSize,
            SortColumn: p.sortColumn,
            SortOrder: p.sortOrder,
            ...(p.eventId && { EventId: p.eventId }),
            ...(p.search && { Search: p.search }),
            ...(p.status && { Status: p.status }),
            ...(p.submittedFrom && { SubmittedFrom: p.submittedFrom }),
            ...(p.submittedTo && { SubmittedTo: p.submittedTo }),
            ...(p.publishedFrom && { PublishedFrom: p.publishedFrom }),
            ...(p.publishedTo && { PublishedTo: p.publishedTo }),
            ...(p.isPublished !== undefined && { IsPublished: p.isPublished }),
            ...(p.hasExternalPostUrl !== undefined && { HasExternalPostUrl: p.hasExternalPostUrl }),
        };
        return interceptorAPI().get(`/organizers/posts`, { params });
    },
    generateImage: (data: GenerateImageRequestBody): Promise<AxiosResponse<GenerateImageResponse>> => {
        return interceptorAPI().post("/bot/image-generation", data);
    },
    sendToChatBox: (userPrompt: string): Promise<AxiosResponse<SendToChatBoxReponse>> => {
        return interceptorAPI().post("/bot/chat", {
            userPrompt
        });
    }
}

export default postService;
