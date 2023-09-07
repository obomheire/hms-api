import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DischargePatientDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dischargeSummary: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dischargeType: string;
}