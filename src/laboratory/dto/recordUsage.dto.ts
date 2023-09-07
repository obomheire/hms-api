import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordUsageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  item: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // unit: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason: string;

}
export class UpdateRecordUsageDto extends PartialType(RecordUsageDto) {}
