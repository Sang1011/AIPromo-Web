import type { AxiosResponse } from "axios";
import type { ApiResponse, ApiResponseNoData } from "../types/api";
import type { CreatePostDraftRequest, GenerateContentPostDraftUsingAIResponse, GenerateImageRequestBody, GenerateImageResponse, GetAdminPostsQueryParams, GetDistributionMetricsFacebookResponse, GetDistributionMetricsInstagramResponse, GetDistributionMetricsThreadsResponse, GetOrganizerPostsResponse, GetPostDetailResponse, GetPostDistributionDetail, GetPostsParams, GetTotalMetricsResponse, IncrementBuyClickAnalyticsRequest, PeriodOptionMetrics, SendToChatBoxReponse, UpdatePostContentRequest, UploadImageResponse } from "../types/post/post";
import { interceptorAPI } from "../utils/attachInterceptors";

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
    },
    uploadAndAttachImageToPost: (postId: string, imageFile: File, folder: string): Promise<AxiosResponse<UploadImageResponse>> => {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("folderName", folder);
        return interceptorAPI().post(`organizer/posts/${postId}/image`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },
    getFacebookMetricsTotals: (period: PeriodOptionMetrics): Promise<AxiosResponse<GetTotalMetricsResponse>> => {
        return interceptorAPI().get(`/facebook/page/metrics?period=${period}`);
    },
    getAdminPosts: (params: GetAdminPostsQueryParams): Promise<AxiosResponse<any>> => {
        return interceptorAPI().get("/admin/posts", { params });
    },
    getAdminPostById: (id: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().get(`/admin/posts/${id}`);
    },
    approveAdminPost: (
        postId: string,
        adminId: string
    ): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post(`/admin/posts/${postId}/approve`, { adminId });
    },
    rejectAdminPost: (
        postId: string,
        adminId: string,
        reason: string
    ): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post(`/admin/posts/${postId}/reject`, { adminId, reason });
    },
    publishAdminPost: (id: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post(`/admin/posts/${id}/publish`);
    },
    getDistributionMetricsFacebook: (postId: string, distributionId: string): Promise<AxiosResponse<GetDistributionMetricsFacebookResponse>> => {
        return interceptorAPI().get(`/posts/${postId}/distributions/${distributionId}/metrics/facebook`);
    },
    pushPostToOtherPlatform: (postId: string, platform: string, isRetry: boolean): Promise<AxiosResponse<ApiResponseNoData>> => {
        return interceptorAPI().post(`/posts/${postId}/distribute`, { platform, isRetry });
    },
    getDistributionMetricsInstagram: (postId: string, distributionId: string): Promise<AxiosResponse<GetDistributionMetricsInstagramResponse>> => {
        return interceptorAPI().get(`/posts/${postId}/distributions/${distributionId}/instagram-metrics`);
    },
    getDistributionMetricsThreads: (postId: string, distributionId: string) => {
        return interceptorAPI().get<GetDistributionMetricsThreadsResponse>(
            `/posts/${postId}/distributions/${distributionId}/metrics/threads`
        )
    },
    incrementBuyClickAnalytics: (postId: string, body: IncrementBuyClickAnalyticsRequest): Promise<AxiosResponse<ApiResponseNoData>> => {
        return interceptorAPI().post(`/posts/${postId}/distributions/analytics`, body)
    },
    getExternalDistributionByPostIdAndPlatform: (postId: string, platform: string): Promise<AxiosResponse<GetPostDistributionDetail>> => {
        return interceptorAPI().get(`/external-distributions/tracking/${postId}?platform=${platform}`)
    }
}

export default postService;
