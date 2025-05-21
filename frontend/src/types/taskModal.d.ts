export interface TaskDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerId?: string;
}

export interface SlotItem {
  slot: string;
  booked: boolean;
  _id: string;
}

export interface DateItem {
  date: string;
  slots: SlotItem[];
  _id: string;
}

export interface FixedSlot {
  dayOfWeek: string; // e.g., 'monday', 'tuesday', etc.
  slots: {
    slot: string; // Time range, e.g., "8:00am to 10:30am"
    enabled: boolean;
  }[];
}

export interface Worker {
  workerId: string;
  fullName: string;
  profilePicture?: string;
  category: string;
  availability: {
    dates: DateItem[];
    fixedSlots: FixedSlot[];
  };
}
