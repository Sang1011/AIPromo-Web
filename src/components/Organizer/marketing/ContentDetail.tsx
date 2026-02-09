import { MdAutoAwesome } from "react-icons/md";
import Block from "./Block";

export default function ContentDetail() {
    return (
        <section className="space-y-6 pb-16">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="w-1.5 h-6 bg-primary rounded-full mr-3" />
                    Nội dung Quảng cáo
                </h2>

                <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary/10 text-primary text-[11px] font-bold rounded-xl border border-primary/20">
                    <MdAutoAwesome className="text-[16px]" />
                    <span>Được tạo bởi AI</span>
                </span>
            </div>

            <div className="glass rounded-[32px] p-8 border border-slate-800/50 space-y-8">
                <Block label="Tiêu đề nội dung">
                    Chào Xuân 2026: Ưu đãi bùng nổ - Nhận ngay Voucher 500k từ AIPromo
                </Block>

                <Block label="Mô tả chi tiết">
                    Tết đến xuân về, AIPromo mang đến chương trình tri ân khách hàng lớn nhất năm...
                </Block>

                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">
                        Thẻ (Tags)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            "#TetNguyenDan",
                            "#Promotion2026",
                            "#Voucher",
                            "#AIPromo",
                            "#MarketingStrategy",
                        ].map(tag => (
                            <span
                                key={tag}
                                className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-400 border border-slate-700"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}