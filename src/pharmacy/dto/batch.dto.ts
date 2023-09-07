import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { DrugUnitEnum } from '../enum/unit.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductBatchEntity } from '../schema/batches.schema';

export class ProductBatchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  product: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // unit: DrugUnitEnum;

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

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  purchasePrice: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expiryDate: string;
}

export class ProductBatchReturn {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  batches: ProductBatchEntity[];

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


export class DispensePrescription {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prescriptionId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  batchId: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  arbitraryQuantity: number;
}

export class BillPrescriptionDto {
  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // prescriptionId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  batchId: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  arbitraryQuantity: number;
}