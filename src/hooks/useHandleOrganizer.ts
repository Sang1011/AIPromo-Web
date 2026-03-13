import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState, AppDispatch } from "../store";
import { fetchMe } from "../store/authSlice";

type User = {
    roles?: string[];
};

export function useHandleOrganizer() {
    const dispatch = useDispatch<AppDispatch>();
    const [isloading, setIsLoading] = useState(false);

    const { currentInfor, token } = useSelector(
        (state: RootState) => state.AUTH
    );

    useEffect(() => {
        const storedToken = localStorage.getItem("ACCESS_TOKEN");

        if (!token && storedToken) {
            dispatch(fetchMe());
            setIsLoading(true);
        }
    }, []);

    useEffect(() => {
        const path = window.location.pathname;

        if (!path.startsWith("/organizer")) return;

        const storedToken = localStorage.getItem("ACCESS_TOKEN");

        if (!storedToken) {
            window.location.href = "/login";
            return;
        }

        if (isloading) return;

        if (!currentInfor) {
            window.location.href = "/login";
            return;
        }

        const userInfo = currentInfor as User;
        const isOrganizer = userInfo?.roles?.includes("Organizer");

        // if (!isOrganizer) {
        //     window.location.href = "/login";
        // }
    }, [currentInfor, isloading]);
}