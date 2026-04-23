import type { ContentBlock } from "../types/post/post";

export function injectImageBlock(
    blocks: ContentBlock[],
    imageUrl: string | null,
    insertAt?: number,         // ← vị trí inject, ưu tiên hơn logic tự tìm heading
): ContentBlock[] {
    if (!imageUrl) return blocks;

    const imageBlock: ContentBlock = { type: "image", src: imageUrl, alt: "Post image" };

    const existingIdx = blocks.findIndex((b) => b.type === "image");
    if (existingIdx !== -1) {
        const result = [...blocks];
        result[existingIdx] = imageBlock;
        return result;
    }

    if (insertAt !== undefined) {
        const clamped = Math.max(0, Math.min(insertAt, blocks.length));
        return [...blocks.slice(0, clamped), imageBlock, ...blocks.slice(clamped)];
    }

    const headingIdx = blocks.findIndex((b) => b.type === "heading");
    const pos = headingIdx !== -1 ? headingIdx + 1 : 0;
    return [...blocks.slice(0, pos), imageBlock, ...blocks.slice(pos)];
}