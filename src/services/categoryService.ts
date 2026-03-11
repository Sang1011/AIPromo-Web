import type { AxiosResponse } from "axios";
import type { CreateCategoryRequest, GetAllCategoriesResponse, GetCategoryByIdResponse } from "../types/category/category";
import API from "./api";

const categoryService = {
    createCategory: (data: CreateCategoryRequest): Promise<AxiosResponse<any>> => {
        return API.call().post("/categories", data);
    },
    getAllCategories: (): Promise<AxiosResponse<GetAllCategoriesResponse>> => {
        return API.call().get("/categories");
    },
    getCategoryById: (id: number): Promise<AxiosResponse<GetCategoryByIdResponse>> => {
        return API.call().get(`/categories/${id}`);
    },
}

export default categoryService