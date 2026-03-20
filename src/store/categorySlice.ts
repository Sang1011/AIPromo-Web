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
    GetAllCategoriesResponse,
    { name?: string; take?: number }
>(
    `${name}/fetchAllCategories`,
    async (params, thunkAPI) => {
        try {
            const response = await categoryService.getAllCategories(
                params?.name,
                params?.take
            );
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
    number,
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

export const fetchUpdateCategory = createAsyncThunk<
    void,
    { id: number; data: Partial<CreateCategoryRequest> }
>(
    `${name}/fetchUpdateCategory`,
    async (params, thunkAPI) => {
        try {
            const response = await categoryService.updateCategory(params.id, params.data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchToggleCategoryStatus = createAsyncThunk<
    void,
    { id: number; activate: boolean }
>(
    `${name}/fetchToggleCategoryStatus`,
    async (params, thunkAPI) => {
        try {
            const response = await categoryService.toggleCategoryStatus(params.id, params.activate);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchDeleteCategory = createAsyncThunk<
    void,
    number
>(
    `${name}/fetchDeleteCategory`,
    async (id, thunkAPI) => {
        try {
            const response = await categoryService.deleteCategory(id);
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
                state.categories = action.payload.data;
            }
        );

        builder.addCase(
            fetchCategoryById.fulfilled,
            (state, action: PayloadAction<GetCategoryByIdResponse>) => {
                state.currentCategory = action.payload.data;
            }
        );

        builder.addCase(
            fetchUpdateCategory.fulfilled,
            () => {
                // after successful update we'll rely on UI to re-fetch list or fetchCategoryById
            }
        );

        builder.addCase(
            fetchToggleCategoryStatus.fulfilled,
            () => {
                // no-op: UI will re-fetch
            }
        );
        builder.addCase(
            fetchDeleteCategory.fulfilled,
            () => {
                // UI will re-fetch
            }
        );

    },
});

export default categorySlice.reducer;