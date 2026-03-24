// src/services/userService.ts
import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { GetAllUsersRequest, GetAllUsersResponse, ApiResponse } from "../types/user/user";

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
};

export default userService;