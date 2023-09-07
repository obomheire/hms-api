import {IsString, IsOptional, IsNotEmpty} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class CreateClinicDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  staff: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  headOfClinic: string;
}

export class UpdateClinicDto extends PartialType(CreateClinicDto) {}