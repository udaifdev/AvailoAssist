import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service, ServiceDocument } from './entities/service.entity';


@Injectable()
export class ServiceService {
  constructor(@InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,) { }

  async findAll(): Promise<any[]> {
    try {
      const services = await this.serviceModel.aggregate([
        {
          // First lookup to get workers based on category name
          $lookup: {
            from: 'workers',
            let: { serviceName: '$categoryName' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$category', '$$serviceName'] },
                      { $eq: ['$status', true] },
                      { $eq: ['$serviceStatus', 'Accepted'] }
                    ]
                  }
                }
              }
            ],
            as: 'workers'
          }
        },
        {
         // Second lookup to get bookings based on serviceName
         $lookup: {
          from: 'bookings',
          let: { serviceName: '$categoryName' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$serviceName', '$$serviceName'] }, // Matching serviceName
                    { $eq: ['$bookedStatus', 'Completed'] }  // Only completed bookings
                  ]
                }
              }
            }
          ],
          as: 'bookings'
        }
      },
      {
        // Project the final results
        $project: {
          _id: 1,
          categoryName: 1,
          categoryDescription: 1,
          picture: 1,
          status: 1,
          amount: 1,
          workerCount: { $size: '$workers' }, // Count only active and accepted workers
          workers: {
            $map: {
              input: '$workers',
              as: 'worker',
              in: {
                _id: '$$worker._id',
                fullName: '$$worker.fullName',
                email: '$$worker.email',
                serviceStatus: '$$worker.serviceStatus',
                status: '$$worker.status'
              }
            }
          },
          totalOrders: { $size: '$bookings' },  // Count of completed bookings
          revenue: {
            $multiply: [
              '$amount',
              { $size: '$bookings' }  // Multiply amount by number of completed bookings
            ]
          }
        }
      },
      {
        // Optional: Sort by worker count (descending)
        $sort: {
          workerCount: -1
        }
      }
    ]);

      return services;

    } catch (error) {
      console.error('Error in service aggregation:', error);
      throw new HttpException( 'Failed to fetch services with statistics',HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      const existingService = await this.serviceModel.findOne({ categoryName: createServiceDto.categoryName });
  
      if (existingService) {
        throw new HttpException({ message: 'categoryName already exists' },HttpStatus.BAD_REQUEST);
      }
  
      const createdService = new this.serviceModel(createServiceDto);
      return await createdService.save(); 
       
    } catch (error) {
      console.error('Error in service creation:', error);
      throw new HttpException({ message: 'An unexpected error occurred while creating the service' },HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<ServiceDocument> {
    try {
      const service = await this.serviceModel.findByIdAndUpdate(id, updateServiceDto, { new: true });
      console.log('edit service -------> ', service)

      if (!service) {
        throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
      }
      return service;
    } catch (error) {
      console.error('Error edit services:---> ', error);
      throw new Error('Failed to edit services');
    }
  }


  // findOne(id: number) {
  //   return `This action returns a #${id} service`;
  // }


  // remove(id: number) {
  //   return `This action removes a #${id} service`;
  // }
}
