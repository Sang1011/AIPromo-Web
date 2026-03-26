import { useRef } from "react";
import { FiCalendar } from "react-icons/fi";
import "../shared/datetime.css";

interface DateTimeInputProps {
    label: string;
    value?: string;
    onChange?: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
    min?: string;
}

export default function DateTimeInput({
    label,
    value,
    onChange,
    required,
    disabled,
    min
}: DateTimeInputProps) {

    const inputRef = useRef<HTMLInputElement>(null);
    const normalizedValue = value ? value.slice(0, 16) : "";
    const normalizedMin = min ? min.slice(0, 16) : undefined;

    const openPicker = () => {
        if (disabled) return;
        if (inputRef.current) {
            inputRef.current.showPicker?.();
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
                    value={normalizedValue}
                    min={normalizedMin}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-2 pr-10
                        rounded-xl
                        bg-white/5
                        border border-white/10
                        text-white
                        outline-none
                        focus:border-primary
                        transition
                        ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
                    `}
                />

                <FiCalendar
                    onClick={openPicker}
                    className={`
                        absolute right-3 top-1/2
                        -translate-y-1/2
                        text-slate-400
                        transition
                        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:text-white"}
                    `}
                />
            </div>
        </div>
    );
}