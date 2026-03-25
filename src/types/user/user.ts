export interface UserItem {
    userId: string;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    birthday: string | null;
    gender: string | null;
    phoneNumber: string;
    address: string | null;
    description: string | null;
    socialLink: string | null;
    profileImageUrl: string | null;
    status: "Active" | "Inactive" | "Banned";
    roles: string[];
}

export interface GetAllUsersRequest {
    Email?: string;
    UserName?: string;
    FirstName?: string;
    LastName?: string;
    BirthdayFrom?: string;
    BirthdayTo?: string;
    Gender?: "Male" | "Female" | "Other";
    PhoneNumber?: string;
    Status?: "Active" | "Inactive" | "Banned";
    PageNumber?: number;
    PageSize?: number;
    SortColumn?: string;
    Dir?: "asc" | "desc";  
}

export interface GetAllUsersResponse {
    items: UserItem[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    currentPageSize: number;
    currentStartIndex: number;
    currentEndIndex: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export type ApiResponse<T> = {
    isSuccess: boolean;
    data: T;
    message: string;
    timestamp: string;
};