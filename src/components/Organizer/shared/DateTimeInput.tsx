import { FiCalendar } from "react-icons/fi";
import { useRef } from "react";
import "./datetime.css";

interface DateTimeInputProps {
    label: string;
    value?: string;
    onChange?: (value: string) => void;
    required?: boolean;
}

export default function DateTimeInput({
    label,
    value,
    onChange,
    required,
}: DateTimeInputProps) {

    const inputRef = useRef<HTMLInputElement>(null);

    const openPicker = () => {
        if (inputRef.current) {
            inputRef.current.showPicker?.(); // Chrome / Edge
            inputRef.current.focus();
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>

            <div className="relative">
                <input
                    ref={inputRef}
                    type="datetime-local"
                    lang="vi"
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="
                        w-full px-4 py-2 pr-10
                        rounded-xl
                        bg-white/5
                        border border-white/10
                        text-white
                        outline-none
                        focus:border-primary
                        transition
                    "
                />

                <FiCalendar
                    onClick={openPicker}
                    className="
                        absolute right-3 top-1/2
                        -translate-y-1/2
                        text-slate-400
                        cursor-pointer
                        hover:text-white
                        transition
                    "
                />
            </div>
        </div>
    );
}