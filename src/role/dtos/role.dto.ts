// import { ApplicationPermissions } from 'src/utils/enums/permissions.enum';
// import { RoleTypeEnum } from 'src/utils/enums/role.enum';

// export class RoleDto {
//   name: string;
//   description: string;
//   organisation: string;
//   roleType: RoleTypeEnum;
//   permissions: ApplicationPermissions[];
// }

import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { urls } from '../constants/constant';
import { Type } from 'class-transformer';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  // @ApiPropertyOptional()
  // @IsString()
  // @IsOptional()
  // roleType: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class PermissionDto {
  @IsString()
  url: string;

  @IsString()
  module: string;
}

export class CreatePermissionDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

}

export class UpdatePermissionDto {
  @ApiProperty()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  validate(): boolean {
    const allowedUrls = urls.map((item) => item.url);

    for (const permission of this.permissions) {
      const permissionUrl = permission.url;
      const permissionModule = permission.module;
      const isAllowed = urls.some(
        (item) =>
          item.url === permissionUrl && item.module === permissionModule,
      );

      if (!isAllowed) {
        return false;
      }
    }

    return true;
  }
}


export class CreateRoleWithPermissionsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

  validate(): boolean {
    const allowedUrls = urls.map((item) => item.url);

    for (const permission of this.permissions) {
      const permissionUrl = permission.url;
      const permissionModule = permission.module;
      const isAllowed = urls.some(
        (item) =>
          item.url === permissionUrl && item.module === permissionModule,
      );

      if (!isAllowed) {
        return false;
      }
    }

    return true;
  }
}