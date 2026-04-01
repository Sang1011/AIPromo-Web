import type { ContentBlock } from "../../../types/post/post";


interface Props {
    blocks: ContentBlock[];
    className?: string;
}

export default function PostBlockRenderer({ blocks, className = "" }: Props) {
    return (
        <div className={`space-y-4 ${className}`}>
            {blocks.map((block, i) => (
                <BlockItem key={i} block={block} />
            ))}
        </div>
    );
}

function BlockItem({ block }: { block: ContentBlock }) {
    switch (block.type) {
        case "heading": {
            const base = "font-bold text-white leading-snug";
            if (block.level === 1) return <h1 className={`text-3xl ${base}`}>{block.text}</h1>;
            if (block.level === 2) return <h2 className={`text-2xl ${base}`}>{block.text}</h2>;
            return <h3 className={`text-xl ${base}`}>{block.text}</h3>;
        }

        case "paragraph":
            return (
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {block.text}
                </p>
            );

        case "image":
            if (!block.src) return null;
            return (
                <div className="rounded-2xl overflow-hidden border border-slate-800">
                    <img
                        src={block.src}
                        alt={block.alt ?? ""}
                        className="w-full object-cover max-h-96"
                    />
                </div>
            );

        case "button":
            return (
                <div className="flex justify-center pt-2">
                    <a
                        href={block.href ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary hover:bg-primary/90 text-white
                                   font-bold px-8 py-3 rounded-2xl text-sm transition-all
                                   neon-button-glow"
                    >
                        {block.label ?? "Xem thêm"}
                    </a>
                </div >
            );

        case "list":
            return block.ordered ? (
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-sm pl-2">
                    {block.items?.map((item, i) => <li key={i}>{item}</li>)}
                </ol>
            ) : (
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm pl-2">
                    {block.items?.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            );

        case "divider":
            return <hr className="border-slate-700 my-2" />;

        case "highlight":
            return (
                <blockquote className="border-l-4 border-primary bg-primary/10
                                        rounded-r-xl px-4 py-3 text-slate-200
                                        text-sm italic leading-relaxed">
                    {block.content}
                </blockquote>
            );

        default:
            return null;
    }
}