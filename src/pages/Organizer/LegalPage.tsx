import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiFileText, FiChevronRight } from "react-icons/fi";
import { fetchAllPolicies } from "../../store/policySlice";
import type { AppDispatch, RootState } from "../../store";
import type { DashboardLayoutConfig } from "../../types/config/dashboard.config";

type DashboardContext = {
    setConfig: (config: DashboardLayoutConfig) => void;
};

function PolicyIcon() {
    return (
        <div className={`w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center shrink-0`}>
            <FiFileText size={20} className="text-primary" />
        </div>
    );
}

function SkeletonItem() {
    return (
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-border-dark bg-card-dark animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-white/5" />
                <div className="h-3 w-72 rounded bg-white/5" />
            </div>
            <div className="w-5 h-5 rounded bg-white/5" />
        </div>
    );
}

export default function LegalPage() {
    const { setConfig } = useOutletContext<DashboardContext>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { list: policies, loading, error } = useSelector(
        (state: RootState) => state.POLICY
    );

    useEffect(() => {
        setConfig({ title: "Điều khoản cho Ban Tổ Chức" });
        return () => setConfig({});
    }, []);

    useEffect(() => {
        dispatch(fetchAllPolicies());
    }, [dispatch]);

    return (
        <div className="space-y-3">
            {loading.list ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonItem key={i} />)
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FiFileText size={32} className="text-slate-600 mb-3" />
                    <p className="text-slate-400 text-sm">Không thể tải danh sách điều khoản</p>
                    <button
                        onClick={() => dispatch(fetchAllPolicies())}
                        className="mt-4 text-xs text-primary hover:underline"
                    >
                        Thử lại
                    </button>
                </div>
            ) : policies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FiFileText size={32} className="text-slate-600 mb-3" />
                    <p className="text-slate-400 text-sm">Chưa có điều khoản nào</p>
                </div>
            ) : (
                policies.map((policy, index) => (
                    <button
                        key={policy.id}
                        onClick={() => navigate(`/organizer/legals/${policy.id}`)}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl border border-border-dark bg-card-dark hover:bg-white/5 hover:border-white/10 transition-all duration-200 group text-left"
                    >
                        {/* Index + icon */}
                        <PolicyIcon />

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">
                                {index + 1}. {policy.description}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider">
                                {policy.type}
                            </p>
                        </div>

                        {/* Arrow */}
                        <FiChevronRight
                            size={16}
                            className="text-slate-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
                        />
                    </button>
                ))
            )}
        </div>
    );
}