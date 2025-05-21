import mongoose, { Document, Schema } from 'mongoose';

// Define the user interface
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    phone?: string;
    image?: string;
    status: boolean;  
    _id: mongoose.Types.ObjectId;
}

// Define the schema for the user
const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    image: { type: String },
    status: { type: Boolean, default: true }, // Set default value to true
},
    {
        timestamps: true,  
    }
);

// Create the model for the user
const userModel = mongoose.model<IUser>('User', userSchema);

export default userModel;
