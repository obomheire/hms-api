import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { FollowUpStatusEnum, TakeOrSkipDoses } from "../enum/follow-up-status.enum";

export class FollowUpDto {
    @ApiPropertyOptional()
    @IsString()
    @IsNotEmpty()
    visitId: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description: string;

    @ApiPropertyOptional()
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    followUpDate: Date;
}

export class TakeOrSkipDosesDto {
    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    dose: string[]

    @ApiProperty({
        enum: TakeOrSkipDoses,
        enumName: 'TakeOrSkipDoses',
        example: TakeOrSkipDoses.TAKE,
    })
    @IsEnum(TakeOrSkipDoses)
    @IsNotEmpty()
    status: string;
}

export class AcceptOrRejectFollowUpDto {
    @ApiProperty({
        enum: FollowUpStatusEnum,
        enumName: 'FollowUpStatusEnum',
        example: FollowUpStatusEnum.ACCEPTED,
    })
    @IsEnum(FollowUpStatusEnum)
    @IsNotEmpty()
    status: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description: string;
}