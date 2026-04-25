import {
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useState } from "react";
import {
    MdOutlineAdd,
    MdOutlineClose,
    MdOutlineDragIndicator,
    MdOutlineFormatListBulleted,
    MdOutlineFormatListNumbered,
    MdOutlineFormatQuote,
    MdOutlineHorizontalRule,
    MdOutlineImage,
    MdOutlineTitle,
    MdOutlineTextFields,
} from "react-icons/md";
import type { ContentBlock } from "../../../types/post/post";
import { saveImagePosition } from "../../../utils/postImagePosition";
import { validateImageFile } from "../../../utils/validateImageFile";
import { notify } from "../../../utils/notify";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlockWithId extends ContentBlock {
    _id: string;
}

interface BlockEditorProps {
    initialBlocks?: ContentBlock[];
    onChange?: (blocks: ContentBlock[]) => void;
    editorRef?: React.MutableRefObject<{ getBlocks: () => ContentBlock[] } | null>;
    postId?: string;

    /**
     * disableImageBlock: true → ẩn nút "Ảnh" trong toolbar và không cho thêm image block.
     * Dùng cho AI Content tab vì ảnh được quản lý bởi UploadImageSection bên ngoài.
     * Default: false (Manual tab có thể thêm image block bình thường)
     */
    disableImageBlock?: boolean;

    /**
     * onImageChange: callback khi image block thay đổi (upload file hoặc clear).
     * Chỉ có ý nghĩa khi disableImageBlock = false (Manual tab).
     * Parent dùng callback này để track pendingFile + imageUrl mà không cần UploadImageSection riêng.
     * @param file - File object nếu user upload từ máy, null nếu xóa
     * @param url  - blob URL hoặc http URL, null nếu xóa
     */
    onImageChange?: (file: File | null, url: string | null) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _uid = 0;
function uid() { return `b_${++_uid}_${Date.now()}`; }

export function withId(block: ContentBlock): BlockWithId {
    return { ...block, _id: uid() };
}

function stripId(block: BlockWithId): ContentBlock {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = block;
    return rest;
}

function defaultBlock(type: ContentBlock["type"]): BlockWithId {
    switch (type) {
        case "heading": return withId({ type: "heading", level: 2, text: "" });
        case "paragraph": return withId({ type: "paragraph", text: "" });
        case "list": return withId({ type: "list", ordered: false, items: [""] });
        case "highlight": return withId({ type: "highlight", content: "" });
        case "divider": return withId({ type: "divider" });
        case "image": return withId({ type: "image", src: "" });
        default: return withId({ type: "paragraph", text: "" });
    }
}

// ─── Sortable Block Wrapper ────────────────────────────────────────────────────

function SortableBlockItem({
    block,
    onUpdate,
    onRemove,
    onUploadImage,
}: {
    block: BlockWithId;
    onUpdate: (id: string, updated: Partial<ContentBlock>) => void;
    onRemove: (id: string) => void;
    onUploadImage: (id: string, file: File) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: block._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative">
            <div className={`flex gap-2 items-start bg-slate-900/60 border rounded-2xl px-4 py-3 transition-all
                ${isDragging ? "border-primary/60 shadow-lg shadow-primary/10" : "border-slate-800 hover:border-slate-700"}`}>

                {/* Drag handle */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="mt-1 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition shrink-0 touch-none"
                    title="Kéo để sắp xếp"
                >
                    <MdOutlineDragIndicator className="text-lg" />
                </button>

                {/* Block content */}
                <div className="flex-1 min-w-0">
                    <BlockFieldEditor
                        block={block}
                        onUpdate={(patch) => onUpdate(block._id, patch)}
                        onUploadImage={(file) => onUploadImage(block._id, file)}
                    />
                </div>

                {/* Remove */}
                <button
                    type="button"
                    onClick={() => onRemove(block._id)}
                    className="mt-1 text-slate-600 hover:text-red-400 transition shrink-0"
                    title="Xóa block"
                >
                    <MdOutlineClose className="text-base" />
                </button>
            </div>
        </div>
    );
}

// ─── Block Field Editor ────────────────────────────────────────────────────────

function BlockFieldEditor({
    block,
    onUpdate,
    onUploadImage,
}: {
    block: BlockWithId;
    onUpdate: (patch: Partial<ContentBlock>) => void;
    onUploadImage: (file: File) => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);

    const inputCls =
        "w-full bg-transparent text-slate-100 placeholder:text-slate-600 text-sm outline-none resize-none leading-relaxed";

    switch (block.type) {
        case "heading":
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Heading</span>
                        {([1, 2, 3] as const).map((lvl) => (
                            <button
                                key={lvl}
                                type="button"
                                onClick={() => onUpdate({ level: lvl })}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold border transition-all
                                    ${block.level === lvl
                                        ? "bg-primary text-white border-primary"
                                        : "border-slate-700 text-slate-500 hover:border-primary/50 hover:text-slate-300"}`}
                            >
                                H{lvl}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={block.text ?? ""}
                        onChange={(e) => onUpdate({ text: e.target.value })}
                        placeholder={`Tiêu đề cấp ${block.level ?? 2}...`}
                        className={`${inputCls} font-bold text-base`}
                    />
                </div>
            );

        case "paragraph":
            return (
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Đoạn văn</span>
                    <textarea
                        rows={3}
                        value={block.text ?? ""}
                        onChange={(e) => onUpdate({ text: e.target.value })}
                        placeholder="Nội dung đoạn văn..."
                        className={inputCls}
                    />
                </div>
            );

        case "list": {
            const items = block.items ?? [""];
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Danh sách</span>
                        <button
                            type="button"
                            onClick={() => onUpdate({ ordered: false })}
                            className={`p-1 rounded-lg border transition-all
                                ${!block.ordered ? "bg-primary/20 border-primary/40 text-primary" : "border-slate-700 text-slate-500 hover:border-slate-600"}`}
                            title="Bullet list"
                        >
                            <MdOutlineFormatListBulleted className="text-sm" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onUpdate({ ordered: true })}
                            className={`p-1 rounded-lg border transition-all
                                ${block.ordered ? "bg-primary/20 border-primary/40 text-primary" : "border-slate-700 text-slate-500 hover:border-slate-600"}`}
                            title="Numbered list"
                        >
                            <MdOutlineFormatListNumbered className="text-sm" />
                        </button>
                    </div>
                    <div className="space-y-1.5">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="text-slate-600 text-xs w-4 text-right shrink-0">
                                    {block.ordered ? `${idx + 1}.` : "•"}
                                </span>
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                        const next = [...items];
                                        next[idx] = e.target.value;
                                        onUpdate({ items: next });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const next = [...items];
                                            next.splice(idx + 1, 0, "");
                                            onUpdate({ items: next });
                                        }
                                        if (e.key === "Backspace" && item === "" && items.length > 1) {
                                            const next = items.filter((_, i) => i !== idx);
                                            onUpdate({ items: next });
                                        }
                                    }}
                                    placeholder={`Mục ${idx + 1}...`}
                                    className={inputCls}
                                />
                                {items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => onUpdate({ items: items.filter((_, i) => i !== idx) })}
                                        className="text-slate-600 hover:text-red-400 transition shrink-0"
                                    >
                                        <MdOutlineClose className="text-xs" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => onUpdate({ items: [...items, ""] })}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition mt-1"
                        >
                            <MdOutlineAdd className="text-sm" />
                            Thêm mục
                        </button>
                    </div>
                </div>
            );
        }

        case "highlight":
            return (
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quote / Highlight</span>
                    <textarea
                        rows={2}
                        value={block.content ?? ""}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder="Trích dẫn hoặc nội dung nổi bật..."
                        className={`${inputCls} italic text-violet-300`}
                    />
                </div>
            );

        case "divider":
            return (
                <div className="flex items-center gap-3 py-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Divider</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                </div>
            );

        case "image":
            return (
                <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ảnh</span>
                    {block.src ? (
                        <div className="space-y-2">
                            <div className="rounded-xl overflow-hidden border border-slate-800">
                                <img src={block.src} alt={block.alt ?? ""} className="w-full max-h-48 object-cover" />
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center gap-2 py-6
                                       border-2 border-dashed border-slate-700 hover:border-primary/50
                                       rounded-xl text-slate-500 hover:text-slate-300 transition-all"
                        >
                            <MdOutlineImage className="text-2xl" />
                            <p className="text-xs">Nhấn để chọn ảnh</p>
                            <p className="text-[10px] text-slate-600">Tối đa 10MB</p>
                        </button>
                    )}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUploadImage(file);
                        }}
                    />
                </div>
            );

        default:
            return null;
    }
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

const TOOLBAR_ITEMS: {
    type: ContentBlock["type"];
    icon: React.ReactNode;
    label: string;
}[] = [
        { type: "heading", icon: <MdOutlineTitle />, label: "Tiêu đề" },
        { type: "paragraph", icon: <MdOutlineTextFields />, label: "Đoạn văn" },
        { type: "list", icon: <MdOutlineFormatListBulleted />, label: "Danh sách" },
        { type: "highlight", icon: <MdOutlineFormatQuote />, label: "Quote" },
        { type: "divider", icon: <MdOutlineHorizontalRule />, label: "Divider" },
        { type: "image", icon: <MdOutlineImage />, label: "Ảnh" },
    ];

// ─── Main BlockEditor ─────────────────────────────────────────────────────────

export default function BlockEditor({
    initialBlocks = [],
    onChange,
    editorRef,
    postId,
    disableImageBlock = false,
    onImageChange,
}: BlockEditorProps) {
    const [blocks, setBlocks] = useState<BlockWithId[]>(() =>
        initialBlocks.length > 0
            ? initialBlocks.map(withId)
            : [withId({ type: "heading", level: 1, text: "" }), withId({ type: "paragraph", text: "" })]
    );

    // Chỉ block image nếu đã có 1 rồi (dù disableImageBlock = false)
    const hasImageBlock = blocks.some((b) => b.type === "image");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const update = (newBlocks: BlockWithId[]) => {
        setBlocks(newBlocks);
        onChange?.(newBlocks.map(stripId));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = blocks.findIndex((b) => b._id === active.id);
        const newIndex = blocks.findIndex((b) => b._id === over.id);
        const newBlocks = arrayMove(blocks, oldIndex, newIndex);
        update(newBlocks);

        const draggedBlock = blocks[oldIndex];
        if (draggedBlock?.type === "image" && postId) {
            saveImagePosition(postId, newIndex).catch(console.error);
        }
    };

    const handleAdd = (type: ContentBlock["type"]) => {
        update([...blocks, defaultBlock(type)]);
    };

    const handleUpdate = (id: string, patch: Partial<ContentBlock>) => {
        update(blocks.map((b) => (b._id === id ? { ...b, ...patch } : b)));
    };

    const handleRemove = (id: string) => {
        const removedBlock = blocks.find(b => b._id === id);
        const newBlocks = blocks.filter((b) => b._id !== id);
        update(newBlocks);

        // Nếu xóa image block → notify parent image cleared
        if (removedBlock?.type === "image") {
            onImageChange?.(null, null);
        }
    };

    const handleUploadImage = (id: string, file: File) => {
        const err = validateImageFile(file);
        if (err) { notify.error(err); return; }

        const src = URL.createObjectURL(file);
        update(blocks.map((b) => (b._id === id ? { ...b, src, _pendingFile: file } as any : b)));

        // Notify parent image changed (dùng cho ManualSection)
        onImageChange?.(file, src);
    };

    // Expose getBlocks cho parent
    if (editorRef) {
        editorRef.current = {
            getBlocks: () => blocks.map(stripId),
        };
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-800">
                {TOOLBAR_ITEMS.map((item) => {
                    // Ẩn nút Ảnh nếu disableImageBlock = true
                    if (item.type === "image" && disableImageBlock) return null;

                    // Disable nút Ảnh nếu đã có 1 image block
                    const isDisabled = item.type === "image" && hasImageBlock;

                    return (
                        <button
                            key={item.type}
                            type="button"
                            onClick={() => !isDisabled && handleAdd(item.type)}
                            disabled={isDisabled}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                                       border transition-all
                                       ${isDisabled
                                    ? "border-slate-800 text-slate-700 cursor-not-allowed"
                                    : "border-slate-700 text-slate-400 hover:border-primary/50 hover:text-white hover:bg-primary/10"
                                }`}
                            title={isDisabled ? "Chỉ được thêm 1 ảnh cho bài post" : `Thêm ${item.label}`}
                        >
                            {item.icon}
                            {item.label}
                            {isDisabled && (
                                <span className="ml-1 text-[9px] text-slate-700 font-normal">
                                    (đã có)
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Block list */}
            {blocks.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3 text-slate-600">
                    <MdOutlineTextFields className="text-3xl" />
                    <p className="text-sm">Chưa có block nào. Thêm từ toolbar bên trên.</p>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={blocks.map((b) => b._id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {blocks.map((block) => (
                                <SortableBlockItem
                                    key={block._id}
                                    block={block}
                                    onUpdate={handleUpdate}
                                    onRemove={handleRemove}
                                    onUploadImage={handleUploadImage}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <p className="text-xs text-slate-600 text-right">
                {blocks.length} block{blocks.length !== 1 ? "s" : ""}
            </p>
        </div>
    );
}