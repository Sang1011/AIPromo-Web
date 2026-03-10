import type { AxiosResponse } from "axios";
import type { CreateCategoryRequest, GetAllCategoriesResponse, GetCategoryByIdResponse } from "../types/category/category";
import API from "./api";

const categoryService = {
    createCategory: (data: CreateCategoryRequest): Promise<AxiosResponse<number>> => {
        return API.call().post("/categories", data);
    },
    getAllCategories: (
        name?: string,
        take?: number
    ): Promise<AxiosResponse<GetAllCategoriesResponse>> => {
        const params: any = {};

        if (name) params.name = name;
        if (take) params.take = take;

        return API.call().get("/categories", { params });
    },
    getCategoryById: (id: number): Promise<AxiosResponse<GetCategoryByIdResponse>> => {
        return API.call().get(`/categories/${id}`);
    },
}

export default categoryService