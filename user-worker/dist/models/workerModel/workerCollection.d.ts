import { Document, Model } from "mongoose";
import { ObjectId } from 'mongoose';
export interface WorkerDocument extends Document {
    _id: ObjectId;
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
        days: string;
        unavailableDates: string;
    };
    notifications: {
        newJobs: boolean;
        newPayments: boolean;
    };
}
declare const WorkerModel: Model<WorkerDocument>;
export default WorkerModel;
