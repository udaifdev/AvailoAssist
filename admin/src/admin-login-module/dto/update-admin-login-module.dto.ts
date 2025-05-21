import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminLoginModuleDto } from './create-admin-login-module.dto';

export class UpdateAdminLoginModuleDto extends PartialType(CreateAdminLoginModuleDto) {}
