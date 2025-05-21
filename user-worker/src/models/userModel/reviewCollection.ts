import mongoose, { Schema, Document } from "mongoose";

// Define the Review interface
export interface IReview extends Document {
    userId: mongoose.Types.ObjectId;
    workerId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
    rating: number;
    review: string;
    createdAt: Date;
    updatedAt: Date;
}

// Create the Review schema
const ReviewSchema: Schema<IReview> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        workerId: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
        bookingId: { type: Schema.Types.ObjectId, ref: "Booking",  required: true  },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String, maxlength: 200 },
    },
    {
        timestamps: true,  
    }
);

// Export the model
export const Review = mongoose.model<IReview>("Review", ReviewSchema);
