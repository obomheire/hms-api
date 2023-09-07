import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    headOfDept?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    wards?: string;

    @ApiPropertyOptional()
    @IsOptional()
    staff?: string[];

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    clinics?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    units?: string;
}

export class UpdateDepartmentDto extends PartialType(DepartmentDto) {}