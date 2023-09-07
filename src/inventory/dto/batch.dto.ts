import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemBatch } from '../schema/batch.schema';

export class CreateItemBatchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  product: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // unit: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sellingPrice: number;

  // @ApiPropertyOptional()
  // @IsString()
  // @IsOptional()
  // vendor?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  purchasePrice: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expiryDate: string;
}

export class ItemBatchReturn {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  batches: ItemBatch[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  count: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  totalPages: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  currentPage: number;
}
