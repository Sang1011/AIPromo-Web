export function FormulaNote({ formula, note }: { formula: string; note?: string }) {
    return (
        <div className="flex flex-col gap-0.5 mt-2">
            <p className="text-[10px] font-mono text-slate-600">
                <span className="text-slate-500">Công thức: </span>{formula}
            </p>
            {note && (
                <p className="text-[10px] text-slate-600 italic">{note}</p>
            )}
        </div>
    )
}