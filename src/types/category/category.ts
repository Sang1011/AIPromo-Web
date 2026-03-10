export interface Category {
    id: number;
    code: string;
    name: string;
    description: string;
    isActive: boolean;
}

export type GetAllCategoriesResponse = Category[];
export type GetCategoryByIdResponse = Category;

export interface CreateCategoryRequest extends Omit<Category, "id" | "isActive"> { }

// export interface UpdateCategoryRequest extends Pick<CreateCategoryRequest, "name" | "description"> { }