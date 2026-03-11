import type { AxiosResponse } from "axios";
import type { CreateHashtagRequest, GetAllHashtagsResponse, GetHashtagByIdResponse } from "../types/hashtag/hashtag";
import API from "./api";

const hashtagService = {
    createHashtag: (data: CreateHashtagRequest): Promise<AxiosResponse<any>> => {
        return API.call().post("/hashtags", data);
    },
    getAllHashtags: (): Promise<AxiosResponse<GetAllHashtagsResponse>> => {
        return API.call().get("/hashtags");
    },
    getHashtagById: (id: number): Promise<AxiosResponse<GetHashtagByIdResponse>> => {
        return API.call().get(`/hashtags/${id}`);
    },
}

export default hashtagService