import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { TestStatusEnum } from 'src/utils/enums/patients/testStatus.enum';
import { InvestigationEntity } from 'src/patients/schema/investigation.schema';
import { Type } from 'class-transformer';

export class InvestigationDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvestigationDto)
  investigations: CreateInvestigationDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  patient: string
}



export class CreateInvestigationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  test?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}
export class UpdateInvestigationDto extends PartialType(CreateInvestigationDto) {}

export class CreateIndividualInvestigationDto extends CreateInvestigationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date: string;
}

export class IndividualInvestigationDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndividualInvestigationDto)
  investigations: CreateIndividualInvestigationDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  patient: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference: string;
}

export class InvestigationReturn {
  @IsArray()
  investigations: InvestigationEntity[];
  @IsNumber()
  count: number;
  @IsNumber()
  totalPages: number;
  @IsNumber()
  currentPage: number;
}

export class InvestigationResultDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  testHeading?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  testParam: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  testRes?: string;
}
