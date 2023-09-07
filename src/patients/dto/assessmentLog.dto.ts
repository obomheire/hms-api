import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DoctorNoteDto } from 'src/utils/dtos/patients/doctorNote.dto';

export class AssessmentLogDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assessment: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @ValidateNested({ each: true })
  responses: ResponseDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  notes: DoctorNoteDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  visitId: string;
}

export class UpdateAssessmentLogDto extends PartialType(AssessmentLogDto) {}

export class ResponseDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  response: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  responseBy: string;
}

export class AssessmentLogInput {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  tags?: string[];
}
