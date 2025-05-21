import { Test, TestingModule } from '@nestjs/testing';
import { AdminLoginModuleController } from './admin-login-module.controller';
import { AdminLoginModuleService } from './admin-login-module.service';

describe('AdminLoginModuleController', () => {
  let controller: AdminLoginModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminLoginModuleController],
      providers: [AdminLoginModuleService],
    }).compile();

    controller = module.get<AdminLoginModuleController>(AdminLoginModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
