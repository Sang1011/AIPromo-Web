import { type ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";

interface LegalItemProps {
    icon: ReactNode;
    text: string;
    onClick?: () => void;
}

export default function LegalItem({ icon, text, onClick }: LegalItemProps) {
    return (
        <div
            onClick={onClick}
            className="
        group cursor-pointer
        flex items-center justify-between
        px-6 py-5
        rounded-2xl
        bg-gradient-to-r from-[#1b1430] to-[#0f0b1f]
        border border-white/5
        transition-all duration-200

        hover:from-[#241a45] hover:to-[#140f2a]
        hover:border-primary/40
      "
        >
            <div className="flex items-center gap-4">
                <div
                    className="
            w-10 h-10 rounded-xl
            flex items-center justify-center
            bg-primary/20 text-primary
            transition-all duration-200

            group-hover:bg-primary
            group-hover:text-white
            group-hover:scale-105
          "
                >
                    {icon}
                </div>

                <span className="text-white font-medium">
                    {text}
                </span>
            </div>

            <FiChevronRight className="
        text-white/40
        transition
        group-hover:text-white
        group-hover:translate-x-1
      " />
        </div>
    );
}
