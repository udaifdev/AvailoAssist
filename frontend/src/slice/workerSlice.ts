// userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkerState {
  workerDetails: { id: string; name: string; email: string; serviceStatus: string; profilePicture?: string;  } | null;
  workerToken: string | null;
}

// Initial state now includes worker details and token from localStorage
const initialState: WorkerState = {
  workerDetails: localStorage.getItem('workerDetails')
    ? JSON.parse(localStorage.getItem('workerDetails') as string) // the full worker object is stored
    : null,
    workerToken: localStorage.getItem('workerToken') || null,
};

const workerSlice = createSlice({
  name: 'worker',
  initialState,
  reducers: {
    set_Worker_Credentials: (state, action: PayloadAction<{ id: string; name: string; email: string; serviceStatus: string; workerToken: string }>) => {
      // Set the worker details and token to the state
      state.workerDetails = action.payload;
      state.workerToken = action.payload.workerToken;

      // Store both the worker details and token in localStorage
      localStorage.setItem('workerDetails', JSON.stringify(action.payload)); // Full worker object
      localStorage.setItem('workerToken', action.payload.workerToken); // Just the token
    },
    logout: (state) => {
      // Reset state and remove details from localStorage
      state.workerDetails = null;
      state.workerToken = null;
      localStorage.removeItem('workerDetails');
      localStorage.removeItem('workerToken');
    }
  },
});

export const { set_Worker_Credentials, logout } = workerSlice.actions;
export default workerSlice.reducer;
