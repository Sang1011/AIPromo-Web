// src/services/userService.ts
import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { GetAllUsersRequest, GetAllUsersResponse, ApiResponse } from "../types/user/user";

export interface CreateUserRequest {
    email: string;
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    role: string;
}

const userService = {
    getAllUsers: (request: GetAllUsersRequest = {}): Promise<AxiosResponse<ApiResponse<GetAllUsersResponse>>> => {
        // Luôn bổ sung Dir và SortColumn để tránh lỗi "Required parameter 'Dir' was not provided"
        const params = {
            PageNumber: request.PageNumber ?? 1,
            PageSize: request.PageSize ?? 10,
            SortColumn: request.SortColumn ?? "userId",
            Dir: request.Dir ?? "desc",
            ...request,
        };

        return interceptorAPI().get("/users", {
            params,
        });
    },
    
    createStaffUser: (request: CreateUserRequest): Promise<AxiosResponse<ApiResponse<any>>> => {
        const formData = new FormData();
        formData.append("email", request.email);
        formData.append("userName", request.userName);
        formData.append("password", request.password);
        formData.append("firstName", request.firstName);
        formData.append("lastName", request.lastName);
        formData.append("phoneNumber", request.phoneNumber);
        formData.append("address", request.address);
        formData.append("role", request.role);

        return interceptorAPI().post("/admin/user/create", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

export default userService;