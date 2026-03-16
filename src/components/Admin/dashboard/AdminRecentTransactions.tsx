import { MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

export interface TransactionItem {
    id: string;
    user: string;
    avatar: string;
    role: string;
    amount: string;
    method: string;
    status: "success" | "pending";
}

const defaultTransactions: TransactionItem[] = [
    {
        id: "#TRX-94021",
        user: "Johnathan Smith",
        avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBPpgJwx9-_D61wkKl3dsOf4eMniUmgnBLVY99tXLkB-WcVAu7fGHNh6yHSQcO3sV4tuSqNy43Sr2LpdM2fsP5EO8QMpNfVZhFmQfOPPXdQtMg6IKEGbCFQ6uXZ7r-ixv3xX6XGhOy1EAHwxQtcffVuyp8bE9WJxpeuHcpBJD0Fk1V3iCRX-gNU7yCeFpFr-UVYH9ElbaH44U67eQjXnZFJowRgzUlk6OcnsKjvUPAT5vJrp8CK6XQUgyxiUSSeJi36Cmfx-8YBhTM2",
        role: "Organizer",
        amount: "$1,250.00",
        method: "MoMo",
        status: "success",
    },
    {
        id: "#TRX-94019",
        user: "Sarah Wilson",
        avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDLd3Lrptc5vsqrxnxIszULo1pCpyIuJvmB5_sElcHxmPKpxhwCdWZNJ0SWAqpXooXaIVGBJ_t-AuMn4ClE7mOtkTpS_8K45zkRtIVFe1YWowMqvfFy2Vd9LW8t3oP7NgCuJ117FLoJ21WRrJ9ZW4PQmLokOi3CoR-t4u9E-bZrPZfTv3wKbqkGX74QdQApamCJ36JNVgWeCP-Cz22J0jBtyzuj3gT9t0TLYGfX8qBUczpy8ceuqLCPqfvObwJMtLRlGHzn06opT2TB",
        role: "Attendee",
        amount: "$45.00",
        method: "VNPay",
        status: "pending",
    },
    {
        id: "#TRX-94018",
        user: "Michael Chen",
        avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBwULc5HdQIH2uuQr7i9dr1Oy5ZnO-py4nGHJYnI14gelm8hRIvlOQO44Oj6MYyXMh_WuRoajJfp0ztlRX-sDfIGc2PV5XnUoMz51FdEzgz-MnCvyLLNJkGM4M_RSGj-LWzeXOxfPcstn6CE3FLgewdbYhpV58jWiKMzTQHLfyc6Cath-TyvKe9g3c5XZK85N3us5jJTo9V-WHV8zoLBqt92afrSojGqh8yIcR2ufmv5G4aCRyvD5veS_Ejrj1dytd5SwdzwasaIlxD",
        role: "Attendee",
        amount: "$120.00",
        method: "VNPay",
        status: "success",
    },
];

interface AdminRecentTransactionsProps {
    transactions?: TransactionItem[];
}

export default function AdminRecentTransactions({
    transactions = defaultTransactions,
}: AdminRecentTransactionsProps) {
    return (
        <div className={`${glassCard} rounded-xl overflow-hidden`}>
            <div className="px-8 py-6 border-b border-[#302447] flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        Giao dịch Gần đây
                    </h2>
                    <p className="text-[#a592c8] text-sm">
                        Cập nhật thời gian thực các thanh toán hệ thống
                    </p>
                </div>
                <Link
                    to="/admin/finance"
                    className="text-primary text-sm font-bold flex items-center gap-2 hover:underline"
                >
                    Xem tất cả
                    <MdArrowForward className="text-sm" />
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] text-[#a592c8] uppercase tracking-widest font-bold">
                            <th className="px-8 py-4">Transaction ID</th>
                            <th className="px-8 py-4">User</th>
                            <th className="px-8 py-4">Role</th>
                            <th className="px-8 py-4">Amount</th>
                            <th className="px-8 py-4">Payment Method</th>
                            <th className="px-8 py-4 text-center">Status</th>
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
                                        <div
                                            className="w-8 h-8 rounded-full bg-cover"
                                            style={{
                                                backgroundImage: `url('${tx.avatar}')`,
                                            }}
                                        />
                                        <span className="text-sm font-semibold text-white">
                                            {tx.user}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                            tx.role === "Organizer"
                                                ? "bg-primary/10 text-primary"
                                                : "bg-indigo-500/10 text-indigo-400"
                                        }`}
                                    >
                                        {tx.role}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-sm font-bold text-white">
                                    {tx.amount}
                                </td>
                                <td className="px-8 py-5 text-sm text-[#a592c8]">
                                    {tx.method}
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                                            tx.status === "success"
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "bg-amber-500/10 text-amber-400"
                                        }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                                tx.status === "success"
                                                    ? "bg-emerald-400"
                                                    : "bg-amber-400"
                                            }`}
                                        />
                                        {tx.status === "success"
                                            ? "Success"
                                            : "Pending"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
