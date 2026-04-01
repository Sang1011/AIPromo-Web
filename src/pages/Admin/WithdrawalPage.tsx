import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { fetchWithdrawalRequests } from "../../store/withdrawalSlice";
import WithdrawalStats from "../../components/Admin/withdrawal/WithdrawalStats";
import WithdrawalTable from "../../components/Admin/withdrawal/WithdrawalTable";

export default function WithdrawalPage() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchWithdrawalRequests({
            PageNumber: 1,
            PageSize: 10,
            SortColumn: "CreatedAt",
            SortOrder: "desc"
        }));
    }, [dispatch]);

    return (
        <div className="space-y-8">
            <WithdrawalStats />
            <WithdrawalTable />
        </div>
    );
}
