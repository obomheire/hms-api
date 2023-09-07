import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ReferPatientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  referredTo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  referredBy: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clinic?: string;
}