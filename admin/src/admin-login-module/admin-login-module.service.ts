import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAdminLoginModuleDto } from './dto/create-admin-login-module.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './admin.schema';
import * as jwt from 'jsonwebtoken';
import { AdminUpdateService } from './admin-update.service';
import { Response } from 'express';
import generateToken from '../utilit/generateToken';  
import { use } from 'passport';

@Injectable()
export class AdminLoginModuleService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private adminUpdateService: AdminUpdateService
  ) { }

  async create(createAdminLoginModuleDto: CreateAdminLoginModuleDto, res: Response) {
    try {
      const { username, password } = createAdminLoginModuleDto;

      // Find admin in the database
      const admin = await this.adminModel.findOne({ username }).exec();

      if (!admin) {
        throw new UnauthorizedException('Invalid username');
      }

      // Use the verifyPassword method from AdminUpdateService
      const isPasswordValid = await this.adminUpdateService.verifyPassword(
        password,
        admin.password
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      const token = generateToken(res, admin._id.toString(), 'RoleAdmin');

      return { token: token, name: username };
    } catch (error) {
      console.error('Login error:--->', error);
      throw error;
    }
  }
}
