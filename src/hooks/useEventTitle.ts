import { useSelector } from "react-redux";
import type { RootState } from "../store";

export const useEventTitle = () => {
    const currentEvent = useSelector((state: RootState) => state.EVENT.currentEvent);
    return currentEvent?.title ?? null;
};