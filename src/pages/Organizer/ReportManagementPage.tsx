import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ReportTable from "../../components/Organizer/overview/ReportTable";
import type { DashboardLayoutConfig } from "../../types/organizer/dashboard.config";

type DashboardContext = {
    setConfig: (config: DashboardLayoutConfig) => void;
};

export default function ReportManagementPage() {
    const { setConfig } = useOutletContext<DashboardContext>();

    useEffect(() => {
        setConfig({
            title: "Quản lý báo cáo",
        });

        return () => setConfig({});
    }, []);

    return (
        <div className="space-y-6">
            <ReportTable />
        </div>
    );
}
