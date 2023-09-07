import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Types } from 'mongoose';
import { PrescriptionDto } from '../../utils/dtos/patients/prescription.dto';
import { PharmacyPrescriptionEntity } from '../schema/pharmacyPrescription.schema';

export class PharmacyPrescriptionDto {
  @ApiProperty({ type: () => PrescriptionDto })
  @IsArray()
  @Type(() => PrescriptionDto)
  @ValidateNested({ each: true })
  items: PrescriptionDto[];

  // @IsString()
  // doctor: Types.ObjectId;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  patient: Types.ObjectId;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isRefill: boolean;
}

export class CreateRequestDto extends PartialType(PharmacyPrescriptionDto) {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalCost: number
}




export class UpdatePharmacyPrescriptionDto extends PartialType(
  PharmacyPrescriptionDto,
) {}

export class PharmacyPrescriptionReturn {
  @IsArray()
  prescriptions: PharmacyPrescriptionEntity[];
  @IsNumber()
  count: number;
  @IsNumber()
  totalPages: number;
  @IsNumber()
  currentPage: number;
}
