export function Step1Skeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Banner + Images skeleton */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="h-4 w-32 bg-white/10 rounded mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="aspect-video bg-white/5 rounded-xl" />
                    <div className="flex flex-wrap gap-3">
                        <div className="w-24 h-24 bg-white/5 rounded-lg" />
                        <div className="w-24 h-24 bg-white/5 rounded-lg" />
                    </div>
                </div>
            </section>

            {/* Thông tin cơ bản skeleton */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                <div className="h-4 w-40 bg-white/10 rounded" />
                <div className="h-12 bg-white/5 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-12 bg-white/5 rounded-xl" />
                    <div className="h-12 bg-white/5 rounded-xl" />
                </div>
                <div className="h-12 bg-white/5 rounded-xl" />
            </section>

            {/* Mô tả skeleton */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="h-4 w-32 bg-white/10 rounded mb-4" />
                <div className="h-40 bg-white/5 rounded-xl" />
            </section>

            {/* Diễn giả skeleton */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="h-4 w-48 bg-white/10 rounded mb-6" />
                <div className="h-32 bg-white/5 rounded-xl border-2 border-dashed border-white/5" />
            </section>

            {/* Footer skeleton */}
            <div className="flex justify-end pt-6">
                <div className="h-12 w-36 bg-white/10 rounded-xl" />
            </div>
        </div>
    )
}