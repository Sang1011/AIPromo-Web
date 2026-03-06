import { MdStore } from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

export interface FinanceTransaction {
    id: string;
    entity: string;
    type: string;
    amount: string;
    fee: string;
    method: string;
    status: "completed" | "pending" | "failed";
    avatar: string | null;
    role: string;
}

const defaultTransactions: FinanceTransaction[] = [
    {
        id: "#TXN-88291",
        entity: "Vibe Collective",
        type: "Payout",
        amount: "$4,250.00",
        fee: "$637.50",
        method: "Bank Transfer",
        status: "completed",
        avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBPpgJwx9-_D61wkKl3dsOf4eMniUmgnBLVY99tXLkB-WcVAu7fGHNh6yHSQcO3sV4tuSqNy43Sr2LpdM2fsP5EO8QMpNfVZhFmQfOPPXdQtMg6IKEGbCFQ6uXZ7r-ixv3xX6XGhOy1EAHwxQtcffVuyp8bE9WJxpeuHcpBJD0Fk1V3iCRX-gNU7yCeFpFr-UVYH9ElbaH44U67eQjXnZFJowRgzUlk6OcnsKjvUPAT5vJrp8CK6XQUgyxiUSSeJi36Cmfx-8YBhTM2",
        role: "Organizer",
    },
    {
        id: "#TXN-88290",
        entity: "Sarah Wilson",
        type: "Ticket Sale",
        amount: "$85.00",
        fee: "$12.75",
        method: "VNPay",
        status: "pending",
        avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDLd3Lrptc5vsqrxnxIszULo1pCpyIuJvmB5_sElcHxmPKpxhwCdWZNJ0SWAqpXooXaIVGBJ_t-AuMn4ClE7mOtkTpS_8K45zkRtIVFe1YWowMqvfFy2Vd9LW8t3oP7NgCuJ117FLoJ21WRrJ9ZW4PQmLokOi3CoR-t4u9E-bZrPZfTv3wKbqkGX74QdQApamCJ36JNVgWeCP-Cz22J0jBtyzuj3gT9t0TLYGfX8qBUczpy8ceuqLCPqfvObwJMtLRlGHzn06opT2TB",
        role: "Attendee",
    },
    {
        id: "#TXN-88289",
        entity: "Michael Chen",
        type: "Ticket Sale",
        amount: "$150.00",
        fee: "$22.50",
        method: "MoMo",
        status: "completed",
        avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBwULc5HdQIH2uuQr7i9dr1Oy5ZnO-py4nGHJYnI14gelm8hRIvlOQO44Oj6MYyXMh_WuRoajJfp0ztlRX-sDfIGc2PV5XnUoMz51FdEzgz-MnCvyLLNJkGM4M_RSGj-LWzeXOxfPcstn6CE3FLgewdbYhpV58jWiKMzTQHLfyc6Cath-TyvKe9g3c5XZK85N3us5jJTo9V-WHV8zoLBqt92afrSojGqh8yIcR2ufmv5G4aCRyvD5veS_Ejrj1dytd5SwdzwasaIlxD",
        role: "Attendee",
    },
    {
        id: "#TXN-88288",
        entity: "Neon Nights Expo",
        type: "Payout",
        amount: "$12,800.00",
        fee: "$1,920.00",
        method: "Bank Transfer",
        status: "failed",
        avatar: null,
        role: "Organizer",
    },
];

interface AdminFinanceTransactionsTableProps {
    transactions?: FinanceTransaction[];
}

export default function AdminFinanceTransactionsTable({
    transactions = defaultTransactions,
}: AdminFinanceTransactionsTableProps) {
    return (
        <div className={`${glassCard} rounded-xl overflow-hidden`}>
            <div className="px-8 py-6 border-b border-[#302447] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        Lịch sử Giao dịch Chi tiết
                    </h2>
                    <p className="text-[#a592c8] text-sm">
                        Xem và quản lý tất cả các hoạt động tài chính trong hệ sinh
                        thái
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#18122B] border border-[#302447] rounded-lg text-[#a592c8] text-xs font-semibold hover:text-white transition-colors">
                        Lọc
                    </button>
                    <button className="px-4 py-2 bg-[#18122B] border border-[#302447] rounded-lg text-[#a592c8] text-xs font-semibold hover:text-white transition-colors">
                        Khoảng thời gian
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] text-[#a592c8] uppercase tracking-widest font-bold">
                            <th className="px-8 py-4">Mã giao dịch</th>
                            <th className="px-8 py-4">Thực thể</th>
                            <th className="px-8 py-4">Loại</th>
                            <th className="px-8 py-4">Tổng tiền</th>
                            <th className="px-8 py-4">Phí ròng</th>
                            <th className="px-8 py-4">Phương thức</th>
                            <th className="px-8 py-4 text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#302447]">
                        {transactions.map((tx) => (
                            <tr
                                key={tx.id}
                                className="hover:bg-white/5 transition-colors"
                            >
                                <td className="px-8 py-5 text-sm font-medium text-[#a592c8]">
                                    {tx.id}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        {tx.avatar ? (
                                            <div
                                                className="w-8 h-8 rounded-full bg-cover"
                                                style={{
                                                    backgroundImage: `url('${tx.avatar}')`,
                                                }}
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[#302447] flex items-center justify-center">
                                                <MdStore className="text-xs text-primary" />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-white">
                                                {tx.entity}
                                            </span>
                                            <span className="text-[10px] text-[#a592c8]">
                                                {tx.role}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                            tx.type === "Payout"
                                                ? "bg-primary/10 text-primary"
                                                : "bg-blue-500/10 text-blue-400"
                                        }`}
                                    >
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-sm font-bold text-white">
                                    {tx.amount}
                                </td>
                                <td className="px-8 py-5 text-sm text-[#a592c8]">
                                    {tx.fee}
                                </td>
                                <td className="px-8 py-5 text-sm text-[#a592c8]">
                                    {tx.method}
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                                            tx.status === "completed"
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : tx.status === "pending"
                                                ? "bg-amber-500/10 text-amber-400"
                                                : "bg-red-500/10 text-red-400"
                                        }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                                tx.status === "completed"
                                                    ? "bg-emerald-400"
                                                    : tx.status === "pending"
                                                    ? "bg-amber-400"
                                                    : "bg-red-400"
                                            }`}
                                        />
                                        {tx.status === "completed"
                                            ? "Hoàn tất"
                                            : tx.status === "pending"
                                            ? "Đang chờ"
                                            : "Thất bại"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-8 py-4 bg-white/2 flex justify-between items-center border-t border-[#302447]">
                <span className="text-xs text-[#a592c8]">
                    Hiển thị 4 trên 24.192 kết quả
                </span>
                <div className="flex gap-2">
                    <button className="p-1.5 rounded bg-[#18122B] border border-[#302447] text-[#a592c8] hover:text-white transition-colors">
                        <FiChevronLeft className="text-sm" />
                    </button>
                    <button className="p-1.5 rounded bg-[#18122B] border border-[#302447] text-[#a592c8] hover:text-white transition-colors">
                        <FiChevronRight className="text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
}
