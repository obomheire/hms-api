import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreatePermissionDto,
  CreateRoleDto,
  CreateRoleWithPermissionsDto,
  UpdatePermissionDto,
  UpdateRoleDto,
} from '../dtos/role.dto';
import { RoleDocument } from '../schema/role.schema';
import { RoleService } from '../service/role.service';

@ApiBearerAuth('Bearer')
@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiBody({
    type: CreateRoleWithPermissionsDto,
    description: 'Create Role request body',
  })
  //create role
  @Post()
  async createRole(@Body() role: CreateRoleWithPermissionsDto): Promise<RoleDocument> {
    const roleBody = new CreateRoleWithPermissionsDto();
    roleBody.name = role.name;
    roleBody.permissions = role.permissions;
    const isValid = roleBody.validate();
    if (!isValid) {
      throw new BadRequestException('Invalid request body');
    }

    return await this.roleService.createRole(role);
   
  }

  @ApiParam({
    name: 'roleId',
    type: 'string',
    description: 'update role by id',
  })
  @ApiBody({
    type: UpdateRoleDto,
    description: 'update role request body',
  })
  //edit role
  @Patch(':roleId')
  async editRole(
    @Param('roleId') roleId: string,
    @Body() role: UpdateRoleDto,
  ): Promise<RoleDocument> {
    return await this.roleService.editRole(roleId, role);
  }

  //get all roles
  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'search role by name',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'page number',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'limit number',
  })
  @Get()
  async getRoles(@Query('search') search: string, @Query('page') page: number, @Query('limit') limit: number) {
    return await this.roleService.getRoles(search, page, limit);
  }

  @ApiParam({
    name: 'roleId',
    type: 'string',
    description: 'get role by id',
  })
  //get role by id
  @Get(':roleId')
  async getRoleById(@Param('roleId') roleId: string): Promise<RoleDocument> {
    return await this.roleService.getRole(roleId);
  }

  @ApiParam({
    name: 'roleId',
    type: 'string',
    description: 'delete role by id',
  })
  //delete role
  @Delete(':roleId')
  async deleteRole(@Param('roleId') roleId: string): Promise<string> {
    return await this.roleService.deleteRole(roleId);
  }

  //add permission to role
  @ApiParam({
    name: 'roleId',
    type: 'string',
    description: 'add permission to role by id',
  })
  @ApiBody({
    type: UpdatePermissionDto,
    description: 'add permission to role request body',
  })
  @Patch('permission/:roleId')
  async addPermissionToRole(
    @Param('roleId') roleId: string,
    @Body() permission: UpdatePermissionDto,
  ): Promise<RoleDocument> {
    const updatePermissionDto = new UpdatePermissionDto();
    updatePermissionDto.permissions = permission.permissions;
    updatePermissionDto.name = permission?.name;
    const isValid = updatePermissionDto.validate();
    if (!isValid) {
      throw new BadRequestException('Invalid permission(s) specified');
    }
    return await this.roleService.addPermissionToRole(roleId, updatePermissionDto);
  }

  //remove permission from role
  // @ApiParam({
  //   name: 'roleId',
  //   type: 'string',
  //   description: 'remove permission from role by id',
  // })
  // @ApiBody({
  //   type: UpdatePermissionDto,
  //   description: 'remove permission from role request body',
  // })
  // @Delete('permission/:roleId')
  // async removePermissionFromRole(
  //   @Param('roleId') roleId: string,
  //   @Body() permission: CreatePermissionDto,
  // ): Promise<RoleDocument> {
  //   const updatePermissionDto = new UpdatePermissionDto();
  //   updatePermissionDto.permissions = permission.permissions;
  //   const isValid = updatePermissionDto.validate();
  //   if (!isValid) {
  //     throw new BadRequestException('Invalid permission(s) specified');
  //   }
  //   return await this.roleService.removePermissionFromRole(roleId, updatePermissionDto);
  // }
}
