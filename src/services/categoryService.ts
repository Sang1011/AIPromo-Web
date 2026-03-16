import type { AxiosResponse } from "axios";
import type { CreateCategoryRequest, GetAllCategoriesResponse, GetCategoryByIdResponse } from "../types/category/category";
import { interceptorAPI } from "../utils/attachInterceptors";

const categoryService = {
    createCategory: (data: CreateCategoryRequest): Promise<AxiosResponse<number>> => {
        return interceptorAPI().post("/categories", data);
    },
    getAllCategories: (
        name?: string,
        take?: number
    ): Promise<AxiosResponse<GetAllCategoriesResponse>> => {
        const params: any = {};
        if (name) params.name = name;
        if (take) params.take = take;
        return interceptorAPI().get("/categories", { params });
    },
    getCategoryById: (id: number): Promise<AxiosResponse<GetCategoryByIdResponse>> => {
        return interceptorAPI().get(`/categories/${id}`);
    },
    updateCategory: (id: number, data: { code?: string; name?: string; description?: string }): Promise<AxiosResponse<void>> => {
        return interceptorAPI().put(`/categories/${id}`, data);
    },
}

export default categoryService