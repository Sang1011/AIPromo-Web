import { MdOutlineAutoAwesome } from "react-icons/md";
import MarketingTable from "../../components/Organizer/marketing/MarketingTable";
import PromptFormMarketing from "../../components/Organizer/marketing/PromptFormMarketing";
// import MarketingPerformanceBarChart from "../../components/Organizer/marketing/MarketingPerformanceBarChart";
import { resetPostFilters } from "../../store/postSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function MarketingPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            dispatch(resetPostFilters());
        };
    }, [dispatch]);
    return (
        <div className="bg-background-dark text-slate-100 min-h-screen overflow-y-auto custom-scrollbar">
            <div className="p-8 space-y-10 max-w-7xl mx-auto w-full">
                {/* <MarketingPerformanceBarChart /> */}

                <section>
                    <div className="glass neon-glow-purple p-8 rounded-[32px] border border-primary/10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <MdOutlineAutoAwesome className="text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                Tạo nội dung mới với AI
                            </h2>
                        </div>

                        <PromptFormMarketing />
                    </div>
                </section>
                <MarketingTable />
            </div>
        </div>
    );
}
