import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { page } from "pdfkit";
import { disputeAccountRequsitionEnum } from "src/utils/enums/requisitionStatus";
import { DisputeStatus } from "../enum/dispute.enum";
import { ReasonForRefundEnum } from "../enum/refund.enum";

export class CreateDisputeDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    patient: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    amount: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes: string;

    @ApiProperty({
    enum: ReasonForRefundEnum,
    enumName: 'ReasonForRefundEnum',
    })
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    transactionId: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    transactionAmount: number;
}

export class ApproveOrDeclineDisputeDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    status: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    comment: string;

    @ApiPropertyOptional({
        enum: DisputeStatus,
        enumName: 'DisputeStatus',
    })
    // @IsEnum(DisputeStatus)
    @IsOptional()
    approvalStatus: string;

}

export class AccountFilterDto {
    @ApiPropertyOptional({
        enum: ['pharmacy', 'inventory'],
    })
    @IsEnum([
        'pharmacy',
        'inventory',
    ])
    @IsOptional()
    department: string;

    @ApiPropertyOptional()
    @IsNumber()
    page: number = 1;

    @ApiPropertyOptional()
    @IsNumber()
    limit: number = 10;

    @ApiPropertyOptional({
        enum: disputeAccountRequsitionEnum,
        enumName: 'disputeAccountRequsitionEnum',
    })
    @IsOptional()
    @IsEnum(disputeAccountRequsitionEnum)
    status?: disputeAccountRequsitionEnum

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    search?: string;
}