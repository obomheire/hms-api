import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TransactionTypeNameEnum } from 'src/transaction-types/enums/transaction-type.enum';
import { PaymentMethodEnum } from 'src/utils/enums/paymentMethod.enum';
import { PaymentStatusEnum } from '../enum/payment.enum';
import { CardPayload } from './car-payload.dto';

export class PaymentDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency: string = 'NGN';

}

export class VerifyPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty()
  // @IsString()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  currency: string = 'NGN';
}


export class PaymentResponseDto {
  @IsString()
  @IsNotEmpty()
  paymentUrl: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  status: number;

  @IsString()
  access_code: string;
}

export class PaymentWebhookDto {
  @IsString()
  @IsNotEmpty()
  event: string;

  @IsOptional()
  data: any;
}

export class CreatePaymentDto {
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty()
  patient: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  itemToPayFor: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEnum([
    'InvestigationEntity',
    'PharmacyPrescriptionEntity',
    'ProductOrderEntity',
  ])
  model: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(TransactionTypeNameEnum)
  transactionType: TransactionTypeNameEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalCost: number;
}

export class PaymentFromMobileOrder extends CreatePaymentDto {
  // @ApiProperty()
  // @IsNotEmpty()
  // @IsNumber()
  // totalCost: number;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsNumber()
  // paidAmount: number;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsNumber()
  // dueAmount: number;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  // paymentDate: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsEnum(PaymentMethodEnum)
  // paymentMethod: PaymentMethodEnum;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsMongoId()
  // hmoProvider: string;


  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsEnum(PaymentStatusEnum)
  // status: PaymentStatusEnum = PaymentStatusEnum.PAID;  

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reference: string;

  @ApiProperty()
  @IsNotEmpty()
  // @IsNumber()
  totalCost: number;

}

export class FilterPaymentListDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;
}



export class ProcessPaymentWithHmo{
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  paymentIds: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  hmoProvider: string;
}

export class ConfirmPaymentWithHmo{
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reference: string;


  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  paymentIds: string[];
}

export class RejectPaymentWithHmo{
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  paymentIds: string[];
}

export class ProcessPaymentWithCash{
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  paymentIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference: string;
}


export class CreatePaymentFromWardDto{
  @IsString()
  @IsNotEmpty()
  patient: string

  @IsNotEmpty()
  numberOfDays: number

  @IsNotEmpty()
  @IsString()
  ward: string
}