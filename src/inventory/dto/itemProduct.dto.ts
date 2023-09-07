import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  ArrayNotEmpty,
  ValidateNested,
  IsArray,
  IsEnum,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { DrugUnitEnum } from '../../pharmacy/enum/unit.enum';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ItemProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemType: string;

  @ApiProperty({ enum: DrugUnitEnum, example: DrugUnitEnum.CAPSULE })
  @IsEnum(DrugUnitEnum)
  unitType: DrugUnitEnum;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // genericName: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // strength: string;

  // @ApiPropertyOptional()
  // @IsNumber()
  // @IsOptional()
  // availableQuantity: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brandName: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  unitCost: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  itemDescription: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  itemImage: string;
}

export class UpdateItemProductDto extends PartialType(ItemProductDto) {}

// class ItemDto {
//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   batchId: string;

//   @ApiPropertyOptional()
//   @IsNumber()
//   @IsOptional()
//   quantity: number;
// }

// export class DispenseDto {
//   @ApiProperty({ type: () => ItemDto })
//   @IsArray()
//   @ArrayNotEmpty()
//   @ValidateNested({ each: true })
//   @Type(() => ItemDto)
//   item: ItemDto[];

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   prescriptionId: string;

//   @ApiPropertyOptional()
//   @IsString()
//   @IsOptional()
//   isRefill: boolean;
// }

export class ItemBatchReturn {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  batchId: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantity: number;
}