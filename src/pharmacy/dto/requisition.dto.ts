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
import { requisitionStatusEnum } from 'src/utils/enums/requisitionStatus';
import { DrugUnitEnum } from '../enum/unit.enum';
import { ReasonDisputeEnum } from 'src/utils/enums/dispute-requisition.enum';

export class approveRequisitionDto {
  @ApiProperty({
    enum: requisitionStatusEnum,
    example: requisitionStatusEnum.APPROVED,
  })
  @IsEnum(requisitionStatusEnum)
  requisitionStatus: requisitionStatusEnum;
}

class drugDetailsDto {
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

  @ApiProperty({
    enum: DrugUnitEnum,
    example: DrugUnitEnum.PIECE,
  })
  @IsString()
  @IsNotEmpty()
  unit: DrugUnitEnum;
}

class vendorDetailsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vendorName: string;

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
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  subTotalCost: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  shippingCost: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  otherCost: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  salesTax: number;
}

export class requisitionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  location: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  dueDate: string;

  @ApiProperty({ type: () => drugDetailsDto })
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => drugDetailsDto)
  drugDetails: drugDetailsDto[];

  @ApiProperty({ type: () => costDto })
  @IsDefined()
  @IsNotEmptyObject()
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

export class UpdaterequisitionDto extends PartialType(requisitionDto) {}

export class RequisitionDisputeDto {
  @ApiProperty({
    enum: ReasonDisputeEnum,
    example: ReasonDisputeEnum.INCORRECT_QUANTITY,
  }
  )
  @IsEnum(ReasonDisputeEnum)
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comment: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // requisition: string;
}
