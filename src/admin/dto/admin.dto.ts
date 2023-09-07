import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import Api from "twilio/lib/rest/Api";

export class HospitalProfileDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    name: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    address: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    phone: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    email: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    website: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    country: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    state: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    city: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    zipCode: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    about: string;  
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()  
    weekDayOpeningHours: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()  
    weekDayClosingHours: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()  
    weekendOpeningHours: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()  
    weekendClosingHours: string;
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    closingHours: string;
}

export class UpdateHospitalProfileDto extends PartialType(HospitalProfileDto){}