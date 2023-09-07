import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { BloodGroupEnum } from 'src/utils/enums/bloodGroup.enum';
import { GenotypeEnum } from 'src/utils/enums/genotype.enum';

export class MedicalRecordDto {
  
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  heartRate?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bloodPressure?: string;

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
  glucose?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  treatment?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  genotype?: GenotypeEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bloodGroup?: BloodGroupEnum;
}
