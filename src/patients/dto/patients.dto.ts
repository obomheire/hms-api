import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsArray,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { AddressDto } from 'src/utils/dtos/address.dto';
import { NextOfKinDto } from 'src/utils/dtos/nextOfKin.dto';
import { AdmissionStatusEnum } from '../enum/admissionStatus.enum';
import { PayerDetailsDto } from 'src/utils/dtos/payerDetails.dto';
import { Type } from 'class-transformer';
import { MaritalStatusEnum } from 'src/utils/enums/maritalStatus.enum';
import { BloodGroupEnum } from 'src/utils/enums/bloodGroup.enum';
import { GenotypeEnum } from 'src/utils/enums/genotype.enum';
import { GenderEnum } from 'src/utils/enums/gender.enum';
import { MedicalRecordDto } from './medicalRecord.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientEntity } from '../schema/patients.schema';

export class CreatePatientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  hmoNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  religion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gender?: GenderEnum;

  @ApiPropertyOptional({
    enum: GenotypeEnum,
    enumName: 'GenotypeEnum',
    example: GenotypeEnum.AA,
  })
  @IsEnum(GenotypeEnum)
  @IsOptional()
  genotype?: GenotypeEnum;

  @ApiPropertyOptional({
    enum: BloodGroupEnum,
    enumName: 'BloodGroupEnum',
    example: BloodGroupEnum.A_POSITIVE,
  })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiPropertyOptional({
    enum: MaritalStatusEnum,
    enumName: 'MaritalStatusEnum',
    example: MaritalStatusEnum.SINGLE,
  })
  @IsEnum(MaritalStatusEnum)
  @IsOptional()
  maritalStatus?: MaritalStatusEnum;

  @ApiPropertyOptional({
    enum: AdmissionStatusEnum,
    enumName: 'AdmissionStatusEnum',
    example: AdmissionStatusEnum.ADMITTED,
  })
  @IsString()
  @IsOptional()
  admissionStatus?: AdmissionStatusEnum;

  // @ApiPropertyOptional()
  // @IsString()
  // @IsOptional()
  // ward?: string;

  // @ApiPropertyOptional()
  // @IsString()
  // @IsOptional()
  // bed?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ type: () => AddressDto })
  @Type(() => AddressDto)
  @ValidateNested()
  residentialAddress?: AddressDto;

  @ApiProperty({ type: () => AddressDto })
  @Type(() => AddressDto)
  @ValidateNested()
  permanentAddress?: AddressDto;

  @ApiProperty({ type: () => NextOfKinDto })
  @Type(() => NextOfKinDto)
  @ValidateNested()
  nextOfKin?: NextOfKinDto;

  @ApiProperty({ type: () => PayerDetailsDto })
  @Type(() => PayerDetailsDto)
  @ValidateNested()
  payerDetails?: PayerDetailsDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  doctorInCharge?: string;

  // @ApiPropertyOptional()
  // @IsString()
  // @IsOptional()
  // clinic?: string;

  // @ApiProperty({ type: () => MedicalRecordDto })
  // @Type(() => MedicalRecordDto)
  // @ValidateNested()
  // healthRecords?: MedicalRecordDto;

  // @IsString()
  // @IsOptional()
  // medicalRecords: Types.ObjectId;
  @IsString()
  @IsOptional()
  patientImage: string;
}

export class UpdatePatientDto extends PartialType(OmitType(CreatePatientDto, ['email', 'doctorInCharge'])) {}

export class PatientReturn {
  @IsArray()
  patients: PatientEntity[];
  @IsNumber()
  count: number;
  @IsNumber()
  totalPages: number;
  @IsNumber()
  currentPage: number;
}




export class CreatePatientLoginDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class PatientLoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ID: string;
}

export class ForgotPasswordDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class PatientResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}