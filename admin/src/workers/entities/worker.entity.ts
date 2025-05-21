import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Worker extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  streetAddress: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true })
  workRadius: string;

  @Prop({ required: true })
  workExperience: string;

  @Prop()
  profilePicture?: string;

  @Prop()
  governmentId?: string;

  @Prop({ required: true })
  governmentIdNo: string;

  @Prop({
    type: {
      days: { type: String, default: 'Monday to Friday, 9:00 AM - 5:00 PM' },
      unavailableDates: { type: String, default: '' },
    },
  })
  availability: {
    days: string;
    unavailableDates: string;
  };

  @Prop({
    type: {
      newJobs: { type: Boolean, default: true },
      newPayments: { type: Boolean, default: true },
    },
  })
  notifications: {
    newJobs: boolean;
    newPayments: boolean;
  };

  @Prop({ type: String, enum: ['pending', 'Accepted', 'Rejected'], default: 'pending' })
  serviceStatus: string;

  @Prop({ type: Boolean, default: true })
  status: boolean;
}

export const WorkerSchema = SchemaFactory.createForClass(Worker);