import { Test, TestingModule } from '@nestjs/testing';
import { AdminLoginModuleService } from './admin-login-module.service';

describe('AdminLoginModuleService', () => {
  let service: AdminLoginModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminLoginModuleService],
    }).compile();

    service = module.get<AdminLoginModuleService>(AdminLoginModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
