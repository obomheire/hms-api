import { IsString, IsOptional, IsNotEmpty, IsArray } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  shifts: string[];

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  staffs: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiPropertyOptional()
  @IsOptional()
  startDate: string | Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate: string | Date;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  days: string[];
}
export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {}

export class SwapShiftsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  staffs: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shifts: string;
}

export class DateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shift: Types.ObjectId;
}
