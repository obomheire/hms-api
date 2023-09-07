import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Delete,
  Body,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateScheduleDto, DateDto } from '../dto/schedule.dto';
import { ScheduleService } from '../service/schedule.service';

@ApiTags('Shifts Schedule')
@ApiBearerAuth("Bearer")
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @ApiBody({
    type: CreateScheduleDto,
    description: 'creates a schedule request body',
  })
  @Post()
  createSchedule(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.scheduleShiftsToStaffs(createScheduleDto);
  }

  @ApiQuery({
    name: 'unitId',
    type: 'string',
    description: 'get schedules unit by id',
  })
  @Get('get-schedules-unit')
  getSchedulesByUnit(@Query('unitId') unitId: string) {
    return this.scheduleService.getSchedulesForUnit(unitId);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'exchange schedule by id',
  })
  @Patch('swap-schedule/:id')
  exchangeSchedule(@Param('id') id: string, @Body() staffId: string) {
    return this.scheduleService.exchangeSchedule(id, staffId);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'get schedule for a staff by id',
  })
  @Get('get-for-a-staff/:id')
  getScheduleForStaff(@Param('id') id: string) {
    return this.scheduleService.getScheduleByStaffId(id);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'get schedule by date range with id',
  })
  @ApiBody({
    type: DateDto,
    description: 'get schedule by date range request body',
  })
  @Post('get-schedule-by-date-range/:id')
  getScheduleByDateRange(@Param('id') id: string, @Body() body: DateDto) {
    return this.scheduleService.getScheduleByDateRange(id, body);
  }
}
