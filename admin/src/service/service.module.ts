import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ServiceSchema, Service } from './entities/service.entity';
  

@Module({
  imports: [MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
  MulterModule.register({
    dest: './uploads',
  }),
],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule { }
