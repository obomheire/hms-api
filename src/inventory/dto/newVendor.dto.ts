import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VendorStatusEnum } from '../enum/vendor.enum';

class vendorDetailsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vendorName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({
    enum: VendorStatusEnum,
    enumName: 'VendorStatusEnum',
  })
  @IsEnum(VendorStatusEnum)
  @IsOptional()
  status?: VendorStatusEnum;
}

class ContactPersonDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  emailAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

class PaymentDetailsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  terms: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}

export class NewVendorDto {
  @ApiProperty({ type: () => vendorDetailsDto })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => vendorDetailsDto)
  vendorDetails: vendorDetailsDto;

  @ApiProperty({ type: () => ContactPersonDto })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => ContactPersonDto)
  contactPerson: ContactPersonDto;

  @ApiProperty({ type: () => PaymentDetailsDto })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails: PaymentDetailsDto;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  addProduct: string[];

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateNewVendorDto extends PartialType(NewVendorDto) {}

export class FilterVendorDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  startDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  endDate: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  status: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  limit: number = 10;
}
