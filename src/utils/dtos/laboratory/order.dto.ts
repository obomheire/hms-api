import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReasonDeclineEnum } from 'src/utils/enums/reason-decline.enum';
import { ApprovalEnum } from 'src/utils/enums/approval.enum';
import { DrugUnitEnum } from 'src/pharmacy/enum/unit.enum';
import { Type } from 'class-transformer';


export class ItemorderDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    item: string
    
    @ApiPropertyOptional({
        enum: DrugUnitEnum,
        example: DrugUnitEnum.CAPSULE,
    })
    @IsEnum(DrugUnitEnum)
    @IsOptional()
    unitOfItem: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    quantity: number

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    image?: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    batchId?: string
}
export class CreateOrderDto {
    // @ApiProperty()
    // @IsString()
    // @IsNotEmpty()
    // item: string
    
    // @ApiPropertyOptional({
    //     enum: DrugUnitEnum,
    //     example: DrugUnitEnum.CAPSULE,
    // })
    // @IsEnum(DrugUnitEnum)
    // @IsOptional()
    // unitOfItem: string

    // @ApiProperty()
    // @IsNumber()
    // @IsNotEmpty()
    // quantity: number

    // @ApiPropertyOptional()
    // @IsString()
    // @IsOptional()
    // image?: string

    @ApiProperty( {type: [ItemorderDto]})
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => ItemorderDto)
    // @ValidateNested({each: true})
    items: ItemorderDto[]

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    note?: string

    @ApiPropertyOptional({
        enum: ReasonDeclineEnum,
        enumName: 'ReasonDeclineEnum',
        description: 'Reason for declining the order',
    })
    @IsEnum(ReasonDeclineEnum)
    @IsOptional()
    reasonForDecline?: ReasonDeclineEnum

    @ApiPropertyOptional({
        enum: ApprovalEnum,
        enumName: 'ApprovalEnum',
        description: 'Approval status of the order',
    })
    @IsOptional()
    approval?: string
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

export class GrantorRejectDto {
    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    orderIds: string[]

    @ApiProperty({
        enum: ApprovalEnum,
        enumName: 'ApprovalEnum',
        description: 'Approval status of the order',
    })
    @IsEnum(ApprovalEnum)
    @IsNotEmpty()
    approval: string
}