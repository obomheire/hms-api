import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { BloodGroupEnum } from 'src/utils/enums/bloodGroup.enum';
import { GenotypeEnum } from 'src/utils/enums/genotype.enum';

export class VitalSignsDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  urineOutput?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  diastolicBloodPressure?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  systolicBloodPressure?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  respiratoryRate?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  heartRate?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  glucose?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiPropertyOptional()
  @IsEnum(GenotypeEnum)
  @IsOptional()
  genotype?: GenotypeEnum;

  @ApiPropertyOptional()
  @IsEnum(BloodGroupEnum)
  @IsOptional()
  bloodGroup?: BloodGroupEnum;
}