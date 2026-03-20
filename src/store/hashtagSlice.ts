import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import hashtagService from "../services/hashtagService";
import type { Hashtag, CreateHashtagRequest, GetAllHashtagsResponse, GetHashtagByIdResponse } from "../types/hashtag/hashtag";

const name = "hashtag";

interface HashtagState {
    hashtags: Hashtag[];
    currentHashtag: Hashtag | null;
}

const initialState: HashtagState = {
    hashtags: [],
    currentHashtag: null
};

export const fetchAllHashtags = createAsyncThunk<
    GetAllHashtagsResponse,
    { name?: string; take?: number } | undefined
>(
    `${name}/fetchAllHashtags`,
    async (params, thunkAPI) => {
        try {
            const response = await hashtagService.getAllHashtags(
                params?.name,
                params?.take
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchHashtagById = createAsyncThunk<
    GetHashtagByIdResponse,
    number
>(
    `${name}/fetchHashtagById`,
    async (id, thunkAPI) => {
        try {
            const response = await hashtagService.getHashtagById(id);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchCreateHashtag = createAsyncThunk<
    Hashtag,
    CreateHashtagRequest
>(
    `${name}/fetchCreateHashtag`,
    async (data, thunkAPI) => {
        try {
            const createResp = await hashtagService.createHashtag(data);
            // API may return an ApiResponse<number> or plain number
            const respData: any = createResp?.data;
            let newId: number;
            if (respData && typeof respData === 'object' && ('data' in respData)) {
                newId = respData.data as number;
            } else {
                newId = respData as number;
            }
            const detailResp = await hashtagService.getHashtagById(newId);
            return detailResp.data.data as Hashtag;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUpdateHashtag = createAsyncThunk<
    void,
    { id: number; data: Partial<CreateHashtagRequest> }
>(
    `${name}/fetchUpdateHashtag`,
    async (params, thunkAPI) => {
        try {
            const resp = await hashtagService.updateHashtag(params.id, params.data);
            return resp.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchDeleteHashtag = createAsyncThunk<
    void,
    number
>(
    `${name}/fetchDeleteHashtag`,
    async (id, thunkAPI) => {
        try {
            const resp = await hashtagService.deleteHashtag(id);
            return resp.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const hashtagSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchAllHashtags.fulfilled, (state, action: PayloadAction<GetAllHashtagsResponse>) => {
            state.hashtags = action.payload.data;
        });

        builder.addCase(fetchHashtagById.fulfilled, (state, action: PayloadAction<GetHashtagByIdResponse>) => {
            state.currentHashtag = action.payload.data;
        });

        builder.addCase(fetchCreateHashtag.fulfilled, (state, action: PayloadAction<Hashtag>) => {
            const created = action.payload;
            const exists = state.hashtags.find(h => h.id === created.id);
            if (!exists) state.hashtags = [created, ...state.hashtags];
        });

        builder.addCase(fetchUpdateHashtag.fulfilled, () => {
            // UI will re-fetch list if needed
        });

        builder.addCase(fetchDeleteHashtag.fulfilled, () => {
            // UI will re-fetch list
        });
    }
});

export default hashtagSlice.reducer;
