import { Controller, Get, Post, Body,Put, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import cloudinary from './cloud/cloudinary.config';
import * as fs from 'fs-extra';
import { Express } from 'express';

@Controller('/api/admin')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) { }


  @Get('/getAllServices')
  async findAll() {
      const services = await this.serviceService.findAll();
      return services;
  }



  @Post('/add-service')
  @UseInterceptors(FileInterceptor('picture'))
  async createService(@Body() createServiceDto: CreateServiceDto, @UploadedFile() file: Express.Multer.File,) {
    console.log('Processing add service request...');

    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      const result = await cloudinary.uploader.upload(file.path);
      await fs.remove(file.path);

      const serviceData = {
        ...createServiceDto,
        picture: result.secure_url,
      };

      // console.log('Service data:---> ', serviceData);
      return await this.serviceService.create(serviceData);
    } catch (error) {
      if (file?.path) {
        await fs.remove(file.path).catch(console.error);
      }
      console.error('Upload error:---> ', error);
      throw new HttpException(
        `Upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  @Put('/updateService/:id')
  @UseInterceptors(FileInterceptor('picture'))
  async updateService( @Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto,@UploadedFile() file: Express.Multer.File,) {
    try {
      if (file) {
        const result = await cloudinary.uploader.upload(file.path);
        await fs.remove(file.path);
        updateServiceDto.picture = result.secure_url;
      }

      const updatedService = await this.serviceService.update(id, updateServiceDto);
      return updatedService;

    } catch (error) {

      if (file?.path) {
        await fs.remove(file.path).catch(console.error);
      }
      console.error('Error updating service:', error);
      throw new HttpException(
        `Update failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.serviceService.findOne(+id);
  // }


  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.serviceService.remove(+id);
  // }
}
