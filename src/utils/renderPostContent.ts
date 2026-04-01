import type { ContentBlock } from "../types/post/post";

export function parseBodyToBlocks(body: string): ContentBlock[] {
    try {
        const parsed = JSON.parse(body);
        if (Array.isArray(parsed)) return parsed as ContentBlock[];
        return [];
    } catch {
        return [];
    }
}

export function serializeBlocksToBody(blocks: ContentBlock[]): string {
    return JSON.stringify(blocks);
}