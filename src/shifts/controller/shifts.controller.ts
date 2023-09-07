import { Controller, Post, Get, Patch, Param, Query, Delete, Body } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateShiftsDto, UpdateShiftsDto } from '../dto/shifts.dto';
import { ShiftDocument } from '../schema/shifts.schema';
import { ShiftsService } from '../service/shifts.service';

@ApiTags('Shifts')
@ApiBearerAuth("Bearer")
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftService: ShiftsService) {}
  //create shifts

  @ApiBody({
    type: UpdateShiftsDto,
    description: 'update shift request body',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'update shift by id',
  })
  //update shifts
  @Patch('update-shift/:id')
  async updateShifts(
    @Body() shifts: UpdateShiftsDto,
    @Param('id') id: string,
  ): Promise<ShiftDocument> {
    return await this.shiftService.updateShifts(shifts, id);
  }

  //get all shifts
  @Get()
  async getAllShifts(): Promise<ShiftDocument[]> {
    return await this.shiftService.getAllShifts();
  }

  @ApiBody({
    type: UpdateShiftsDto,
    description: 'adjust shift request body',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'adjust shift by id',
  })
  //adjust shift
  @Patch('adjust-shift/:id')
  async adjustShift(
    @Body() shifts: UpdateShiftsDto,
    @Param('id') id: string,
  ): Promise<ShiftDocument> {
    return await this.shiftService.adjustShifts(shifts, id);
  }
}
