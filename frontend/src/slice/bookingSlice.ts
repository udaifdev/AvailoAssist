  import { createSlice, PayloadAction } from '@reduxjs/toolkit';

  interface ServiceItem {
    categoryName: string;
    categoryDescription: string;
    amount: number | string;
    picture: string;
  }

  interface WorkerDetails {
    workerId: string;  
    name: string;
    profilePicture?: string;
    category: string;
    date: string;
    slotId: string;
    timeSlot: string;
    duration: string;
  }

  interface BookingState {
    selectedService: ServiceItem | null;
    location: string;
    description: string;
    workerDetails: WorkerDetails | null;
    coordinates: { lat: number; lng: number } | null;  //coordinates field
  }

  const initialState: BookingState = {
    selectedService: null,
    location: '',
    description: '',
    workerDetails: null,
    coordinates: null,
  };

  const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
      setSelectedService: (state, action: PayloadAction<ServiceItem>) => {
        state.selectedService = action.payload;
      },
      setLocation: (state, action: PayloadAction<string>) => {
        state.location = action.payload;
      },
      setDescription: (state, action: PayloadAction<string>) => {
        state.description = action.payload;
      },
      setWorkerDetails: (state, action: PayloadAction<WorkerDetails>) => {
        state.workerDetails = action.payload;
      },
      setCoordinates: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
        state.coordinates = action.payload;
      },
      clearBooking: (state) => {
        state.selectedService = null;
        state.location = '';
        state.description = '';
        state.workerDetails = null;
        state.coordinates = null;
      },
    },
  });

  export const {
    setSelectedService,
    setLocation,
    setDescription,
    setWorkerDetails,
    setCoordinates,
    clearBooking,
  } = bookingSlice.actions;
  export default bookingSlice.reducer;
