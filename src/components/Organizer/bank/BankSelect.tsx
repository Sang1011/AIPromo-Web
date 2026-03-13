import { useState } from "react";

interface Bank {
    code: string;
    name: string;
}

interface BankSelectProps {
    label: string;
    required?: boolean;
    banks: Bank[];
    value?: string;
    onChange: (value: string) => void;
}

export default function BankSelect({
    label,
    required,
    banks,
    value,
    onChange,
}: BankSelectProps) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

    const filtered = banks.filter((b: any) =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-2 relative">
            <Label required={required}>{label}</Label>

            <div
                onClick={() => setOpen(!open)}
                className="
          w-full px-4 py-3 rounded-xl
          bg-black/30 border border-white/10
          text-white cursor-pointer
        "
            >
                {value ? banks.find((b: any) => b.code === value)?.name : "Chọn ngân hàng"}
            </div>

            {open && (
                <div
                    className="
            absolute z-50 w-full mt-2
            rounded-xl border border-white/10
            bg-[#0b0816] p-3 space-y-2
            max-h-[250px] overflow-y-auto
          "
                >
                    <input
                        placeholder="Tìm ngân hàng..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="
              w-full px-3 py-2 rounded-lg
              bg-black/30 border border-white/10
              text-white outline-none
            "
                    />

                    {filtered.map((b: any) => (
                        <div
                            key={b.code}
                            onClick={() => {
                                onChange(b.code);
                                setOpen(false);
                            }}
                            className="
                px-3 py-2 rounded-lg
                hover:bg-primary/20
                cursor-pointer
                text-sm
              "
                        >
                            {b.name}
                        </div>
                    ))}
                </div>
            )}
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