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
} from "../types/post/post";
import type { PaginatedResponse } from "../types/api";

// ─── State ────────────────────────────────────────────────────────────────────

interface PostState {
    postDetail: PostDetail | null;
    generatedDraft: GenerateContentPostDraftUsingAIDetail | null;
    createdPostId: string | null;

    posts: PostListItem[];
    pagination: Omit<PaginatedResponse<PostListItem>, "items"> | null;
    filters: Partial<GetPostsParams>;

    loading: {
        fetchDetail: boolean;
        updateContent: boolean;
        archive: boolean;
        submitPost: boolean;
        publishPost: boolean;
        generateAI: boolean;
        createDraft: boolean;
        fetchList: boolean;
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
    };
}

const initialState: PostState = {
    postDetail: null,
    generatedDraft: null,
    createdPostId: null,
    posts: [],
    pagination: null,
    filters: {
        pageNumber: 1,
        pageSize: 5,
        sortColumn: "CreatedAt",
        sortOrder: "desc",
    },
    loading: {
        fetchDetail: false,
        updateContent: false,
        archive: false,
        submitPost: false,
        publishPost: false,
        generateAI: false,
        createDraft: false,
        fetchList: false,
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
    },
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchPostDetail = createAsyncThunk(
    "post/fetchPostDetail",
    async (postId: string, { rejectWithValue }) => {
        try {
            const res = await postService.getPostDetail(postId);
            if (!res.data.isSuccess) {
                return rejectWithValue(res.data.message ?? "Failed to fetch post detail");
            }
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
            if (!res.data.isSuccess) {
                return rejectWithValue(res.data.message ?? "Failed to fetch posts");
            }
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to fetch posts");
        }
    }
);

export const updatePostContent = createAsyncThunk(
    "post/updatePostContent",
    async (
        { postId, data }: { postId: string; data: UpdatePostContentRequest },
        { rejectWithValue }
    ) => {
        try {
            const res = await postService.updatePostContent(postId, data);
            if (!res.data.isSuccess) {
                return rejectWithValue(res.data.message ?? "Failed to update post");
            }
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
            if (!res.data.isSuccess) {
                return rejectWithValue(res.data.message ?? "Failed to archive post");
            }
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
            if (!res.data.isSuccess) {
                return rejectWithValue(res.data.message ?? "Failed to submit post");
            }
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
            if (!res.data.isSuccess) {
                return rejectWithValue(res.data.message ?? "Failed to publish post");
            }
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
            if (!res.data.isSuccess) {
                return rejectWithValue(res.data.message ?? "Failed to generate AI content");
            }
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
            if (!res.data.isSuccess) {
                return rejectWithValue(res.data.message ?? "Failed to create post draft");
            }
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message ?? "Failed to create post draft");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        clearPostDetail(state) {
            state.postDetail = null;
        },
        clearGeneratedDraft(state) {
            state.generatedDraft = null;
        },
        clearCreatedPostId(state) {
            state.createdPostId = null;
        },
        clearPostList(state) {
            state.posts = [];
            state.pagination = null;
        },
        setPostFilters(state, action: PayloadAction<Partial<GetPostsParams>>) {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetPostFilters(state) {
            state.filters = initialState.filters;
        },
        clearErrors(state) {
            state.error = initialState.error;
        },
    },
    extraReducers: (builder) => {
        // ── fetchPostDetail ──────────────────────────────────────────────────
        builder
            .addCase(fetchPostDetail.pending, (state) => {
                state.loading.fetchDetail = true;
                state.error.fetchDetail = null;
            })
            .addCase(fetchPostDetail.fulfilled, (state, action: PayloadAction<PostDetail>) => {
                state.loading.fetchDetail = false;
                state.postDetail = action.payload;
            })
            .addCase(fetchPostDetail.rejected, (state, action) => {
                state.loading.fetchDetail = false;
                state.error.fetchDetail = action.payload as string;
            });

        // ── updatePostContent ────────────────────────────────────────────────
        builder
            .addCase(updatePostContent.pending, (state) => {
                state.loading.updateContent = true;
                state.error.updateContent = null;
            })
            .addCase(updatePostContent.fulfilled, (state, action: PayloadAction<UpdatePostContentRequest>) => {
                state.loading.updateContent = false;
                if (state.postDetail) {
                    const { imageUrl, ...rest } = action.payload;
                    state.postDetail = {
                        ...state.postDetail,
                        ...rest
                    };
                }
            })
            .addCase(updatePostContent.rejected, (state, action) => {
                state.loading.updateContent = false;
                state.error.updateContent = action.payload as string;
            });

        // ── archivePost ──────────────────────────────────────────────────────
        builder
            .addCase(archivePost.pending, (state) => {
                state.loading.archive = true;
                state.error.archive = null;
            })
            .addCase(archivePost.fulfilled, (state) => {
                state.loading.archive = false;
                state.postDetail = null;
            })
            .addCase(archivePost.rejected, (state, action) => {
                state.loading.archive = false;
                state.error.archive = action.payload as string;
            });

        // ── requestToSubmitPost ──────────────────────────────────────────────
        builder
            .addCase(requestToSubmitPost.pending, (state) => {
                state.loading.submitPost = true;
                state.error.submitPost = null;
            })
            .addCase(requestToSubmitPost.fulfilled, (state) => {
                state.loading.submitPost = false;
                if (state.postDetail) {
                    state.postDetail.canSubmit = false;
                }
            })
            .addCase(requestToSubmitPost.rejected, (state, action) => {
                state.loading.submitPost = false;
                state.error.submitPost = action.payload as string;
            });

        builder
            .addCase(fetchOrganizerPosts.pending, (state) => {
                state.loading.fetchList = true;
                state.error.fetchList = null;
            })
            .addCase(fetchOrganizerPosts.fulfilled, (state, action: PayloadAction<PaginatedResponse<PostListItem>>) => {
                state.loading.fetchList = false;
                const { items, ...pagination } = action.payload;
                state.posts = items;
                state.pagination = pagination;
            })
            .addCase(fetchOrganizerPosts.rejected, (state, action) => {
                state.loading.fetchList = false;
                state.error.fetchList = action.payload as string;
            });

        // ── publishApprovedPost ──────────────────────────────────────────────
        builder
            .addCase(publishApprovedPost.pending, (state) => {
                state.loading.publishPost = true;
                state.error.publishPost = null;
            })
            .addCase(publishApprovedPost.fulfilled, (state) => {
                state.loading.publishPost = false;
                if (state.postDetail) {
                    state.postDetail.canPublish = false;
                    state.postDetail.status = "Published";
                }
            })
            .addCase(publishApprovedPost.rejected, (state, action) => {
                state.loading.publishPost = false;
                state.error.publishPost = action.payload as string;
            });

        // ── generateContentPostUsingAI ───────────────────────────────────────
        builder
            .addCase(generateContentPostUsingAI.pending, (state) => {
                state.loading.generateAI = true;
                state.error.generateAI = null;
                state.generatedDraft = null;
            })
            .addCase(generateContentPostUsingAI.fulfilled, (state, action: PayloadAction<GenerateContentPostDraftUsingAIDetail>) => {
                state.loading.generateAI = false;
                state.generatedDraft = action.payload;
            })
            .addCase(generateContentPostUsingAI.rejected, (state, action) => {
                state.loading.generateAI = false;
                state.error.generateAI = action.payload as string;
            });

        // ── createPostDraft ──────────────────────────────────────────────────
        builder
            .addCase(createPostDraft.pending, (state) => {
                state.loading.createDraft = true;
                state.error.createDraft = null;
                state.createdPostId = null;
            })
            .addCase(createPostDraft.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading.createDraft = false;
                state.createdPostId = action.payload;
            })
            .addCase(createPostDraft.rejected, (state, action) => {
                state.loading.createDraft = false;
                state.error.createDraft = action.payload as string;
            });
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
} = postSlice.actions;
export default postSlice.reducer;