export default function Block({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">
                {label}
            </label>
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed">
                {children}
            </div>
        </div>
    );
}