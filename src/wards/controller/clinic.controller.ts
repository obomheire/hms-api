import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FilterQuery, Types } from 'mongoose';
import { CreateClinicDto, UpdateClinicDto } from '../dto/clinic.dto';
import { ClinicDocument } from '../schema/clinic.schema';
import { ClinicService } from '../service/clinic.service';

@ApiBearerAuth("Bearer")
@ApiTags('Wards Clinic')
@Controller('clinic')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @ApiBody({
    type: CreateClinicDto,
    description: 'create a clinic request body',
  })
  @Post()
  async createClinic(@Body() clinic: CreateClinicDto): Promise<ClinicDocument> {
    return await this.clinicService.create(clinic);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'update a single clinic by id',
  })
  @ApiBody({
    type: UpdateClinicDto,
    description: 'update a clinic request body',
  })
  //update clinic
  @Patch(':id')
  async updateClinic(
    @Param('id') id: string,
    @Body() clinic: UpdateClinicDto,
  ): Promise<ClinicDocument> {
    return await this.clinicService.updateClinic(id, clinic);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'assign staff to clinic by id',
  })
  @ApiBody({
    type: [Types.ObjectId],
    description: 'assign staff to clinic request body',
  })
  //assign staff to clinic
  @Patch('assign-staff/:id')
  async assignStaffToClinic(
    @Param('id') id: string,
    @Body() staffId: { staffId: Types.ObjectId[] },
  ): Promise<ClinicDocument> {
    return await this.clinicService.assignStaffToClinic(id, staffId.staffId);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets a single clinic by id',
  })
  //get clinic by id
  @Get(':id')
  async getClinicById(@Param('id') id: string): Promise<ClinicDocument> {
    return await this.clinicService.getClinicById(id);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'delete clinic by id',
  })
  //delete clinic
  @Delete(':id')
  async deleteClinic(@Param('id') id: string): Promise<string> {
    return await this.clinicService.deleteClinic(id);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'remove staff from clinic by id',
  })
  @ApiBody({
    type: [Types.ObjectId],
    description: 'remove staff from clinic request body',
  })
  //remove staff from clinic
  @Patch('remove-staff/:id')
  async removeStaffFromClinic(
    @Param('id') id: string,
    @Body() staffId: { staffId: Types.ObjectId[] },
  ): Promise<ClinicDocument> {
    return await this.clinicService.removeStaffFromClinic(id, staffId.staffId);
  }

  //get all clinics
  @Get()
  async getAllClinics(): Promise<ClinicDocument[]> {
    return await this.clinicService.getAllClinics();
  }
}