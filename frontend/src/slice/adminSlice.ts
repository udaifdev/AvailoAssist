// userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  AdminDetails: { name: string;} | null;
  token: string | null;
}

const initialState: AdminState = {
  AdminDetails: localStorage.getItem('AdminDetails')
    ? JSON.parse(localStorage.getItem('AdminDetails') as string) // Type assertion to ensure it's a string
    : null,
  token: localStorage.getItem('token') || null // Fallback to null if token is not present
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    set_admin_Credentials: (state, action: PayloadAction<{ name: string; token: string }>) => {
      state.AdminDetails = action.payload;
      state.token = action.payload.token;
      localStorage.setItem('AdminDetails', JSON.stringify(action.payload));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.AdminDetails = null;
      state.token = null;
      localStorage.removeItem('AdminDetails');
      localStorage.removeItem('token');
    }
  },
});

export const { set_admin_Credentials, logout } = adminSlice.actions;
export default adminSlice.reducer;
