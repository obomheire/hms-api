import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { CardStatusEnum } from "../enum/card.enum";

export class CardDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    type: string;

    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    user: string;

    @ApiPropertyOptional()
    @IsString()
    @IsEnum(CardStatusEnum)
    @IsOptional()
    status: CardStatusEnum;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    token: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    default: boolean;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    meta: object;

    @ApiPropertyOptional()
    @IsEmail()
    @IsOptional()
    email: string;


    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    signature: string;
}