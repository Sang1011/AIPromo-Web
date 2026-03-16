// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Underline from "@tiptap/extension-underline";

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function Editor() {

    // const editor = useEditor({
    //     extensions: [
    //         StarterKit,
    //         Underline
    //     ],
    //     content: value,
    //     onUpdate: ({ editor }) => {
    //         onChange(editor.getHTML());
    //     },
    // });

    // if (!editor) return null;

    return (
        <div className="border rounded-xl bg-[#18122B] text-white">

            {/* ===== Toolbar ===== */}
            {/* <div className="flex gap-2 border-b border-white/10 p-2">

                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="px-2 py-1 text-sm hover:bg-white/10 rounded"
                >
                    <b>B</b>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="px-2 py-1 text-sm hover:bg-white/10 rounded"
                >
                    <i>I</i>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className="px-2 py-1 text-sm hover:bg-white/10 rounded"
                >
                    <u>U</u>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className="px-2 py-1 text-sm hover:bg-white/10 rounded"
                >
                    H2
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className="px-2 py-1 text-sm hover:bg-white/10 rounded"
                >
                    • List
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className="px-2 py-1 text-sm hover:bg-white/10 rounded"
                >
                    1. List
                </button>

            </div> */}

            {/* <div className="p-3 min-h-[200px]">
                <EditorContent editor={editor} />
            </div> */}

        </div>
    );
}