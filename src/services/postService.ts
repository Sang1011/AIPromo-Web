import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { CreatePostDraftRequest, GenerateContentPostDraftUsingAIResponse, GetPostDetailResponse, UpdatePostContentRequest } from "../types/post/post";
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
    generateContentPostUsingAI: (eventId: string): Promise<AxiosResponse<GenerateContentPostDraftUsingAIResponse>> => {
        return interceptorAPI().post(`/posts/generate/${eventId}`)
    },
    createPostDraft: (data: CreatePostDraftRequest): Promise<AxiosResponse<ApiResponse<string>>> => {
        return interceptorAPI().post(`/posts`, data)
    }
}

export default postService;
