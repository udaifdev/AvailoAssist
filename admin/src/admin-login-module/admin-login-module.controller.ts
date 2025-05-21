import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { AdminLoginModuleService } from './admin-login-module.service';
import { CreateAdminLoginModuleDto } from './dto/create-admin-login-module.dto';
import { Response } from 'express';

@Controller('/api/admin')
export class AdminLoginModuleController {
  constructor(private readonly adminLoginModuleService: AdminLoginModuleService) { }

  @Post('/admin-login')
  async login(@Body() createAdminLoginModuleDto: CreateAdminLoginModuleDto, @Res() res: Response) {
    const result = await this.adminLoginModuleService.create(createAdminLoginModuleDto, res);
    return res.status(200).send(result);
  }

  @Post('/admin-logout')
  async logout(@Res() res: Response) {
    try {
      console.log('logout path hidded.....')
      // Clear the token cookie with same options
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Ensure this matches the setting in generateToken
        sameSite: 'strict', // SameSite should match
        path: '/', // Path should also match the one used during cookie creation
      });
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error: ', error);
      return res.status(500).json({ message: 'An error occurred during logout' });
    }
  }


}
