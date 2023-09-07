import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator"
import { PaymentMethodEnum } from "src/utils/enums/paymentMethod.enum"

export class AccountInput {
    @ApiPropertyOptional({ enum: PaymentMethodEnum })
    @IsEnum(PaymentMethodEnum)
    @IsOptional()
    method: PaymentMethodEnum

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    amountPaid: number
}

export class PendingDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    department?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string
}