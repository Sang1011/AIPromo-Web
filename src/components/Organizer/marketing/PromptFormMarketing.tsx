import { MdOutlineBolt, MdOutlineSmartToy } from "react-icons/md";

export default function PromptFormMarketing() {
    return (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                        Tiêu đề
                    </label>
                    <input
                        type="text"
                        placeholder="Ví dụ: Bài đăng Facebook cho ngày hội"
                        className="w-full bg-background-dark/50 border-slate-800 rounded-xl
                                                   focus:ring-primary focus:border-primary
                                                   text-slate-100 placeholder:text-slate-600 px-4 py-3"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                            Ngôn ngữ
                        </label>
                        <select
                            className="w-full bg-background-dark/50 border-slate-800 rounded-xl
                                                       focus:ring-primary focus:border-primary
                                                       text-slate-100 px-4 py-3"
                        >
                            <option>Tiếng Việt</option>
                            <option>English</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                            Tags
                        </label>
                        <input
                            type="text"
                            placeholder="Facebook, Event, Promo"
                            className="w-full bg-background-dark/50 border-slate-800 rounded-xl
                                                       focus:ring-primary focus:border-primary
                                                       text-slate-100 placeholder:text-slate-600 px-4 py-3"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                        Mô tả nội dung
                    </label>
                    <textarea
                        rows={4}
                        placeholder="Mô tả mục tiêu của chiến dịch marketing này..."
                        className="w-full bg-background-dark/50 border-slate-800 rounded-xl
                                                   focus:ring-primary focus:border-primary
                                                   text-slate-100 placeholder:text-slate-600 px-4 py-3"
                    />
                </div>
            </div>

            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 space-y-6">
                <div className="flex items-center space-x-2">
                    <MdOutlineSmartToy className="text-primary text-sm" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">
                        AI Assistant
                    </span>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">
                        Tiêu đề Prompt
                    </label>
                    <input
                        type="text"
                        placeholder="Gợi ý tiêu đề AI..."
                        className="w-full bg-background-dark border-slate-800 rounded-xl
                                                   focus:ring-primary focus:border-primary
                                                   text-slate-100 px-4 py-3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">
                        Nội dung Prompt
                    </label>
                    <textarea
                        rows={4}
                        placeholder="Viết một bài đăng sáng tạo cho Facebook về sự kiện..."
                        className="w-full bg-background-dark border-slate-800 rounded-xl
                                                   focus:ring-primary focus:border-primary
                                                   text-slate-100 px-4 py-3"
                    />
                </div>

                <button
                    type="button"
                    className="w-full bg-primary hover:bg-primary/90 text-white
                                               py-4 rounded-2xl font-bold
                                               flex items-center justify-center space-x-3
                                               transition-all neon-button-glow"
                >
                    <MdOutlineBolt />
                    <span>Tạo với AI</span>
                </button>
            </div>
        </form>
    )
}