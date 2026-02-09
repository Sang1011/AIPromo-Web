import { FiSearch } from "react-icons/fi";

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

export default function SearchBar({
    placeholder = "Tìm kiếm sự kiện của bạn...",
    value = "",
    onChange,
}: SearchBarProps) {
    return (
        <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-amethyst-smoke" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="
  w-full pl-12 pr-4 py-3
  bg-slate-50 dark:bg-card-dark
  border border-slate-200 dark:border-slate-800
  rounded-2xl
  transition-all outline-none

  text-slate-800
  placeholder:text-slate-400 dark:placeholder:text-slate-500

  focus:ring-2 focus:ring-primary focus:border-transparent
"
            />
        </div>
    );
}