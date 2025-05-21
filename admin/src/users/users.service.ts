import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,) { }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userModel.find().sort({ createdAt: -1 }).exec();
      return users;
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw new Error('Error fetching users from the database.');
    }
  }

 async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      return updatedUser;

    } catch (error) {
      console.error('Error users status changing.........', error.message);
      throw new Error('Error users status changing....');
    }
  }


  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id}`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
