import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AssessmentLogDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assessment?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  doctor?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}