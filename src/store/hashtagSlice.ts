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
    any,
    { name?: string; take?: number }
>(
    `${name}/fetchAllHashtags`,
    async (params, thunkAPI) => {
        try {
            const response = await hashtagService.getAllHashtags(
                params?.name,
                params?.take
            );
            return response.data.data;
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
    number,
    CreateHashtagRequest
>(
    `${name}/fetchCreateHashtag`,
    async (data, thunkAPI) => {
        try {
            const response = await hashtagService.createHashtag(data);
            console.log("Created Hashtag ID:", response);
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
                state.hashtags = action.payload.data;
            }
        );

        builder.addCase(
            fetchHashtagById.fulfilled,
            (state, action: PayloadAction<GetHashtagByIdResponse>) => {
                state.currentHashtag = action.payload.data;
            }
        );

    },
});

export default hashtagSlice.reducer;