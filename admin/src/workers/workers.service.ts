import { Injectable } from '@nestjs/common';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Worker } from './entities/worker.entity';

@Injectable()
export class WorkersService {
  constructor(@InjectModel(Worker.name) private readonly workerModel: Model<Worker>,) { }

  async findAll(): Promise<Worker[]> {
    try {
      return this.workerModel.find().sort({ createdAt: -1 }).exec(); // Fetch all workers
    } catch (error) {
      console.error('Error fetching workers:---> ', error);
      throw new Error('Failed to fetch worker');
    }
  }
  

  // workers.service.ts
async update(workerId: string, status: string): Promise<any> {
  try {
      console.log('Service: Updating worker status...', { workerId, status });
      
      // First, let's verify the document exists
      const worker = await this.workerModel.findById(workerId);
      if (!worker) {
          throw new Error('Worker not found');
      }

      // Explicitly update the serviceStatus field
      const updatedWorker = await this.workerModel.findByIdAndUpdate(
          workerId,
          { $set: { serviceStatus: status } },  // Use $set operator explicitly
          { 
              new: true,      // Return updated document
              runValidators: true  // Run model validators
          }
      );

      console.log('After update - updatedWorker:......', updatedWorker?.serviceStatus);
      
      // Verify the update took effect
      const verifyUpdate = await this.workerModel.findById(workerId);
      console.log('Verification check - worker status:.....', verifyUpdate);

      return {
          success: true,
          message: 'Status updated successfully',
          worker: updatedWorker
      };

  } catch (error) {
      console.error('Error updating worker status:', error);
      throw new Error(`Failed to update worker status: ${error.message}`);
  }
}

  // create(createWorkerDto: CreateWorkerDto) {
  //   return 'This action adds a new worker';
  // }


  // findOne(id: number) {
  //   return `This action returns a this route #${id} worker`;
  // }



  // remove(id: number) {
  //   return `This action removes a #${id} worker`;
  // }
}
