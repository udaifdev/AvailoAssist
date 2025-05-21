import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/api/admin')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/login')
  getHello(): string {
    console.log('admin get is working hitte to route --------->')
    return this.appService.getHello();
  }
}
