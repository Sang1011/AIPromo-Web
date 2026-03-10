import type { ApiResponse } from "../api";

export interface Hashtag {
    id: number;
    name: string;
    slug: string;
    usageCount: number;
}

export interface CreateHashtagRequest extends Omit<Hashtag, "id" | "usageCount"> {
}

export type GetAllHashtagsResponse = ApiResponse<Hashtag[]>;
export type GetHashtagByIdResponse = ApiResponse<Hashtag>;

// export interface UpdateHashtagRequest extends Pick<CreateHashtagRequest, "name"> {}