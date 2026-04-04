import { usePostFont } from "../../../hooks/usePostFont";
import type { ContentBlock } from "../../../types/post/post";

interface Props {
    blocks: ContentBlock[];
    className?: string;
}

export default function PostBlockRenderer({ blocks, className = "" }: Props) {
    usePostFont();
    return (
        <div className={`space-y-3 font-sans ${className}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {blocks.map((block, i) => (
                <BlockItem key={i} block={block} />
            ))}
        </div>
    );
}

function BlockItem({ block }: { block: ContentBlock }) {
    switch (block.type) {
        case "heading": {
            if (block.level === 1) return (
                <h1 style={{ fontFamily: "'Playfair Display', serif" }}
                    className="text-4xl font-black text-white leading-tight tracking-tight mb-5">
                    {block.text}
                </h1>
            );
            if (block.level === 2) return (
                <h2 style={{ fontFamily: "'Playfair Display', serif" }}
                    className="text-2xl font-bold text-white mt-8 mb-3
                               pl-3.5 border-l-[3px] border-primary">
                    {block.text}
                </h2>
            );
            return (
                <h3 className="text-[0.75rem] font-semibold text-violet-400 uppercase
                               tracking-widest mt-6 mb-2">
                    {block.text}
                </h3>
            );
        }

        case "paragraph":
            return (
                <p className="text-[0.93rem] text-slate-400 leading-[1.85] break-words">
                    {block.text}
                </p>
            );

        case "image":
            if (!block.src) return null;
            return (
                <figure className="rounded-2xl overflow-hidden border border-indigo-950 my-4">
                    <img src={block.src} alt={block.alt ?? ""}
                        className="w-full object-cover max-h-80" />
                    {block.alt && (
                        <figcaption className="text-xs text-slate-500 px-4 py-2 bg-[#18122B]">
                            {block.alt}
                        </figcaption>
                    )}
                </figure>
            );

        case "button":
            return (
                <div className="flex justify-center py-5">
                    <a href={block.href ?? "#"} target="_blank" rel="noopener noreferrer"
                        className="px-10 py-3 rounded-full font-semibold text-sm text-white
                                  transition-opacity hover:opacity-85"
                        style={{ background: "linear-gradient(135deg, #7c3bed, #a855f7)" }}>
                        {block.label ?? "Xem thêm"}
                    </a>
                </div>
            );

        case "list": {
            const items = block.items ?? [];
            return (
                <div className="flex flex-col gap-2 my-1">
                    {items.map((item, i) => (
                        <div key={i}
                            className="relative pl-9 pr-3 py-2 text-[0.92rem] text-slate-400
                                        leading-[1.7] bg-[#13112a] rounded-lg">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2
                                             w-1.5 h-1.5 rounded-full bg-primary" />
                            {block.ordered && (
                                <span className="absolute left-3 top-2 text-primary
                                                 font-bold text-xs">{i + 1}.</span>
                            )}
                            {item}
                        </div>
                    ))}
                </div>
            );
        }

        case "divider":
            return (
                <hr className="border-none h-px my-6"
                    style={{ background: "linear-gradient(90deg, transparent, #2d1f6e, transparent)" }} />
            );

        case "highlight":
            return (
                <blockquote className="bg-[#180f33] border-l-[3px] border-primary
                                       rounded-r-2xl px-5 py-4 my-4 text-[0.92rem]
                                       italic text-violet-300 leading-[1.75]">
                    {block.content}
                </blockquote>
            );

        default:
            return null;
    }
}