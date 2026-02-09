import PlatformContributionDonut from "./PlatformContributionDonut";
import PlatformPerformanceTable from "./PlatformPerformanceTable";


export default function PlatformContributionSection() {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="w-1.5 h-6 bg-primary rounded-full mr-3" />
                    Hiệu suất theo nền tảng
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PlatformContributionDonut />
                <PlatformPerformanceTable />
            </div>
        </section>
    );
}