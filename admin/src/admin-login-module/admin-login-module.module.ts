import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminLoginModuleService } from './admin-login-module.service';
import { AdminLoginModuleController } from './admin-login-module.controller';
import { JwtStrategy } from './jwt.strategy';
import { Admin, AdminSchema } from './admin.schema';
import { AdminUpdateService } from './admin-update.service';
import { UsersModule } from 'src/users/users.module';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
     UsersModule, // Use UsersModule to access user data
  ],
  controllers: [AdminLoginModuleController],
  providers: [AdminLoginModuleService, JwtStrategy, AdminUpdateService],
  exports: [AdminUpdateService, MongooseModule],

})
export class AdminLoginModuleModule { }
