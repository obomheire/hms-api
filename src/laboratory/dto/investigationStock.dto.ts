import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvestigationStockUsageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  item: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  // @IsString()
  // @IsNotEmpty()
  // unit: string

  // @IsString()
  // @IsOptional()
  // reason: string
}
// export class UpdateRecordUsageDto extends PartialType(RecordUsageDto) {}