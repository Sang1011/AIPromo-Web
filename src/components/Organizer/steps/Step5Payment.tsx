import { FiInfo, FiCreditCard, FiFileText } from "react-icons/fi";

interface Step5PaymentProps {
    onBack?: () => void;
    onFinish?: () => void;
}

export default function Step5Payment({
    onBack,
    onFinish,
}: Step5PaymentProps) {
    return (
        <div className="space-y-8">

            {/* ===== Info box ===== */}
            <div className="
                rounded-2xl
                bg-primary/10 border border-primary/30
                p-5 flex gap-4
            ">
                <div className="text-primary mt-1">
                    <FiInfo />
                </div>
                <div className="text-sm text-slate-300 leading-relaxed">
                    <p className="font-semibold text-white mb-1">
                        Thông tin thanh toán
                    </p>
                    Ticketbox sẽ chuyển tiền bán vé đến tài khoản của bạn.
                    Tiền bán vé (sau khi trừ phí dịch vụ) sẽ vào tài khoản của bạn
                    sau khi xác nhận sale report từ <b>7 – 10 ngày</b>.
                    Nếu bạn muốn nhận tiền sớm hơn, vui lòng liên hệ
                    <b> 1900.6408 </b> hoặc <b>info@ticketbox.vn</b>.
                </div>
            </div>

            {/* ===== Bank account ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
                    <span className="text-primary">
                        <FiCreditCard />
                    </span>
                    Tài khoản ngân hàng
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Chủ tài khoản"
                        required
                        placeholder="Nhập tên chủ tài khoản"
                        maxLength={100}
                    />

                    <Input
                        label="Số tài khoản"
                        required
                        placeholder="Nhập số tài khoản"
                    />

                    <Select
                        label="Tên ngân hàng"
                        required
                        options={[
                            "Vietcombank",
                            "Techcombank",
                            "MB Bank",
                            "ACB",
                        ]}
                    />

                    <Input
                        label="Chi nhánh"
                        required
                        placeholder="Nhập tên chi nhánh"
                        maxLength={100}
                    />
                </div>
            </section>

            {/* ===== VAT ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
                    <span className="text-primary">
                        <FiFileText />
                    </span>
                    Thông tin hoá đơn đỏ (VAT)
                </h2>

                {/* Business type */}
                <div>
                    <Label required>Loại hình kinh doanh</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <RadioCard label="Cá nhân" checked />
                        <RadioCard label="Công ty" />
                    </div>
                </div>

                <Input
                    label="Tên công ty / Cá nhân"
                    required
                    placeholder="Nhập đầy đủ tên"
                    maxLength={100}
                />

                <Input
                    label="Địa chỉ"
                    required
                    placeholder="Nhập địa chỉ đăng ký thuế"
                    maxLength={100}
                />

                <Input
                    label="Mã số thuế"
                    required
                    placeholder="Nhập mã số thuế"
                />
            </section>

            {/* ===== Footer ===== */}
            <div className="flex items-center justify-between pt-6 pb-10">
                <button
                    onClick={onBack}
                    className="
                            px-6 py-3 rounded-xl
                            border border-primary
                            text-primary
                            hover:border-white hover:text-white

                        "
                >
                    Quay lại
                </button>
                <button
                    onClick={onFinish}
                    className="
                            px-8 py-4 rounded-xl
                            bg-primary text-white
                            font-semibold
                            shadow-lg shadow-primary/30
                            hover:scale-[1.02] active:scale-[0.98]
                            transition
                        "
                >
                    Hoàn tất
                </button>
            </div>
        </div>
    );
}

function Input({
    label,
    required,
    placeholder,
    maxLength,
}: any) {
    return (
        <div className="space-y-2">
            <Label required={required}>{label}</Label>
            <div className="relative">
                <input
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className="
                        w-full px-4 py-3 rounded-xl
                        bg-black/30 border border-white/10
                        text-white outline-none
                        focus:border-primary pr-[50px]
                    "
                />
                {maxLength && (
                    <span className="absolute right-3 top-3 text-[10px] text-slate-500">
                        0 / {maxLength}
                    </span>
                )}
            </div>
        </div>
    );
}

function Select({ label, required, options }: any) {
    return (
        <div className="space-y-2">
            <Label required={required}>{label}</Label>
            <select
                className="
                    w-full px-4 py-3 rounded-xl
                    bg-black/30 border border-white/10
                    text-white outline-none
                    focus:border-primary
                "
            >
                <option value="">Chọn ngân hàng</option>
                {options.map((o: string) => (
                    <option key={o}>{o}</option>
                ))}
            </select>
        </div>
    );
}

function Label({
    children,
    required,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {children}
            {required && <span className="text-red-500"> *</span>}
        </label>
    );
}

function RadioCard({
    label,
    checked,
}: {
    label: string;
    checked?: boolean;
}) {
    return (
        <label
            className={`
                flex items-center gap-3 p-4 rounded-xl cursor-pointer
                border transition
                ${checked
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/5 hover:border-primary/40"}
            `}
        >
            <input
                type="radio"
                name="business_type"
                defaultChecked={checked}
                className="accent-primary"
            />
            <span className="text-sm font-medium text-white">
                {label}
            </span>
        </label>
    );
}
