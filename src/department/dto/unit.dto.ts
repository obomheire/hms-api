import {IsString, IsOptional, IsNotEmpty} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  staff: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headOfUnit: string;
}

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}

