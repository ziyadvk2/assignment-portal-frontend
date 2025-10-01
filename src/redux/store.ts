import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import assignmentReducer from "./slices/assignmentSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    assignments: assignmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
