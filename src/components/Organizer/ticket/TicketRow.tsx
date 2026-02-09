import { BsFillTicketFill } from "react-icons/bs";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function TicketRow({ ticket }: any) {
    return (
        <div className="
            flex items-center justify-between
            bg-white/5
            p-3 rounded-xl
            border border-white/5
            hover:border-primary/40
            transition
        ">
            <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <BsFillTicketFill className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-medium text-white">
                        {ticket.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                        {ticket.note}
                    </p>
                </div>
            </div>

            <div className="w-28 text-center text-sm font-semibold text-primary">
                {ticket.price}
            </div>

            <div className="w-28 text-center text-sm text-slate-300">
                {ticket.quantity}
            </div>

            <div className="w-28 flex justify-end gap-2">
                <button className="p-2 text-slate-400 hover:text-primary">
                    <FiEdit2 />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400">
                    <FiTrash2 />
                </button>
            </div>
        </div>
    );
}
