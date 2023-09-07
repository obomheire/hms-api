import { IsString, IsNotEmpty, IsOptional, IsNumber, ArrayNotEmpty, ValidateNested, IsArray } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { DrugUnitEnum } from '../enum/unit.enum';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  drugName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  drugType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unit: DrugUnitEnum;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  genericName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  strength: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // availableQuantity: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brandName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  prodcutDescription: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  productImage: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

class ItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  batchId: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantity: number;
}

export class DispenseDto {
  @ApiProperty({ type: () => ItemDto })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  item: ItemDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prescriptionId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  isRefill: boolean;
}


export class ProductListDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  drugType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit: number = 15

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  page: number = 1

}