import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'

export class TestStockDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  stockItem: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unit: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantity: number;
}