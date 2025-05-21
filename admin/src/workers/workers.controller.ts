import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { Worker } from './entities/worker.entity'; // Adjust the path as needed


@Controller('/api/admin')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) { }


  @Get('/getallWorkers')
  async findAll() {
    const workers = this.workersService.findAll(); // Return all workers
    return workers
  }
  
  
  @Patch('/updateServiceStatus/:id')
  async update(@Param('id') id: string,  @Body('status') status: string ){
    console.log('Hitted to ge worker route............')
    return this.workersService.update(id, status);
  }

  // @Post()
  // create(@Body() createWorkerDto: CreateWorkerDto) {
  //   return this.workersService.create(createWorkerDto);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.workersService.findOne(+id);
  // }

  

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.workersService.remove(+id);
  // }
}
