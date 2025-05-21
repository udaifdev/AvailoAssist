import { Module } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { WorkersController } from './workers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from './entities/worker.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Worker.name, schema: WorkerSchema }]),
  ],
  controllers: [WorkersController],
  providers: [WorkersService],
  exports: [MongooseModule],
})
export class WorkersModule {}
