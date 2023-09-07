import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvestigationStockUsageDto } from './investigationStock.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvestigationResultDto } from 'src/patients/dto/investigation.dto';
import { RecordUsageDto } from './recordUsage.dto';

export class LaboratoryDto {
  // @ApiProperty({ type: () => InvestigationResultDto })
  // @Type(() => InvestigationResultDto)
  // @ValidateNested()

  // @IsOptional()
  // result: any;

  @ApiPropertyOptional({ type: () => RecordUsageDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordUsageDto)
  // @IsOptional()
  stockUsed: RecordUsageDto[];
}

