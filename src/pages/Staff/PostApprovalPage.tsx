import { useState, useCallback } from "react";
import StaffPostApprovalStats from "../../components/Staff/posts/StaffPostApprovalStats";
import StaffPostApprovalQueue from "../../components/Staff/posts/StaffPostApprovalQueue";

export default function PostApprovalPage() {
    const [reloadTrigger, setReloadTrigger] = useState(0);

    const triggerReload = useCallback(() => {
        setReloadTrigger((prev) => prev + 1);
    }, []);

    return (
        <div className="space-y-10">
            <div className="mb-10">
                <h3 className="text-4xl font-extrabold tracking-tight text-white mb-3">
                    Duyệt bài đăng Marketing
                </h3>
                <p className="text-slate-400 text-lg font-medium max-w-3xl leading-relaxed">
                    Kiểm duyệt nội dung bài đăng và theo dõi phân phối trên các
                    nền tảng mạng xã hội.
                </p>
            </div>
            <StaffPostApprovalStats reloadTrigger={reloadTrigger} />
            <StaffPostApprovalQueue onReload={triggerReload} />
        </div>
    );
}
