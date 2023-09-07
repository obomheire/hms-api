import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitItem } from '../enum/lab.enum';

export class CreateLabStockDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({
    enum: UnitItem,
    example: UnitItem.PIECE,
  })
  @IsEnum(UnitItem)
  @IsNotEmpty()
  unitOfItem: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location: string;
}

export class UpdateLabStockDto extends PartialType(CreateLabStockDto) {}