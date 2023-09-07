import { ApiPropertyOptional } from '@nestjs/swagger';
import {IsString, IsOptional, IsNumber} from 'class-validator'

export class InvestigationResultDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  testHeading?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  testParam?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  testRes?: string;
}