import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentFrequencyEnum } from '../enum/appointment.enum';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  doctor: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  patient: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  timeAlot: number;

  @ApiPropertyOptional({ enum: AppointmentFrequencyEnum, example: AppointmentFrequencyEnum.DAILY })
  @IsEnum(AppointmentFrequencyEnum)
  @IsOptional()
  frequency: AppointmentFrequencyEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department: string;

  @ApiPropertyOptional()
  @IsOptional()
  endFrequency: string;
}

export class RescheduleAppointmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  doctor: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  patient: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department: string;
}



// export class RescheduleAppointmentDto extends PartialType(CreateAppointmentDto) {}

export class FollowUpAppointmentDto extends PartialType(OmitType(CreateAppointmentDto, ['endFrequency', 'department', 'frequency', 'timeAlot', 'endDate'])) {}