// admin-update.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from './admin.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUpdateService implements OnModuleInit {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>) { }

  async onModuleInit() {
    try {
      // First, check if admin exists
      const admin = await this.adminModel.findOne({ username: 'udaifuzz' }).exec();

      if (!admin) {
        console.log('Creating new admin user...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt); // Use your desired default password

        const newAdmin = new this.adminModel({
          username: 'udaifuzz',
          password: hashedPassword
        });
        await newAdmin.save();
        console.log('New admin created successfully');
        return;
      }

      // For existing admin, update password if needed
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt); // Use your desired password

      await this.adminModel.updateOne(
        { username: 'udaifuzz' },
        { $set: { password: hashedPassword } }
      );

      console.log('Admin password updated successfully');
    } catch (error) {
      console.error('Error in admin setup:', error);
    }
  }

  // Add a method to verify password hash
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    console.log('Verifying password...');
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Password match:', isMatch);
    return isMatch;
  }
}