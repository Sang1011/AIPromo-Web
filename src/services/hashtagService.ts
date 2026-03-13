import type { AxiosResponse } from "axios";
import type { CreateHashtagRequest, GetAllHashtagsResponse, GetHashtagByIdResponse } from "../types/hashtag/hashtag";
import { interceptorAPI } from "../utils/attachInterceptors";

const hashtagService = {
    createHashtag: (data: CreateHashtagRequest): Promise<AxiosResponse<number>> => {
        return interceptorAPI().post("/hashtags", data);
    },
    getAllHashtags: (
        name?: string,
        take?: number
    ): Promise<AxiosResponse<GetAllHashtagsResponse>> => {
        const params: any = {};

        if (name) params.name = name;
        if (take) params.take = take;

        return interceptorAPI().get("/hashtags", { params });
    },
    getHashtagById: (id: number): Promise<AxiosResponse<GetHashtagByIdResponse>> => {
        return interceptorAPI().get(`/hashtags/${id}`);
    },
}

export default hashtagService