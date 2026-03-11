export interface Hashtag {
    id: number;
    name: string;
    slug: string;
    usageCount: number;
}

export interface CreateHashtagRequest extends Omit<Hashtag, "id" | "usageCount"> {
}

export type GetAllHashtagsResponse = Hashtag[];
export type GetHashtagByIdResponse = Hashtag;

// export interface UpdateHashtagRequest extends Pick<CreateHashtagRequest, "name"> {}