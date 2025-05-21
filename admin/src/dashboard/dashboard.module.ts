import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Booking, BookingSchema } from './entities/booking.schema';
import { Payment, PaymentSchema } from './entities/payment.schema';
import { WorkersModule } from 'src/workers/workers.module';
import { Worker, WorkerSchema } from 'src/workers/entities/worker.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Booking', schema: BookingSchema },
      { name: 'Payment', schema: PaymentSchema },
      { name: 'Worker', schema: WorkerSchema },
      { name: 'User', schema: UserSchema },
    ]),
    WorkersModule,  
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [MongooseModule],
})

export class DashboardModule {}
