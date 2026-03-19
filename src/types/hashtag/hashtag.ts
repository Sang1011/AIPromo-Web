import type { ApiResponse } from "../api";

export interface Hashtag {
    id: number;
    name: string;
    slug: string;
    usageCount: number;
    createdAt?: string;
}

export interface CreateHashtagRequest extends Pick<Hashtag, "name"> { }

export type GetAllHashtagsResponse = ApiResponse<Hashtag[]>;
export type GetHashtagByIdResponse = ApiResponse<Hashtag>;

// export interface UpdateHashtagRequest extends CreateHashtagRequest {}
