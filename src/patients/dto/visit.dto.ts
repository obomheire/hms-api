import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { CreateVisitItemDto } from "./visit-item.dto";


export class CreateVisitDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    patientId: string;

    // @ApiProperty()
    // @IsArray()
    // @ValidateNested({each: true})
    // visitDetails: Types.ObjectId[]

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    visitNote?: string;
}
export class UpdateVisitDto extends PartialType(CreateVisitDto) {}

// export class VistControllerDto {
//     @ApiPropertyOptional({ type: () => CreateVisitItemDto })
//     @Type(() => CreateVisitItemDto)
//     @ValidateNested()
//     @IsOptional()
//     data1: CreateVisitItemDto;
  
//     @ApiPropertyOptional({ type: () => UpdateVisitDto })
//     @Type(() => UpdateVisitDto)
//     @ValidateNested()
//     @IsOptional()
//     data2: UpdateVisitDto;
//   }

export class CalendarFilterDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    weekly: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    monthly: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    yearly: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    startDate: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    endDate: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    year: string;
}


