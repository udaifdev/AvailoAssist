export interface Booking {
    serviceName: string;
    bookedDate: string;
    bookedSlot: string;
    amount: string;
    paymentMethod: string;
    workerName: string;
    bookedStatus: string;
    chat: boolean;
    bookedDescription: string;
    userId: string
    workerId: string
    _id: string;
}

export interface BookingHistoryProps {
    userId: string;
}

// types/bookingHistory.ts
export interface ReviewModalProps {
    bookingId: string;
    onClose: () => void;
    onSubmit: (review: string, rating: number, bookingId: string) => void; // Update this line
}


export interface Review {
    _id: string;          // Adding _id field
    userId: string;       // Adding userId field
    workerId: string;     // Adding workerId field
    bookingId: string;    // Adding bookingId field
    rating: number;       // Existing rating field
    review: string;       // Existing review field
    createdAt: string;    // Adding createdAt field
    updatedAt: string;    // Adding updatedAt field
    __v: number;          // Adding __v field (version key from MongoDB)
}

