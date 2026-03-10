import type { AxiosResponse } from "axios";
import type { CreateHashtagRequest, GetAllHashtagsResponse, GetHashtagByIdResponse } from "../types/hashtag/hashtag";
import API from "./api";

const hashtagService = {
    createHashtag: (data: CreateHashtagRequest): Promise<AxiosResponse<number>> => {
        return API.call().post("/hashtags", data);
    },
    getAllHashtags: (
        name?: string,
        take?: number
    ): Promise<AxiosResponse<GetAllHashtagsResponse>> => {
        const params: any = {};

        if (name) params.name = name;
        if (take) params.take = take;

        return API.call().get("/hashtags", { params });
    },
    getHashtagById: (id: number): Promise<AxiosResponse<GetHashtagByIdResponse>> => {
        return API.call().get(`/hashtags/${id}`);
    },
}

export default hashtagService