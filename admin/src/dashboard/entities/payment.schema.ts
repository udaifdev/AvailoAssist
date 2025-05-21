import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Booking' })
  bookingId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Worker', required: true })
  workerId: Types.ObjectId;

  @Prop({ required: true, enum: ['success', 'pending', 'failed'] })
  paymentStatus: 'success' | 'pending' | 'failed';

  @Prop({ required: true, enum: ['online', 'cod', 'withdrawal'] })
  paymentMethod: 'online' | 'cod' | 'withdrawal';

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: Date.now })
  paymentDate: Date;

  @Prop({ required: true, enum: ['service', 'withdrawal'] })
  transactionType: 'service' | 'withdrawal';

  @Prop()
  paymentIntentId?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
