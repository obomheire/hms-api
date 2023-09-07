import { IsString, IsOptional, IsNotEmpty, IsAlpha, IsNumber } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalQuantity: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unit: string;
}

export class UpdateStockDto extends PartialType(CreateStockDto) {}