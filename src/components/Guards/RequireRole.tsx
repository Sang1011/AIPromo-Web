import { Navigate, Outlet } from "react-router-dom";
import { fetchMe, fetchRefreshToken } from "../../store/authSlice";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { MeInfo, UserRole } from "../../types/auth/auth";

interface RequireRoleProps {
    allowedRoles: UserRole[];
}

const RequireRole = ({ allowedRoles }: RequireRoleProps) => {
    const refreshToken = localStorage.getItem("REFRESH_TOKEN");
    const dispatch = useDispatch<AppDispatch>();
    const { currentInfor } = useSelector((state: RootState) => state.AUTH);

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (refreshToken) {
                await dispatch(fetchRefreshToken());
            }
            await dispatch(fetchMe());
            setIsChecking(false);
        };

        fetchData();
    }, []);

    if (isChecking) {
        return <div>Loading...</div>;
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

    return <Outlet />;
};

export default RequireRole;