import { Body, Controller, Post, Get, Query, Patch, Param, Delete } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FilterQuery } from 'mongoose';
import { UserDocument, UserEntity } from 'src/user/schema/user.schema';
import { DepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';
import { DepartmentDocument, DepartmentEntity } from '../schema/department.schema';
import { DepartmentService } from '../service/department.service';

@ApiBearerAuth("Bearer")
@ApiTags('Department')
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @ApiBody({
    type: DepartmentDto,
    description: 'create hospital department',
  })
  @Post('add-department')
  async addDepartment(@Body() body: DepartmentDto) {
    return await this.departmentService.createDepartment(body);
  }

  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'limit number',
  })
  @ApiQuery({
    name: 'query',
    type: DepartmentEntity,
    description: 'Query with any value in the department collections',
  })
  @Get('get-all-departments')
  async findAllDepartments(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('query') query: FilterQuery<DepartmentDocument>,
  ) {
    return await this.departmentService.findAllDepartments(page, limit, query);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Get department by id',
  })
  @Get('get-department-by-id/:id')
  async findDepartmentById(@Param('id') id: string) {
    return await this.departmentService.findDepartmentById(id);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Update department by id',
  })
  @ApiBody({
    type: UpdateDepartmentDto,
    description: 'Request body for the department update',
  })
  @Patch('update-department/:id')
  async updateDepartment(
    @Param('id') id: string,
    @Body() body: UpdateDepartmentDto,
  ) {
    return await this.departmentService.updateDepartment(id, body);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Delete department by id',
  })
  @Delete('delete-department/:id')
  async deleteDepartment(@Param('id') id: string) {
    return await this.departmentService.deleteDepartment(id);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Transfer staff by id',
  })
  @ApiBody({
    type: 'string',
    description: 'Transfer staff with staffId and newDeptId',
  })
  @Patch('transfer-staff/:id')
  async transferStaffToDepartment(
    @Param('id') id: string,
    @Body() body: { staffId: string; newDeptId: string },
  ) {
    return await this.departmentService.transferStaffToDepartment(
      id,
      body.staffId,
      body.newDeptId,
    );
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Remove staff from department by id',
  })
  @ApiBody({
    type: 'string',
    description: 'Remove one/more staff from department by id',
  })
  @Patch('remove-staff/:deptId')
  async removeStaffFromDepartment(
    @Param('deptId') deptId: string,
    @Body() body: { staffId: string[] },
  ) {
    return await this.departmentService.removeStaffFromDepartment(
      deptId,
      body.staffId,
    );
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Get detailes about a department by id',
  })
  @Get('dept-details/:id')
  async getDeptStat(@Param('id') id: string) {
    return await this.departmentService.getDeptStat(id);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Search for staff by staff id',
  })
  // @ApiParam({
  //   name: 'query',
  //   type: UserEntity,
  //   description: 'Search for staff by staff id',
  // })
  //search staff of dept
  @Get('search-staff/:id')
  async searchStaffOfDept(
    @Param('id') id: string,
    @Query() query: FilterQuery<UserDocument>,
  ) {
    return await this.departmentService.searchStaffOfDepartment(id, query);
  }

  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'Search for department by name',
  })
  @Get('staff-not-in-dept')
  async searchDepartment(@Query('search') search?: string) {
    return await this.departmentService.getStaffNotInDepartment(search);
  }

  //get doctors in department
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Get doctors in department by id',
  })
  @Get('get-doctors/:id')
  async getDoctorsInDepartment(@Param('id') id: string) {
    return await this.departmentService.getDoctorsInDepartment(id);
  }
}
