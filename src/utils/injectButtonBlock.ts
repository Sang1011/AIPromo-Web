import type { ContentBlock } from "../types/post/post";

export function injectButtonBlock(
    blocks: ContentBlock[],
    href: string | null,
    label = "Đặt vé ngay!",
    insertAt?: number,
): ContentBlock[] {
    if (!href) return blocks;

    const buttonBlock: ContentBlock = { type: "button", label, href };

    const existingIdx = blocks.findIndex((b) => b.type === "button");
    if (existingIdx !== -1) {
        const result = [...blocks];
        result[existingIdx] = buttonBlock;
        return result;
    }

    if (insertAt !== undefined) {
        const clamped = Math.max(0, Math.min(insertAt, blocks.length));
        return [...blocks.slice(0, clamped), buttonBlock, ...blocks.slice(clamped)];
    }

    // Default: append to end
    return [...blocks, buttonBlock];
}