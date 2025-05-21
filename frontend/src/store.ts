import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slice/userSlice';
import workerReducer from './slice/workerSlice'
import adminReducer from './slice/adminSlice'
import bookingReducer from './slice/bookingSlice'
import chatReducer from './slice/chatSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    worker: workerReducer,
    admin:adminReducer,
    booking: bookingReducer,
    chat: chatReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: true
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
