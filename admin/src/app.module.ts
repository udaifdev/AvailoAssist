import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminLoginModuleModule } from './admin-login-module/admin-login-module.module';
import { UsersModule } from './users/users.module';
import { ServiceModule } from './service/service.module';
import { WorkersModule } from './workers/workers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: join(__dirname, '../../user-worker/.env'), isGlobal: true, }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AdminLoginModuleModule,
    UsersModule,
    ServiceModule,
    WorkersModule,
    DashboardModule,
    PaymentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
