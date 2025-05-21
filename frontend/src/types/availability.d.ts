export interface TimeSlot {
  slot: string;
  booked: boolean;
  _id: string;
}

export interface FixedTimeSlot {
  slot: string;
  enabled: boolean;
  _id?: string;
}

export interface FixedDaySlot {
  dayOfWeek: string;
  slots: FixedTimeSlot[];
  _id?: string;
}

export interface WeeklyTimeSlot {
  dayOfWeek: number;
  start: string;
  end: string;
}

export interface AvailabilityDate {
  date: string;
  slots: TimeSlot[];
  _id: string;
}

export interface Availability {
  dates: {
      date: string;
      slots: TimeSlot[];
  }[];
  weeklySlots: WeeklyTimeSlot[];
  fixedSlots: FixedDaySlot[]; // Add fixed slots to the interface
}

export interface AvailabilityProps {
  availability: Availability;
  setAvailability: React.Dispatch<React.SetStateAction<Availability>>;
  token: string;
  axiosInstance: any;
  editMode: boolean;
}

export interface WeeklySlotsProps {
  availability: {
      weeklySlots: WeeklyTimeSlot[];
  };
  token: string;
  axiosInstance: any;
  editMode: boolean;
  onUpdate: () => Promise<void>;
}