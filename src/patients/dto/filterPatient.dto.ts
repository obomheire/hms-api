import { ApiPropertyOptional } from '@nestjs/swagger';
import {IsString, IsOptional, IsNumber, IsEnum} from 'class-validator';
import { headApprovalEnum } from 'src/utils/enums/requisitionStatus';
import { AdmissionStatusEnum } from '../enum/admissionStatus.enum';

export class FilterPatientDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  startDate?: string | Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  limit?: number = 15;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: AdmissionStatusEnum, example: AdmissionStatusEnum.OUTPATIENT })
  AdmissionStatusEnum: AdmissionStatusEnum;
  @IsEnum(AdmissionStatusEnum)
  @IsString()
  @IsOptional()
  status?: AdmissionStatusEnum;

  @ApiPropertyOptional()
  @IsEnum(headApprovalEnum)
  @IsOptional()
  accountingStatus?: headApprovalEnum;
}