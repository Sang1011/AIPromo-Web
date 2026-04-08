import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import postService from "../services/postService";
import type {
    PostDetail,
    CreatePostDraftRequest,
    UpdatePostContentRequest,
    GenerateContentPostDraftUsingAIDetail,
    PostListItem,
    GetPostsParams,
    GenerateImageRequestBody,
    AdminPostItem,
    AdminPaginatedResult,
    GetAdminPostsQueryParams,
    DistributionMetricsFacebook,
    UploadImageResponseItem,
    GetTotalMetricsItem,
    PeriodOptionMetrics,
} from "../types/post/post";
import type { PaginatedResponse } from "../types/api";

interface PostState {
    postDetail: PostDetail | null;
    generatedDraft: GenerateContentPostDraftUsingAIDetail | null;
    createdPostId: string | null;
    generatedImageUrl: string | null;
    chatBoxReply: string | null;

    posts: PostListItem[];
    pagination: Omit<PaginatedResponse<PostListItem>, "items"> | null;
    filters: Partial<GetPostsParams>;

    adminPosts: AdminPostItem[];
    adminPostDetail: AdminPostItem | null;
    adminPagination: Omit<AdminPaginatedResult<AdminPostItem>, "items"> | null;
    distributionMetrics: DistributionMetricsFacebook | null;
    distributionMetricsMap: Record<string, DistributionMetricsFacebook>;
    facebookTotalMetrics: GetTotalMetricsItem | null;
    loading: {
        fetchDetail: boolean;
        updateContent: boolean;
        archive: boolean;
        submitPost: boolean;
        publishPost: boolean;
        generateAI: boolean;
        createDraft: boolean;
        fetchList: boolean;
        generateImage: boolean;
        sendToChatBox: boolean;
        fetchAdminList: boolean;
        fetchAdminDetail: boolean;
        pushPost: boolean;
        fetchDistributionMetrics: boolean;
        fetchAllDistributionMetrics: boolean;
        uploadImage: boolean;
        fetchFacebookTotalMetrics: boolean;
        approvePost: boolean;
        rejectPost: boolean;
        publishAdminPost: boolean;
    };

    error: {
        fetchDetail: string | null;
        updateContent: string | null;
        archive: string | null;
        submitPost: string | null;
        publishPost: string | null;
        generateAI: string | null;
        createDraft: string | null;
        fetchList: string | null;
        generateImage: string | null;
        sendToChatBox: string | null;
        fetchAdminList: string | null;
        fetchAdminDetail: string | null;
        pushPost: string | null;
        fetchDistributionMetrics: string | null;
        fetchAllDistributionMetrics: string | null;
        uploadImage: string | null;
        fetchFacebookTotalMetrics: string | null;
        approvePost: string | null;
        rejectPost: string | null;
        publishAdminPost: string | null;
    };
}

const initialState: PostState = {
    postDetail: null,
    generatedDraft: null,
    createdPostId: null,
    generatedImageUrl: null,
    chatBoxReply: null,
    posts: [],
    pagination: null,
    distributionMetricsMap: {},
    filters: {
        pageNumber: 1,
        pageSize: 5,
        sortColumn: "CreatedAt",
        sortOrder: "desc",
    },

    adminPosts: [],
    adminPostDetail: null,
    adminPagination: null,
    distributionMetrics: null,
    facebookTotalMetrics: null,
    loading: {
        fetchDetail: false,
        updateContent: false,
        archive: false,
        submitPost: false,
        publishPost: false,
        generateAI: false,
        createDraft: false,
        fetchList: false,
        generateImage: false,
        sendToChatBox: false,
        fetchAdminList: false,
        fetchAdminDetail: false,
        fetchDistributionMetrics: false,
        fetchAllDistributionMetrics: false,
        pushPost: false,
        uploadImage: false,
        fetchFacebookTotalMetrics: false,
        approvePost: false,
        rejectPost: false,
        publishAdminPost: false,
    },
    error: {
        fetchDetail: null,
        updateContent: null,
        archive: null,
        submitPost: null,
        publishPost: null,
        generateAI: null,
        createDraft: null,
        fetchList: null,
        generateImage: null,
        sendToChatBox: null,
        fetchAdminList: null,
        fetchAdminDetail: null,
        pushPost: null,
        fetchDistributionMetrics: null,
        fetchAllDistributionMetrics: null,
        uploadImage: null,
        fetchFacebookTotalMetrics: null,
        approvePost: null,
        rejectPost: null,
        publishAdminPost: null,
    },
};

export const fetchPostDetail = createAsyncThunk(
    "post/fetchPostDetail",
    async (postId: string, { rejectWithValue }) => {
        try {
            const res = await postService.getPostDetail(postId);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to fetch post detail");
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to fetch post detail");
        }
    }
);

export const fetchOrganizerPosts = createAsyncThunk(
    "post/fetchOrganizerPosts",
    async (params: GetPostsParams, { rejectWithValue }) => {
        try {
            const res = await postService.getOrganizerPosts(params);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to fetch posts");
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to fetch posts");
        }
    }
);

export const updatePostContent = createAsyncThunk(
    "post/updatePostContent",
    async ({ postId, data }: { postId: string; data: UpdatePostContentRequest }, { rejectWithValue }) => {
        try {
            const res = await postService.updatePostContent(postId, data);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to update post");
            return data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to update post");
        }
    }
);

export const archivePost = createAsyncThunk(
    "post/archivePost",
    async (postId: string, { rejectWithValue }) => {
        try {
            const res = await postService.archivePost(postId);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to archive post");
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to archive post");
        }
    }
);

export const requestToSubmitPost = createAsyncThunk(
    "post/requestToSubmitPost",
    async (postId: string, { rejectWithValue }) => {
        try {
            const res = await postService.requestToSubmitPost(postId);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to submit post");
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to submit post");
        }
    }
);

export const publishApprovedPost = createAsyncThunk(
    "post/publishApprovedPost",
    async (postId: string, { rejectWithValue }) => {
        try {
            const res = await postService.publishApprovedPost(postId);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to publish post");
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to publish post");
        }
    }
);

export const generateContentPostUsingAI = createAsyncThunk(
    "post/generateContentPostUsingAI",
    async ({ eventId, userPromptRequirement }: { eventId: string; userPromptRequirement?: string }, { rejectWithValue }) => {
        try {
            const res = await postService.generateContentPostUsingAI(eventId, userPromptRequirement);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to generate AI content");
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to generate AI content");
        }
    }
);

export const createPostDraft = createAsyncThunk(
    "post/createPostDraft",
    async (data: CreatePostDraftRequest, { rejectWithValue }) => {
        try {
            const res = await postService.createPostDraft(data);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to create post draft");
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to create post draft");
        }
    }
);

export const generateImage = createAsyncThunk(
    "post/generateImage",
    async (data: GenerateImageRequestBody, { rejectWithValue }) => {
        try {
            const res = await postService.generateImage(data);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to generate image");
            return res.data.data.imageUrl;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to generate image");
        }
    }
);

export const sendToChatBox = createAsyncThunk(
    "post/sendToChatBox",
    async (userPrompt: string, { rejectWithValue }) => {
        try {
            const res = await postService.sendToChatBox(userPrompt);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to send message");
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to send message");
        }
    }
);

export const fetchAdminPosts = createAsyncThunk(
    "post/fetchAdminPosts",
    async (params: GetAdminPostsQueryParams, { rejectWithValue }) => {
        try {
            const res = await postService.getAdminPosts(params);
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to fetch admin posts");
        }
    }
);

export const fetchAdminPostById = createAsyncThunk(
    "post/fetchAdminPostById",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await postService.getAdminPostById(id);
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to fetch admin post detail");
        }
    }
);

export const approveAdminPost = createAsyncThunk(
    "post/approveAdminPost",
    async (
        { postId, adminId }: { postId: string; adminId: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await postService.approveAdminPost(postId, adminId);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to approve post");
            return postId;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to approve post");
        }
    }
);

export const rejectAdminPost = createAsyncThunk(
    "post/rejectAdminPost",
    async (
        { postId, adminId, reason }: { postId: string; adminId: string; reason: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await postService.rejectAdminPost(postId, adminId, reason);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to reject post");
            return postId;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to reject post");
        }
    }
);

export const publishAdminPost = createAsyncThunk(
    "post/publishAdminPost",
    async (id: string, { rejectWithValue, dispatch }) => {
        try {
            const res = await postService.publishAdminPost(id);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to publish post");
            dispatch(fetchAdminPosts({ PageNumber: 1, PageSize: 10, SortColumn: "CreatedAt", SortOrder: "desc" }));
            return id;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to publish post");
        }
    }
);

export const fetchDistributionMetricsFacebook = createAsyncThunk(
    "post/fetchDistributionMetricsFacebook",
    async ({ postId, distributionId }: { postId: string; distributionId: string }, { rejectWithValue }) => {
        try {
            const res = await postService.getDistributionMetricsFacebook(postId, distributionId);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Lỗi khi fetch thông tin distribution");
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Lỗi khi fetch thông tin distribution");
        }
    }
);

export const pushPostToOtherPlatform = createAsyncThunk(
    "post/pushPostToOtherPlatform",
    async ({ postId, platform, isRetry }: { postId: string; platform: string; isRetry: boolean }, { rejectWithValue }) => {
        try {
            const res = await postService.pushPostToOtherPlatform(postId, platform, isRetry);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Failed to push post");
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to push post");
        }
    }
);

export const fetchAllDistributionMetrics = createAsyncThunk(
    "post/fetchAllDistributionMetrics",
    async (
        targets: { postId: string; distributionId: string }[],
        { rejectWithValue }
    ) => {
        try {
            const results = await Promise.allSettled(
                targets.map(({ postId, distributionId }) =>
                    postService.getDistributionMetricsFacebook(postId, distributionId)
                        .then(res => ({ distributionId, data: res.data.data }))
                )
            );
            const map: Record<string, DistributionMetricsFacebook> = {};
            results.forEach(r => {
                if (r.status === "fulfilled") {
                    map[r.value.distributionId] = r.value.data;
                }
            });
            return map;
        } catch (error: any) {
            return rejectWithValue("Lỗi khi fetch thông tin distribution");
        }
    }
);

export const uploadImagePost = createAsyncThunk(
    "post/uploadImagePost",
    async (
        { postId, imageFile, folder }: { postId: string; imageFile: File; folder: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await postService.uploadAndAttachImageToPost(postId, imageFile, folder);
            if (!res.data.isSuccess) return rejectWithValue(res.data.message ?? "Lỗi khi upload ảnh");
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Lỗi khi upload ảnh");
        }
    }
);

export const fetchFacebookTotalMetrics = createAsyncThunk(
    "post/fetchFacebookTotalMetrics",
    async (period: PeriodOptionMetrics, { rejectWithValue }) => {
        try {
            const res = await postService.getFacebookMetricsTotals(period);
            if (!res.data.isSuccess) {
                return rejectWithValue(res.data.message ?? "Failed to fetch Facebook total metrics");
            }
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message ?? "Failed to fetch Facebook total metrics"
            );
        }
    }
);

const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        clearPostDetail(state) { state.postDetail = null; },
        clearGeneratedDraft(state) { state.generatedDraft = null; },
        clearCreatedPostId(state) { state.createdPostId = null; },
        clearPostList(state) { state.posts = []; state.pagination = null; },
        setPostFilters(state, action: PayloadAction<Partial<GetPostsParams>>) {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetPostFilters(state) { state.filters = initialState.filters; },
        clearErrors(state) { state.error = initialState.error; },
        clearGeneratedImageUrl(state) { state.generatedImageUrl = null; },
        clearChatBoxReply(state) { state.chatBoxReply = null; },
        clearDistributionMetrics(state) { state.distributionMetrics = null; },
        clearDistributionMetricsMap(state) { state.distributionMetricsMap = {}; },
        clearFacebookTotalMetrics(state) { state.facebookTotalMetrics = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPostDetail.pending, (state) => { state.loading.fetchDetail = true; state.error.fetchDetail = null; })
            .addCase(fetchPostDetail.fulfilled, (state, action: PayloadAction<PostDetail>) => { state.loading.fetchDetail = false; state.postDetail = action.payload; })
            .addCase(fetchPostDetail.rejected, (state, action) => { state.loading.fetchDetail = false; state.error.fetchDetail = action.payload as string; });

        builder
            .addCase(updatePostContent.pending, (state) => { state.loading.updateContent = true; state.error.updateContent = null; })
            .addCase(updatePostContent.fulfilled, (state, action: PayloadAction<UpdatePostContentRequest>) => {
                state.loading.updateContent = false;
                if (state.postDetail) {
                    const { imageUrl: _img, ...rest } = action.payload;
                    state.postDetail = { ...state.postDetail, ...rest };
                }
            })
            .addCase(updatePostContent.rejected, (state, action) => { state.loading.updateContent = false; state.error.updateContent = action.payload as string; });

        builder
            .addCase(archivePost.pending, (state) => { state.loading.archive = true; state.error.archive = null; })
            .addCase(archivePost.fulfilled, (state) => { state.loading.archive = false; state.postDetail = null; })
            .addCase(archivePost.rejected, (state, action) => { state.loading.archive = false; state.error.archive = action.payload as string; });

        builder
            .addCase(requestToSubmitPost.pending, (state) => { state.loading.submitPost = true; state.error.submitPost = null; })
            .addCase(requestToSubmitPost.fulfilled, (state) => { state.loading.submitPost = false; if (state.postDetail) state.postDetail.canSubmit = false; })
            .addCase(requestToSubmitPost.rejected, (state, action) => { state.loading.submitPost = false; state.error.submitPost = action.payload as string; });

        builder
            .addCase(fetchOrganizerPosts.pending, (state) => { state.loading.fetchList = true; state.error.fetchList = null; })
            .addCase(fetchOrganizerPosts.fulfilled, (state, action: PayloadAction<PaginatedResponse<PostListItem>>) => {
                state.loading.fetchList = false;
                const { items, ...pagination } = action.payload;
                state.posts = items;
                state.pagination = pagination;
            })
            .addCase(fetchOrganizerPosts.rejected, (state, action) => { state.loading.fetchList = false; state.error.fetchList = action.payload as string; });

        builder
            .addCase(publishApprovedPost.pending, (state) => { state.loading.publishPost = true; state.error.publishPost = null; })
            .addCase(publishApprovedPost.fulfilled, (state) => {
                state.loading.publishPost = false;
                if (state.postDetail) { state.postDetail.canPublish = false; state.postDetail.status = "Published"; }
            })
            .addCase(publishApprovedPost.rejected, (state, action) => { state.loading.publishPost = false; state.error.publishPost = action.payload as string; });

        builder
            .addCase(generateContentPostUsingAI.pending, (state) => { state.loading.generateAI = true; state.error.generateAI = null; state.generatedDraft = null; })
            .addCase(generateContentPostUsingAI.fulfilled, (state, action: PayloadAction<GenerateContentPostDraftUsingAIDetail>) => { state.loading.generateAI = false; state.generatedDraft = action.payload; })
            .addCase(generateContentPostUsingAI.rejected, (state, action) => { state.loading.generateAI = false; state.error.generateAI = action.payload as string; });

        builder
            .addCase(createPostDraft.pending, (state) => { state.loading.createDraft = true; state.error.createDraft = null; state.createdPostId = null; })
            .addCase(createPostDraft.fulfilled, (state, action: PayloadAction<string>) => { state.loading.createDraft = false; state.createdPostId = action.payload; })
            .addCase(createPostDraft.rejected, (state, action) => { state.loading.createDraft = false; state.error.createDraft = action.payload as string; });

        builder
            .addCase(generateImage.pending, (state) => { state.loading.generateImage = true; state.error.generateImage = null; state.generatedImageUrl = null; })
            .addCase(generateImage.fulfilled, (state, action: PayloadAction<string>) => { state.loading.generateImage = false; state.generatedImageUrl = action.payload; })
            .addCase(generateImage.rejected, (state, action) => { state.loading.generateImage = false; state.error.generateImage = action.payload as string; });

        builder
            .addCase(sendToChatBox.pending, (state) => { state.loading.sendToChatBox = true; state.error.sendToChatBox = null; state.chatBoxReply = null; })
            .addCase(sendToChatBox.fulfilled, (state, action: PayloadAction<string>) => { state.loading.sendToChatBox = false; state.chatBoxReply = action.payload; })
            .addCase(sendToChatBox.rejected, (state, action) => { state.loading.sendToChatBox = false; state.error.sendToChatBox = action.payload as string; });

        builder
            .addCase(fetchAdminPosts.pending, (state) => { state.loading.fetchAdminList = true; state.error.fetchAdminList = null; })
            .addCase(fetchAdminPosts.fulfilled, (state, action) => {
                state.loading.fetchAdminList = false;
                const data = action.payload as AdminPaginatedResult<AdminPostItem>;
                state.adminPosts = data.items;
                const { items: _items, ...pagination } = data;
                state.adminPagination = pagination;
            })
            .addCase(fetchAdminPosts.rejected, (state, action) => { state.loading.fetchAdminList = false; state.error.fetchAdminList = action.payload as string; });

        builder
            .addCase(fetchAdminPostById.pending, (state) => { state.loading.fetchAdminDetail = true; state.error.fetchAdminDetail = null; })
            .addCase(fetchAdminPostById.fulfilled, (state, action) => {
                state.loading.fetchAdminDetail = false;
                state.adminPostDetail = action.payload as AdminPostItem;
            })
            .addCase(fetchAdminPostById.rejected, (state, action) => { state.loading.fetchAdminDetail = false; state.error.fetchAdminDetail = action.payload as string; });

        builder
            .addCase(fetchDistributionMetricsFacebook.pending, (state) => {
                state.loading.fetchDistributionMetrics = true;
                state.error.fetchDistributionMetrics = null;
            })
            .addCase(fetchDistributionMetricsFacebook.fulfilled, (state, action: PayloadAction<DistributionMetricsFacebook>) => {
                state.loading.fetchDistributionMetrics = false;
                state.distributionMetrics = action.payload;
            })
            .addCase(fetchDistributionMetricsFacebook.rejected, (state, action) => {
                state.loading.fetchDistributionMetrics = false;
                state.error.fetchDistributionMetrics = action.payload as string;
            });

        builder
            .addCase(pushPostToOtherPlatform.pending, (state) => {
                state.loading.pushPost = true;
                state.error.pushPost = null;
            })
            .addCase(pushPostToOtherPlatform.fulfilled, (state) => {
                state.loading.pushPost = false;
            })
            .addCase(pushPostToOtherPlatform.rejected, (state, action) => {
                state.loading.pushPost = false;
                state.error.pushPost = action.payload as string;
            });

        builder
            .addCase(fetchAllDistributionMetrics.pending, (state) => {
                state.loading.fetchAllDistributionMetrics = true;
                state.error.fetchAllDistributionMetrics = null;
            })
            .addCase(fetchAllDistributionMetrics.fulfilled, (state, action) => {
                state.loading.fetchAllDistributionMetrics = false;
                state.distributionMetricsMap = { ...state.distributionMetricsMap, ...action.payload };
            })
            .addCase(fetchAllDistributionMetrics.rejected, (state, action) => {
                state.loading.fetchAllDistributionMetrics = false;
                state.error.fetchAllDistributionMetrics = action.payload as string;
            });

        builder
            .addCase(uploadImagePost.pending, (state) => {
                state.loading.uploadImage = true;
                state.error.uploadImage = null;
            })
            .addCase(uploadImagePost.fulfilled, (state, action: PayloadAction<UploadImageResponseItem>) => {
                state.loading.uploadImage = false;
                if (state.postDetail) {
                    state.postDetail.imageUrl = action.payload.imageUrl;
                }
            })
            .addCase(uploadImagePost.rejected, (state, action) => {
                state.loading.uploadImage = false;
                state.error.uploadImage = action.payload as string;
            });
        builder
            .addCase(fetchFacebookTotalMetrics.pending, (state) => {
                state.loading.fetchFacebookTotalMetrics = true;
                state.error.fetchFacebookTotalMetrics = null;
            })
            .addCase(fetchFacebookTotalMetrics.fulfilled, (state, action: PayloadAction<GetTotalMetricsItem>) => {
                state.loading.fetchFacebookTotalMetrics = false;
                state.facebookTotalMetrics = action.payload;
            })
            .addCase(fetchFacebookTotalMetrics.rejected, (state, action) => {
                state.loading.fetchFacebookTotalMetrics = false;
                state.error.fetchFacebookTotalMetrics = action.payload as string;
            });

        // ── approveAdminPost ────────────────────────────────────────────────
        builder
            .addCase(approveAdminPost.pending, (state) => { state.loading.approvePost = true; state.error.approvePost = null; })
            .addCase(approveAdminPost.fulfilled, (state) => { state.loading.approvePost = false; })
            .addCase(approveAdminPost.rejected, (state, action) => { state.loading.approvePost = false; state.error.approvePost = action.payload as string; });

        // ── rejectAdminPost ─────────────────────────────────────────────────
        builder
            .addCase(rejectAdminPost.pending, (state) => { state.loading.rejectPost = true; state.error.rejectPost = null; })
            .addCase(rejectAdminPost.fulfilled, (state) => { state.loading.rejectPost = false; })
            .addCase(rejectAdminPost.rejected, (state, action) => { state.loading.rejectPost = false; state.error.rejectPost = action.payload as string; });

        // ── publishAdminPost ────────────────────────────────────────────────
        builder
            .addCase(publishAdminPost.pending, (state) => { state.loading.publishAdminPost = true; state.error.publishAdminPost = null; })
            .addCase(publishAdminPost.fulfilled, (state) => { state.loading.publishAdminPost = false; })
            .addCase(publishAdminPost.rejected, (state, action) => { state.loading.publishAdminPost = false; state.error.publishAdminPost = action.payload as string; });
    },
});

export const {
    clearPostDetail,
    clearGeneratedDraft,
    clearCreatedPostId,
    clearPostList,
    setPostFilters,
    resetPostFilters,
    clearErrors,
    clearGeneratedImageUrl,
    clearChatBoxReply,
    clearDistributionMetrics,
    clearDistributionMetricsMap,
    clearFacebookTotalMetrics,
} = postSlice.actions;
export default postSlice.reducer;