import type { ContentBlock } from "../types/post/post";

export function injectImageBlock(blocks: ContentBlock[], imageUrl: string | null): ContentBlock[] {
    if (!imageUrl) return blocks;

    const imageBlock: ContentBlock = { type: "image", src: imageUrl, alt: "Post image" };
    const existingIdx = blocks.findIndex((b) => b.type === "image");
    if (existingIdx !== -1) {
        const result = [...blocks];
        result[existingIdx] = imageBlock;
        return result;
    }

    const headingIdx = blocks.findIndex((b) => b.type === "heading");
    const insertAt = headingIdx !== -1 ? headingIdx + 1 : 0;
    return [...blocks.slice(0, insertAt), imageBlock, ...blocks.slice(insertAt)];
}