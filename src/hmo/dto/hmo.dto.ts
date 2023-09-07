import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class CreateHmoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    address: string;
    @ApiPropertyOptional()
    @IsEmail()
    @IsOptional()
    email: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    phoneNumber: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    logo: string;
}

export class UpdateHmoDto extends PartialType(CreateHmoDto) {}