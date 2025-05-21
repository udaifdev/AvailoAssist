// userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  userDetails: { id: string; name: string; email: string } | null;
  userToken: string | null;
  isBlocked: boolean;

}

const initialState: UserState = {
  userDetails: localStorage.getItem('userDetails')
    ? JSON.parse(localStorage.getItem('userDetails') as string) // Type assertion to ensure it's a string
    : null,
  userToken: localStorage.getItem('userToken') || null, // Fallback to null if token is not present
  isBlocked: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ id: string; name: string; email: string; userToken: string }>) => {
      state.userDetails = action.payload;
      state.userToken = action.payload.userToken;
      state.isBlocked = false;
      localStorage.setItem('userDetails', JSON.stringify(action.payload));
      localStorage.setItem('userToken', action.payload.userToken);
    },
    logout: (state) => {
      state.userDetails = null;
      state.userToken = null;
      state.isBlocked = false;
      localStorage.removeItem('userDetails');
      localStorage.removeItem('userToken');
    },
    setBlocked: (state) => {
      state.isBlocked = true;
    }
  },
});

export const { setCredentials, logout, setBlocked } = userSlice.actions;
export default userSlice.reducer;
