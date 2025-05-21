import mongoose, { Schema, Document } from 'mongoose';

interface ICoordinates {
    lat: number; // Latitude
    lng: number; // Longitude
}

// Define the Booking Interface (TypeScript interface)
interface IBooking extends Document {
    workerId: mongoose.Types.ObjectId; // Worker ID (refers to worker's profile)
    userId: mongoose.Types.ObjectId; // User ID (refers to the user who made the booking)
    paymentId:mongoose.Types.ObjectId
    bookedDate: string; // Date of the service
    bookedSlot: string; // Time slot for the booking
    amount: number; // Total amount for the service
    bookedDescription: string;
    paymentMethod: 'online' | 'cod'; // Payment method (Online or Cash on Delivery)
    workerName: string; // Name of the worker
    bookedStatus: 'Pending' | 'Confirmed' | 'Cancelled'; // Status of the booking
    location: string; // Location of the task
    chat: boolean; // Whether chat is available with the worker
    serviceName: string; // Service name (from the selected service)
    coordinates: ICoordinates;
    createdAt: Date; // Timestamp for when the booking is created
    updatedAt: Date; // Timestamp for when the booking is updated
}

// Define the Schema for the Booking collection
const bookingSchema: Schema = new Schema(
    {
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
        bookedDate: { type: String, required: true },
        bookedSlot: { type: String, required: true },
        bookedDescription: { type: String },
        amount: { type: Number, required: true },
        paymentMethod: { type: String, enum: ['online', 'cod'], required: true },
        workerName: { type: String, required: true },
        bookedStatus: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
        location: { type: String, required: true },
        chat: { type: Boolean, default: false },
        serviceName: { type: String, required: true },
        coordinates: {
            lat: { type: Number, required: true }, // Latitude
            lng: { type: Number, required: true }, // Longitude
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create the Booking model using the schema
const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
