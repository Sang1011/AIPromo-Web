import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { fetchMe, fetchRefreshToken } from "../../store/authSlice";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { MeInfo, UserRole } from "../../types/auth/auth";

interface RequireRoleProps {
    allowedRoles: UserRole[];
}

const RequireRole = ({ allowedRoles }: RequireRoleProps) => {
    const parentContext = useOutletContext();
    const refreshToken = localStorage.getItem("REFRESH_TOKEN");
    const dispatch = useDispatch<AppDispatch>();
    const { currentInfor } = useSelector((state: RootState) => state.AUTH);

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if ((currentInfor as MeInfo)?.userId) {
                setIsChecking(false);
                return;
            }

            if (refreshToken) {
                await dispatch(fetchRefreshToken());
            } else {
                await dispatch(fetchMe());
            }
            setIsChecking(false);
        };

        fetchData();
    }, []);

    if (isChecking) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <span className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!currentInfor) {
        return <Navigate to="/login" replace />;
    }

    let userInfo = currentInfor as MeInfo;
    console.log("User:", userInfo);
    console.log("User Roles:", userInfo.roles);

    const userRoles: string[] = userInfo.roles || [];

    const hasPermission = userRoles.some(role =>
        allowedRoles.includes(role as UserRole)
    );

    if (!hasPermission) {
        return <Navigate to="/login" replace />;
    }

    if (parentContext) {
        return <Outlet context={parentContext} />;
    } else {
        return <Outlet />;
    }
};

export default RequireRole;