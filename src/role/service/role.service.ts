import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  CreatePermissionDto,
  CreateRoleDto,
  CreateRoleWithPermissionsDto,
  PermissionDto,
  UpdatePermissionDto,
  UpdateRoleDto,
} from '../dtos/role.dto';
import { RoleDocument, RoleEntity } from '../schema/role.schema';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(RoleEntity.name) private roleModel: Model<RoleDocument>,
  ) {}

  //create roles
  async createRole(role: CreateRoleWithPermissionsDto): Promise<RoleDocument> {
    try {
      const newRole = new this.roleModel(role);

      return await newRole.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Role already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  //edit role
  async editRole(roleId: string, role: UpdateRoleDto): Promise<RoleDocument> {
    try {
      // const editedRole = await this.roleModel.findByIdAndUpdate(roleId, role, {
      //   new: true,
      // });
      // if (!editedRole) {
      //   throw new BadRequestException('Role not found');
      // }
      // return editedRole;
      const findRole = await this.roleModel.findById(roleId);
      if (!findRole) {
        throw new BadRequestException('Role not found');
      }
      Object.assign(findRole, role);
      return await findRole.save();
      
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Role already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  //get all roles
  async getRoles(search?: string, page = 1, limit = 10): Promise<any> {
    try {
      const query = search ? { name: { $regex: search, $options: 'i' } } : {};
      const roles = await this.roleModel.find(query);
      //return all except where the role name is SuperAdmin
      const filteredRoles = roles.filter((role) => role.name !== 'SuperAdmin')
      //skip and limit
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const results = {};
      results['count'] = filteredRoles.length;
      results['totalPages'] = Math.ceil(filteredRoles.length / limit);
      results['currentPage'] = page;
      results['data'] = filteredRoles.slice(startIndex, endIndex);
      return results
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  //get single role
  async getRole(roleId: string): Promise<RoleDocument> {
    try {
      const role = await this.roleModel.findById(roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      return role;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  //delete role
  async deleteRole(roleId: string): Promise<string> {
    try {
      const deletedRole = await this.roleModel.findByIdAndDelete(roleId);
      if (!deletedRole) {
        throw new BadRequestException('Role not found');
      }
      return 'role deleted';
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findRoleByName(name: string): Promise<RoleDocument> {
    try {
      const role = await this.roleModel.findOne({ name });
      return role;
    } catch (error) {
      throw error;
    }
  }

  //add permission to role
  async addPermissionToRole(
    roleId: string,
    permission: UpdatePermissionDto
  ): Promise<RoleDocument> {
    try {
      const role = await this.roleModel.findById
      (roleId);

      permission.permissions && (role.permissions = permission.permissions)
     
     permission.name && (role.name = permission.name)
      return await role.save();
     
      
    } catch (error) {
      throw error;
    }
  }

  //remove permission from role
  async removePermissionFromRole(
    roleId: string,
    permission: CreatePermissionDto,
  ): Promise<RoleDocument> {
    try {
      const role = await this.roleModel.findById(roleId);
      if (!role) {
        throw new BadRequestException('Role not found');
      }
      //remove each of the permission from the role if it exists in the role
      for (const perm of permission.permissions) {
        const index = role.permissions.findIndex(
          (item) => item.url === perm.url && item.module === perm.module,
        );
        if (index > -1) {
          role.permissions.splice(index, 1);
        }
      }
      return await role.save();
    } catch (error) {
      throw error;
    }
  }
}


