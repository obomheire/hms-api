import {IsString, IsOptional, IsNotEmpty} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShiftsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  startTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endTime: string;
}

export class UpdateShiftsDto extends PartialType(CreateShiftsDto) {}