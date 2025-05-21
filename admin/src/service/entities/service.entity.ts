import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Service extends Document {
  @Prop({ required: true })
  categoryName!: string;

  @Prop({ required: true })
  categoryDescription!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  picture!: string;

  @Prop({ default: 'active' })
  status!: string;
}

// Define the ServiceDocument type which includes the Document properties
export type ServiceDocument = Service & Document;

export const ServiceSchema = SchemaFactory.createForClass(Service);
