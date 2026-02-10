import { useState } from "react";
import {
    FiPlus,
    FiTrash2
} from "react-icons/fi";
import { LuGripVertical } from "react-icons/lu";

type QuestionType = "text" | "single" | "multiple";

interface Option {
    id: string;
    label: string;
}

interface Question {
    id: string;
    title: string;
    description?: string;
    type: QuestionType;
    required: boolean;
    options: Option[];
}

interface Step4RegistrationProps {
    onBack?: () => void;
    onNext?: () => void;
}

export default function Step4Registration({
    onBack,
    onNext,
}: Step4RegistrationProps) {
    const [scope, setScope] = useState<"order" | "ticket">("order");

    const [questions, setQuestions] = useState<Question[]>([
        {
            id: "q1",
            title: "Họ và tên của bạn",
            type: "text",
            required: true,
            options: [],
        },
    ]);

    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                id: `q${Date.now()}`,
                title: "",
                description: "",
                type: "multiple",
                required: false,
                options: [
                    { id: "o1", label: "Option 1" },
                    { id: "o2", label: "Option 2" },
                ],
            },
        ]);
    };

    return (
        <div className="space-y-8">

            {/* ===== Phạm vi áp dụng ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                    Phạm vi áp dụng
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    <ScopeCard
                        active={scope === "order"}
                        title="Cho cả đơn hàng"
                        desc="Người mua chỉ cần trả lời tất cả các câu hỏi 1 lần duy nhất với mỗi đơn hàng"
                        onClick={() => setScope("order")}
                    />

                    <ScopeCard
                        active={scope === "ticket"}
                        title="Cho từng vé"
                        desc="Người mua sẽ cần trả lời tất cả các câu hỏi với số lần tương ứng số vé trong đơn hàng"
                        onClick={() => setScope("ticket")}
                    />
                </div>
            </section>

            {/* ===== Danh sách câu hỏi ===== */}
            <div className="space-y-4">
                {questions.map((q, index) => (
                    <QuestionCard
                        key={q.id}
                        index={index + 1}
                        question={q}
                        onDelete={() =>
                            setQuestions((prev) =>
                                prev.filter((x) => x.id !== q.id)
                            )
                        }
                    />
                ))}
            </div>

            {/* ===== Add new question ===== */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={addQuestion}
                    className="
                        flex items-center gap-2
                        px-6 py-3 rounded-full
                        bg-primary text-white font-semibold
                        shadow-lg shadow-primary/30
                    "
                >
                    <FiPlus />
                    Tạo câu hỏi mới
                </button>
            </div>

            {/* ===== Footer ===== */}
            <div className="flex items-center justify-between pt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
                >
                    Quay lại
                </button>

                <button
                    onClick={onNext}
                    className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold"
                >
                    Lưu và Tiếp tục →
                </button>
            </div>
        </div>
    );
}

function ScopeCard({
    title,
    desc,
    active,
    onClick,
}: {
    title: string;
    desc: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`
                cursor-pointer rounded-xl p-4 border transition
                ${active
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/5 hover:border-primary/40"}
            `}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`
                        w-4 h-4 rounded-full border
                        ${active
                            ? "border-primary bg-primary"
                            : "border-slate-500"}
                    `}
                />
                <p className="font-medium text-white">{title}</p>
            </div>
            <p className="text-sm text-slate-400 mt-2">
                {desc}
            </p>
        </div>
    );
}

function QuestionCard({
    question,
    index,
    onDelete,
}: {
    question: Question;
    index: number;
    onDelete: () => void;
}) {
    return (
        <section className="rounded-2xl bg-[#0f0b1f] border border-primary/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <LuGripVertical className="text-slate-500" />
                    <span className="text-sm font-semibold text-primary">
                        CÂU {index}
                    </span>
                </div>

                <button
                    onClick={onDelete}
                    className="text-slate-400 hover:text-red-400"
                >
                    <FiTrash2 />
                </button>
            </div>

            <input
                placeholder="Nhập câu hỏi của bạn..."
                className="
                    w-full px-4 py-2 rounded-xl
                    bg-white/5 border border-white/10
                    text-white outline-none
                    focus:border-primary
                "
            />

            <input
                placeholder="Nhập mô tả thêm (nếu có)..."
                className="
                    w-full px-4 py-2 rounded-xl
                    bg-white/5 border border-white/10
                    text-white outline-none
                "
            />

            {/* Type */}
            <div className="flex gap-6 text-sm text-slate-300">
                <Radio label="Văn bản" />
                <Radio label="Một lựa chọn" />
                <Radio label="Nhiều lựa chọn" checked />
            </div>

            {/* Options */}
            {question.type !== "text" && (
                <div className="space-y-3">
                    {question.options.map((o) => (
                        <div
                            key={o.id}
                            className="flex items-center gap-3"
                        >
                            <div className="w-4 h-4 rounded-full border border-primary bg-primary" />
                            <input
                                defaultValue={o.label}
                                className="
                                    flex-1 px-3 py-2 rounded-xl
                                    bg-white/5 border border-white/10
                                    text-white
                                "
                            />
                            <button className="text-red-400">
                                <FiTrash2 />
                            </button>
                        </div>
                    ))}

                    <button className="text-primary text-sm font-semibold">
                        + ADD OPTION
                    </button>
                </div>
            )}

            {/* Required */}
            <div className="flex justify-end pt-2">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" className="accent-primary" />
                    Bắt buộc trả lời
                </label>
            </div>
        </section>
    );
}

function Radio({
    label,
    checked = false,
}: {
    label: string;
    checked?: boolean;
}) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="radio"
                defaultChecked={checked}
                className="accent-primary"
            />
            {label}
        </label>
    );
}
