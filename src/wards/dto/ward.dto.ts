import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  headOfWard: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalBeds: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  patient: string;

  @ApiPropertyOptional()
  @IsOptional()
  staff: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department: string;

  @ApiPropertyOptional()
  @IsOptional()
  amount: string;
}

export class UpdateWardDto extends PartialType(CreateWardDto) {}