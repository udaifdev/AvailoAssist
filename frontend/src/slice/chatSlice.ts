// chatSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface ChatState {
    unreadCounts: {
      [bookingId: string]: number;
    };
  }
  
  const initialState: ChatState = {
    unreadCounts: {}
  };
  
  const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
      incrementUnreadCount: (state, action: PayloadAction<string>) => {
        const bookingId = action.payload;
        state.unreadCounts[bookingId] = (state.unreadCounts[bookingId] || 0) + 1;
      },
      clearUnreadCount: (state, action: PayloadAction<string>) => {
        const bookingId = action.payload;
        state.unreadCounts[bookingId] = 0;
      }
    }
  });


  export const { incrementUnreadCount, clearUnreadCount } = chatSlice.actions;
  export default chatSlice.reducer;