import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import hashtagReducer from "./hashtagSlice";
import eventReducer from "./eventSlice";
import categoryReducer from "./categorySlice";
import ticketTypeReducer from "./ticketTypeSlice";
import eventMemberReducer from "./eventMemberSlice";
import organizerProfileReducer from "./organizerProfileSlice";
import seatMapReducer from "./seatMapSlice";

const store = configureStore({
    reducer: {
        AUTH: authReducer,
        EVENT: eventReducer,
        HASHTAG: hashtagReducer,
        CATEGORY: categoryReducer,
        TICKET_TYPE: ticketTypeReducer,
        EVENT_MEMBER: eventMemberReducer,
        ORGANIZER_PROFILE: organizerProfileReducer,
        SEATMAP: seatMapReducer
    }
})

export default store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch