import ContentDetail from "../../components/Organizer/marketing/ContentDetail";
import KPISummary from "../../components/Organizer/marketing/KPISummary";
import PerformanceChart from "../../components/Organizer/marketing/PerformanceChart";
import PlatformContributionSection from "../../components/Organizer/marketing/PlatformContributionSection";

export default function MarketingDetailPage() {
    return (
        <div className="bg-background-dark text-slate-100 min-h-screen overflow-y-auto custom-scrollbar">
            <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
                <KPISummary />
                <PlatformContributionSection />
                <PerformanceChart />
                <ContentDetail />
            </div>
        </div>
    );
}





