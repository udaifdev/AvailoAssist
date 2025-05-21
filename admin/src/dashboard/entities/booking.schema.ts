import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface Coordinates {
  lat: number; // Latitude
  lng: number; // Longitude
}

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Worker', required: true })
  workerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId: Types.ObjectId;

  @Prop({ required: true })
  bookedDate: string;

  @Prop({ required: true })
  bookedSlot: string;

  @Prop()
  bookedDescription: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['online', 'cod'] })
  paymentMethod: 'online' | 'cod';

  @Prop({ required: true })
  workerName: string;

  @Prop({ default: 'Pending', enum: ['Pending', 'Confirmed', 'Cancelled'] })
  bookedStatus: 'Pending' | 'Confirmed' | 'Cancelled';

  @Prop({ required: true })
  location: string;

  @Prop({ default: false })
  chat: boolean;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ type: { lat: Number, lng: Number }, required: true })
  coordinates: Coordinates;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
