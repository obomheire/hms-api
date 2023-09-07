import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { AllergiesDto } from 'src/utils/dtos/patients/allergies.dto';
import { AssessmentLogDto } from 'src/utils/dtos/patients/assessmentLog.dto';
import { DoctorNoteDto } from 'src/utils/dtos/patients/doctorNote.dto';
import { CreateInvestigationDto } from 'src/patients/dto/investigation.dto';
import { PrescriptionDto } from 'src/utils/dtos/patients/prescription.dto';
import { RecommendationDto } from 'src/utils/dtos/patients/recommendation.dto';
import { VitalSignsDto } from 'src/utils/dtos/patients/vitalSigns.dto';
import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssessmentLogInput } from './assessmentLog.dto';
import { PharmacyPrescriptionDto } from './pharmacyPrescription.dto';

export class CreateVisitItemDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  visitNotes: string;

  @ApiPropertyOptional({ type: () => AllergiesDto })
  @Type(() => AllergiesDto)
  @ValidateNested({ each: true})
  @IsOptional()
  @IsArray()
  allergies?: AllergiesDto[];

  @ApiPropertyOptional({ type: () => VitalSignsDto })
  @Type(() => VitalSignsDto)
  @ValidateNested()
  @IsOptional()
  vitalSigns?: VitalSignsDto;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  investigation?: Types.ObjectId[];

  @ApiPropertyOptional({ type: () => RecommendationDto })
  @Type(() => RecommendationDto)
  @ValidateNested({ each: true})
  @IsOptional()
  recommendation?: RecommendationDto[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  prescription?: Types.ObjectId[];

  // @ApiPropertyOptional({ type: () => PharmacyPrescriptionDto })
  // @Type(() => PharmacyPrescriptionDto)
  // @ValidateNested()
  // @IsOptional()
  // prescription?: PharmacyPrescriptionDto;

  // @ApiPropertyOptional({ type: () => CreateInvestigationDto })
  // @Type(() => CreateInvestigationDto)
  // @ValidateNested({ each: true })
  // @IsOptional()
  // @IsArray()
  // investigation?: CreateInvestigationDto[];

  // @ApiPropertyOptional()
  // @IsOptional()
  // assessmentLog?: Types.ObjectId;
  @ApiPropertyOptional({ type: () => AssessmentLogInput})
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true})
  @Type(() => AssessmentLogInput)
  assessmentLog?: AssessmentLogInput[];
}
export class UpdateVisitItemDto extends PartialType(CreateVisitItemDto) {}