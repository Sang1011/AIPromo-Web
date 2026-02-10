export default function Legend({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs font-bold text-slate-400">{label}</span>
        </div>
    );
}