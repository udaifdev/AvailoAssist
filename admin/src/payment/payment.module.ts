import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Booking, BookingSchema } from 'src/dashboard/entities/booking.schema';
import { Payment, PaymentSchema } from 'src/dashboard/entities/payment.schema';
import { Worker, WorkerSchema } from 'src/workers/entities/worker.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { Admin, AdminSchema } from 'src/admin-login-module/admin.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Booking', schema: BookingSchema },
      { name: 'Payment', schema: PaymentSchema },
      { name: 'Worker', schema: WorkerSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Admin', schema: AdminSchema },
    ])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [MongooseModule],
})
export class PaymentModule { }
