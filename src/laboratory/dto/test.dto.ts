import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsAlpha,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { TestStockDto } from './testStock.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  testName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  testType: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  testCode: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  rate: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  duration: string;

  @ApiPropertyOptional({ type: () => TestStockDto })
  @Type(() => TestStockDto)
  @ValidateNested()
  stock?: TestStockDto[];
}

export class UpdateTestDto extends PartialType(CreateTestDto) {}


export class TestPagination {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit: number = 15

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  page: number = 1
}