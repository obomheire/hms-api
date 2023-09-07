import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate } from 'class-validator'; 

export class ScheduleDischargeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dischargeDate: Date;
}