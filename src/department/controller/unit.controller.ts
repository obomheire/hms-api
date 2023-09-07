import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FilterQuery, Types } from 'mongoose';
import { CreateUnitDto, UpdateUnitDto } from '../dto/unit.dto';
import { UnitService } from '../service/unit.service';

@ApiBearerAuth("Bearer")
@ApiTags('Department Unit')
@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @ApiBody({
    type: CreateUnitDto,
    description: 'Create unit request body',
  })
  @Post('create-unit')
  createUnit(@Body() createUnitDto: CreateUnitDto) {
    return this.unitService.createUnit(createUnitDto);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Update unit by id',
  })
  @ApiBody({
    type: UpdateUnitDto,
    description: 'Update unit request body',
  })
  @Patch('update-unit/:id')
  updateUnit(@Param('id') id: string, @Body() body: UpdateUnitDto) {
    return this.unitService.updateUnit(id, body);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Assign staff to unit by id',
  })
  @ApiBody({
    type: [Types.ObjectId],
    description: 'Assign staff to unit request body',
  })
  //assign staff to unit
  @Patch('assign-staff/:id')
  async assignStaffToUnit(
    @Param('id') id: string,
    @Body() staffId: { staffId: Types.ObjectId[] },
  ) {
    return await this.unitService.assignStaffToUnit(id, staffId.staffId);
  }

  @Get('get-all-units')
  getAllUnits() {
    return this.unitService.getAllUnits();
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Transfer staff to other unit by id',
  })
  @ApiBody({
    type: Types.ObjectId,
    description: 'Transfer staff to other unit request body',
  })
  @Post('transfer-staff-to-unit/:id')
  transferStaffToUnit(
    @Param('id') id: string,
    @Body() body: { staffId: Types.ObjectId; newUnitId: Types.ObjectId },
  ) {
    return this.unitService.transferStaffToUnit(
      id,
      body.staffId,
      body.newUnitId,
    );
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Get unit by id',
  })
  //get unit by id
  @Get('get-unit-by-id/:id')
  getUnitById(@Param('id') id: string) {
    return this.unitService.getUnitById(id);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Delete unit by id',
  })
  //delete unit
  @Delete('delete-unit/:id')
  deleteUnit(@Param('id') id: string) {
    return this.unitService.deleteUnit(id);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Remove staff from unit unit by id',
  })
  @ApiBody({
    type: Types.ObjectId,
    description: 'Remove staff from unit request body',
  })
  //remove staff from unit
  @Patch('remove-staff/:id')
  removeStaffFromUnit(
    @Param('id') id: string,
    @Body() staffId: { staffId: Types.ObjectId[] },
  ) {
    return this.unitService.removeStaffFromUnit(id, staffId.staffId);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Get all staff in unit by id',
  })
  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'Search staff in unit',
  })
  //we want to get all staff in a unit and be able to search by firstName and lastName
  @Get('get-all-staff-in-unit/:id')
  getAllStaffInUnit(@Param('id') id: string, @Query('search') search: string) {
    return this.unitService.getStaffInUnit(id, search);
  }
}
