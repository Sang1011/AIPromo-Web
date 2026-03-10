import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import categoryService from "../services/categoryService";
import type {
    Category,
    CreateCategoryRequest,
    GetAllCategoriesResponse,
    GetCategoryByIdResponse
} from "../types/category/category";

const name = "category";

interface CategoryState {
    categories: Category[];
    currentCategory: Category | null;
}

const initialState: CategoryState = {
    categories: [],
    currentCategory: null
};

export const fetchAllCategories = createAsyncThunk<
    GetAllCategoriesResponse
>(
    `${name}/fetchAllCategories`,
    async (_, thunkAPI) => {
        try {
            const response = await categoryService.getAllCategories();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchCategoryById = createAsyncThunk<
    GetCategoryByIdResponse,
    number
>(
    `${name}/fetchCategoryById`,
    async (id, thunkAPI) => {
        try {
            const response = await categoryService.getCategoryById(id);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchCreateCategory = createAsyncThunk<
    any,
    CreateCategoryRequest
>(
    `${name}/fetchCreateCategory`,
    async (data, thunkAPI) => {
        try {
            const response = await categoryService.createCategory(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const categorySlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            fetchAllCategories.fulfilled,
            (state, action: PayloadAction<GetAllCategoriesResponse>) => {
                state.categories = action.payload;
            }
        );

        builder.addCase(
            fetchCategoryById.fulfilled,
            (state, action: PayloadAction<GetCategoryByIdResponse>) => {
                state.currentCategory = action.payload;
            }
        );

        builder.addCase(fetchCreateCategory.fulfilled, (state, action) => {
            if (action.payload?.data) {
                state.categories.push(action.payload.data);
            }
        });
    },
});

export default categorySlice.reducer;