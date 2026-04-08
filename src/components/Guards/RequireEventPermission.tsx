import { Navigate, Outlet, useLocation, useOutletContext, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import type { AppDispatch, RootState } from "../../store";
import { fetchEventListAssignedForCurrentUser } from "../../store/eventMemberSlice";
import type { MeInfo } from "../../types/auth/auth";

/** Map sub-route → permission cần có. "any" = có ít nhất 1 permission */
const ROUTE_PERMISSION_MAP: Record<string, string> = {
    "overview": "ViewReports",
    "analytics": "ViewReports",
    "check-in": "CheckIn",
};

export default function RequireEventPermission() {
    const parentContext = useOutletContext();
    const { eventId } = useParams<{ eventId: string }>();
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    const { currentInfor } = useSelector((state: RootState) => state.AUTH);
    const { assignedEvents, fetchingAssignedEvents } = useSelector(
        (state: RootState) => state.EVENT_MEMBER
    );

    const roles: string[] = (currentInfor as MeInfo)?.roles ?? [];
    const isOrganizer = roles.includes("Organizer");

    const hasFetched = useRef(false);
    useEffect(() => {
        if (isOrganizer || hasFetched.current) return;
        hasFetched.current = true;
        dispatch(fetchEventListAssignedForCurrentUser());
    }, [isOrganizer, dispatch]);

    if (isOrganizer) {
        return parentContext ? <Outlet context={parentContext} /> : <Outlet />;
    }

    if (fetchingAssignedEvents) return null;

    const subRoute = location.pathname.split("/").pop() ?? "";
    const requiredPermission = ROUTE_PERMISSION_MAP[subRoute];

    if (!requiredPermission) {
        return parentContext ? <Outlet context={parentContext} /> : <Outlet />;
    }

    const assignedEvent = assignedEvents.find((e) => e.eventId === eventId);
    if (!assignedEvent) return <Navigate to="/organizer/my-events" replace />;

    const permissions = assignedEvent.permissions ?? [];

    if (requiredPermission === "any" && permissions.length === 0) {
        return <Navigate to="/organizer/my-events" replace />;
    }

    if (requiredPermission !== "any" && !permissions.includes(requiredPermission)) {
        return <Navigate to="/organizer/my-events" replace />;
    }

    return parentContext ? <Outlet context={parentContext} /> : <Outlet />;
}