import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsAlpha, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { TransactionTypeNameEnum, TransactionTypeStatusEnum } from "../enums/transaction-type.enum";

export class TransactionTypeDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({
        enum: TransactionTypeNameEnum,
        default: TransactionTypeNameEnum.CONSULTATION
        
    })
    @IsNotEmpty()
    @IsEnum(TransactionTypeNameEnum)
    type: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @IsEnum(TransactionTypeStatusEnum)
    status: TransactionTypeStatusEnum;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiPropertyOptional()
    @IsMongoId()
    @IsOptional()
    ward: string;

    @ApiPropertyOptional()
    @IsMongoId()
    @IsOptional()
    specialty: string;

}

export class UpdateTransactionTypeDto extends PartialType(TransactionTypeDto){}