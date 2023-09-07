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
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { headApprovalEnum, requisitionStatusEnum } from 'src/utils/enums/requisitionStatus';

export class approveRequisitionDto {
  @ApiProperty({
    enum: requisitionStatusEnum,
    example: requisitionStatusEnum.APPROVED,
  })
 
  @IsEnum(requisitionStatusEnum)
  requisitionStatus: requisitionStatusEnum;
}

class inventoryDetailsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productType: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  unitCost: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

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
  phoneNumber: string;

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

  @ApiProperty()
  @IsString()
  @IsOptional()
  country: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  state: string;
}

class shippiongDetailsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

class costDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  subTotalCost: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  shippingCost: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  otherCost: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  salesTax: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  salesPercentage: string;
}

export class itemRequisitionDto {
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemCategory: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ type: () => inventoryDetailsDto })
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => inventoryDetailsDto)
  inventoryDetails: inventoryDetailsDto[];

  @ApiProperty({ type: () => costDto })
  @IsDefined()
  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => costDto)
  cost: costDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  requesterNote: string;

  @ApiProperty({ type: () => vendorDetailsDto })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => vendorDetailsDto)
  vendorDetails: vendorDetailsDto;

  @ApiProperty({ type: () => shippiongDetailsDto })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => shippiongDetailsDto)
  shippiongDetails: shippiongDetailsDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  additionalInfo: string;
}

export class UpdateItemRequisitionDto extends PartialType(itemRequisitionDto) {}


export class FilterBodyDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  startDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  endDate: string;

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

  @ApiPropertyOptional({
    enum: headApprovalEnum,
    example: headApprovalEnum.APPROVED,
  })
  @IsEnum(headApprovalEnum)
  @IsOptional()
  status: headApprovalEnum;

  @ApiPropertyOptional({
    enum: ['pharmacy', 'inventory'],
    example: 'pharmacy',
  })
  @IsEnum(['pharmacy', 'inventory'])
  @IsOptional()
  department: string;

}
