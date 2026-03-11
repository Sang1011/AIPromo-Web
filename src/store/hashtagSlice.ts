import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import hashtagService from "../services/hashtagService";
import type {
    CreateHashtagRequest,
    Hashtag,
    GetAllHashtagsResponse,
    GetHashtagByIdResponse
} from "../types/hashtag/hashtag";

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
    GetAllHashtagsResponse
>(
    `${name}/fetchAllHashtags`,
    async (_, thunkAPI) => {
        try {
            const response = await hashtagService.getAllHashtags();
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
    any,
    CreateHashtagRequest
>(
    `${name}/fetchCreateHashtag`,
    async (data, thunkAPI) => {
        try {
            const response = await hashtagService.createHashtag(data);
            return response.data;
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
        builder.addCase(
            fetchAllHashtags.fulfilled,
            (state, action: PayloadAction<GetAllHashtagsResponse>) => {
                state.hashtags = action.payload;
            }
        );

        builder.addCase(
            fetchHashtagById.fulfilled,
            (state, action: PayloadAction<GetHashtagByIdResponse>) => {
                state.currentHashtag = action.payload;
            }
        );

        builder.addCase(fetchCreateHashtag.fulfilled, (state, action) => {
            if (action.payload?.data) {
                state.hashtags.push(action.payload.data);
            }
        });
    },
});

export default hashtagSlice.reducer;