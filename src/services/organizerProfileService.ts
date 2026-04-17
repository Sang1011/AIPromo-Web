import type { AxiosResponse } from "axios";
import type {
    CreateProfileOrganizerRequest,
    GetOrganizerProfileResponse,
    OrganizerProfileDetail,
    GetPendingOrganizersResponse,
} from "../types/organizerProfile/organizerProfile";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { ApiResponse } from "../types/api";

const organizerProfileService = {
    getProfile: (): Promise<AxiosResponse<GetOrganizerProfileResponse>> => {
        return interceptorAPI().get("/organizer/me");
    },
    updateOrganizerDraftLogo: (userId: string, file: File): Promise<AxiosResponse<ApiResponse<string>>> => {
        const formData = new FormData();
        formData.append("file", file);

        return interceptorAPI().patch(`/organizers/${userId}/logo`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    getOrganizerProfileDetailById: (userId: string): Promise<AxiosResponse<ApiResponse<OrganizerProfileDetail>>> => {
        return interceptorAPI().get(`/organizers/detail/${userId}`);
    },
    createProfile: (data: CreateProfileOrganizerRequest): Promise<AxiosResponse<any>> => {
        const formData = new FormData();

        if (data.logoFile) {
            formData.append("logoFile", data.logoFile);
        }
        if (data.logo) {
            formData.append("logo", data.logo);
        }

        formData.append("type", data.type);
        formData.append("displayName", data.displayName);
        formData.append("description", data.description);
        formData.append("address", data.address);
        formData.append("socialLink", data.socialLink);
        formData.append("businessType", data.businessType);
        formData.append("taxCode", data.taxCode);
        formData.append("identityNumber", data.identityNumber);
        formData.append("companyName", data.companyName);
        formData.append("accountName", data.accountName);
        formData.append("accountNumber", data.accountNumber);
        formData.append("bankCode", data.bankCode);
        formData.append("branch", data.branch);

        return interceptorAPI().post("/organizer/profile/start-or-update", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    verifyProfile: (): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post(`/organizers/submit`)
    },
    getPendingOrganizers: (params: {
        PageNumber: number;
        PageSize: number;
        SortColumn: string;
        SortOrder: string;
        Keyword?: string;
        BusinessType?: string;
    }): Promise<AxiosResponse<GetPendingOrganizersResponse>> => {
        return interceptorAPI().get("/admin/organizers/pending", { params });
    },
    getOrganizerDetail: (userId: string): Promise<AxiosResponse<ApiResponse<OrganizerProfileDetail>>> => {
        return interceptorAPI().get(`/organizers/detail/${userId}`);
    },
    verifyOrganizer: (userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
        return interceptorAPI().post("/admin/organizers/verify", { userId });
    },
    rejectOrganizer: (data: { userId: string; reason: string }): Promise<AxiosResponse<ApiResponse<any>>> => {
        return interceptorAPI().post("/admin/organizers/reject", data);
    }
};

export default organizerProfileService;