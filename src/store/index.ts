import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import eventReducer from "./eventSlice";
import categoryReducer from "./categorySlice"
const store = configureStore({
    reducer:{
       AUTH: authReducer,
       EVENT: eventReducer,
       CATEGORY : categoryReducer,
    }
})

export default store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch