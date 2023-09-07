import { SetMetadata } from '@nestjs/common';

export const AllowedPermissions = (...roles: string[]) =>
  SetMetadata('permissions', roles);
