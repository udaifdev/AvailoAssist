// admin.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'admins' })
export class Admin extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: { totalEarnings: { type: Number, default: 0 }, balanceAmount: { type: Number, default: 0 }, totalWithdraw: { type: Number, default: 0 }, }, default: { totalEarnings: 0, balanceAmount: 0, totalWithdraw: 0 } })
  wallet: {
    totalEarnings: number;
    balanceAmount: number;
    totalWithdraw: number;
  };
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
export type AdminDocument = Admin & Document;


// export interface AdminDocument extends Admin, Document { }