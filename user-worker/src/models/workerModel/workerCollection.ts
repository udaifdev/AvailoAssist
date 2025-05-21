import mongoose, { Schema, Document, Model } from "mongoose";
import { ObjectId } from 'mongoose';



// Define the Worker interface
export interface WorkerDocument extends Document {
  _id: ObjectId; // Explicitly type _id
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  category: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  workRadius: string;
  workExperience: string;
  profilePicture?: string;
  governmentId?: string;
  governmentIdNo: string;
  availability: {
    fixedSlots: {
      dayOfWeek: string; // 'monday', 'tuesday', etc.
      slots: {
        slot: string; // Time range "start to end"
        enabled: boolean; // Whether this fixed slot is currently active
      }[];
    }[];
    dates: {
      date: string; // In the format "MM/DD/YY"
      slots: {
        slot: string; // Time range "start to end"
        booked: boolean; // Status to track if the slot is booked
      }[];
    }[];
    unavailableDates: string[]; // Specific dates worker is unavailable
  };
  notifications: {
    newJobs: boolean;
    newPayments: boolean;
  };
  status: boolean;
  serviceStatus: string;
  totalEarnings: number; // Total earnings over time
  wallet: {
    balanceAmount: number; // Available wallet balance
    totalWithdraw: number; // Total amount withdrawn so far
  };
}

// Updated schema
const WorkerSchema: Schema<WorkerDocument> = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  category: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: true },
  workRadius: { type: String, required: true },
  workExperience: { type: String, required: true },
  profilePicture: { type: String, default: null },
  governmentId: { type: String, default: null },
  governmentIdNo: { type: String, required: true },
  availability: {
    fixedSlots: [{
      dayOfWeek: { type: String, required: true, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
      slots: [{
        slot: { type: String, required: true },
        enabled: { type: Boolean, default: true }
      }]
    }],
    dates: [
      {
        date: { type: String, required: true }, // Date in MM/DD/YY format
        slots: [
          {
            slot: { type: String, required: true }, // Time range like "8:00am to 10:30am"
            booked: { type: Boolean, default: false } // Status to track if the slot is booked
          }
        ],
      }
    ],
    unavailableDates: { type: [String], default: [] }, // Array of unavailable dates (MM/DD/YY format)
  },
  notifications: {
    newJobs: { type: Boolean, default: true },
    newPayments: { type: Boolean, default: true },
  },
  status: { type: Boolean, default: true },
  serviceStatus: { type: String, default: "pending" },
  totalEarnings: { type: Number, default: 0 }, // Initialize with 0
  wallet: {
    balanceAmount: { type: Number, default: 0 }, // Initialize with 0
    totalWithdraw: { type: Number, default: 0 }, // Initialize with 0
  },
},
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the model
const WorkerModel: Model<WorkerDocument> = mongoose.model<WorkerDocument>("Worker", WorkerSchema);
export default WorkerModel;
